// ============================================================================
// 56-patch-notes — The in-game patch notes: release history (PATCH_NOTES) and the
// collapsible renderer loadPatchNotes() behind the 📝 Patch Notes buttons.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

// NEWEST FIRST — add each release at the top. (This list used to live inside
// loadPatchNotes in 49-social-autonomy.js, with later releases appended at the end and
// the whole thing reversed, so the order came out scrambled.)
// Each entry:
//   version   YYYYMMDDHHMM of the release
//   date      "Month D, YYYY"
//   title     one line, emoji first
//   summary   optional, a sentence or two shown above the changes
//   changes   [{ category, items: [html strings] }] — lead items with
//             <strong>NEW:</strong> / <strong>FIXED:</strong> / <strong>CHANGED:</strong>;
//             an item starting with "• " renders as a sub-point of the one above.
const PATCH_NOTES = [
        {
            version: "202609261800",
            date: "September 26, 2026",
            title: "🧰 The Big Fix-Up — Saves, Images, Transfers & 40+ Fixes",
            summary:
                "A full audit of the game turned up a lot of quiet breakage. This patch fixes it: saves that lost progress, images that bloated every save, transfers that didn't move anyone, timers that never ran, and a long list of smaller bugs. It also adds the Save Manager changes you asked for, gallery controls and a rebuilt cheat panel.",
            changes: [
                {
                    category: "💾 Saves",
                    items: [
                        "<strong>FIXED:</strong> Loading a save from the Save Manager and then reloading the page threw away everything you'd played since the load. The loaded game now becomes your live game straight away.",
                        "<strong>NEW:</strong> Every named save has an <strong>Overwrite</strong> button, and <strong>+ Create New Save</strong> asks for a name.",
                        "<strong>NEW:</strong> A <strong>Playing</strong> badge marks the save you loaded or last saved to, and a <strong>💾 Save to \"…\"</strong> button at the top saves back into it in one click.",
                        "<strong>FIXED:</strong> The Quick Save button in the side panel wrote to the autosave instead of making a quick save, so Quick Load never found it. It now works like F5.",
                        "<strong>FIXED:</strong> Turning Autosave off didn't stop the game saving after most actions, and the switch forgot its setting on reload. Off now means only the Save button saves.",
                        "<strong>FIXED:</strong> Every load reset each employee's salary to the flat base pay for their level, wiping negotiated raises and flagging anyone above the garage as underpaid. Salaries now survive a load; existing saves are repaired once automatically.",
                        "<strong>FIXED:</strong> The Save Manager's Day column always said Day 0. It now shows the in-game date, and the list opens and searches faster.",
                        "<strong>FIXED:</strong> Exporting a save lost the list of names already used, so imported games could hand out duplicate names.",
                    ],
                },
                {
                    category: "🖼️ Images & Storage",
                    items: [
                        "<strong>CHANGED:</strong> Images are now stored once and shared by every save, instead of a full copy inside each save and every autosave snapshot. Saves are a fraction of the size and autosaving is quicker. Nothing changes on screen; exported saves still carry their images.",
                        "<strong>NEW — Gallery controls:</strong> tap ☆ to favourite a photo (favourites sit at the top, with a Favourites filter) and 🗑 to delete one. Deleting a photo that came from a post or chat removes it there too.",
                        "<strong>NEW — Settings → Data → Storage:</strong> see how much space images and each kind of save take, and clean up images no save uses any more.",
                        "<strong>FIXED:</strong> Broken-image icons wherever an image failed. The placeholder service the game relied on shut down; placeholders are now drawn by the game itself.",
                    ],
                },
                {
                    category: "💤 Offline Earnings",
                    items: [
                        "<strong>FIXED:</strong> Every reload paid out \"time away\" earnings for the whole of your last session and fast-forwarded the clock again. Time away is now measured from when you actually left, and switching tabs no longer counts.",
                        "<strong>CHANGED:</strong> While you're away, the game clock moves at half of real time (it was double).",
                    ],
                },
                {
                    category: "🏢 Transfers & the Corporate Ladder",
                    items: [
                        "<strong>FIXED:</strong> Transferring someone moved their seat on the ladder but left their location, product and pay behind. They now actually move, and pay follows the new role's market rate plus any raises they'd earned.",
                        "<strong>FIXED:</strong> The People tab's location filter only listed sites where someone already worked. It now lists every location you've opened.",
                        "<strong>FIXED:</strong> Managers hired before their ladder seat existed were never seated, so they couldn't be transferred or promoted. Existing saves fix themselves on load.",
                        "<strong>NEW:</strong> Promotions on the ladder get announced on the social feed again, and an <strong>↩️ Unassign</strong> button takes someone off their seat without firing them.",
                        "<strong>FIXED:</strong> Unlocking a new location now switches to its theme straight away and saves.",
                    ],
                },
                {
                    category: "⏳ Things That Take Days",
                    items: [
                        "<strong>FIXED:</strong> Anything meant to last a number of days never ended: a product closed for a Renovation stayed closed (and earned nothing), employees sent away by a story event never came back, and timed story effects ran forever. They now end on time, and anything stuck in your save clears at the next in-game midnight.",
                        "<strong>FIXED:</strong> Story beats, dynamic events and group idle conversations never actually triggered, because every autosave reset their timers. They run as designed now.",
                        "<strong>FIXED:</strong> Hire dates were stamped on the real clock instead of the game clock, skewing first paychecks and seniority.",
                    ],
                },
                {
                    category: "💬 Chat, Groups & Social",
                    items: [
                        "<strong>FIXED:</strong> Giving a gift in a group chat crashed; group gifts now get the same reactions, preferences and stat effects as private ones.",
                        "<strong>FIXED:</strong> With SFW mode on, asking for a spicy post crashed and the post was lost. It's now turned into a selfie before anything is written.",
                        "<strong>FIXED:</strong> Clear Chat left the old messages on screen; Request Image on a post did nothing; group Request Post never produced a post; tapping an @mention didn't jump to the message.",
                        "<strong>NEW:</strong> When someone asks you for money in the middle of a chat, you get the Accept / Counter / Deny card, just like when they ask out of the blue.",
                        "<strong>NEW:</strong> The ✏️ Custom action button (enable it with ⚙️) now asks what they should do. Groups get a ❔ button and <code>/help</code> listing every group command.",
                        "<strong>CHANGED:</strong> If someone posts about the same thing as a post from a few minutes earlier, the game asks for a different topic once.",
                        "<strong>FIXED:</strong> Manager bios were always written as if the hire were a woman; custom employees without a picture never got one; rehire welcome messages and gossip replies were always canned text.",
                        "<strong>FIXED:</strong> A dozen emojis showed as <code>�</code> (ladder level icons, some race names, the prestige lock and more).",
                    ],
                },
                {
                    category: "⚡ Cheats Panel",
                    items: [
                        "<strong>CHANGED:</strong> Rebuilt: wider, compact, grouped into cards. Broken buttons are fixed (unlocking locations/products threw errors; Hire All never found anyone).",
                        "<strong>NEW:</strong> Add or set cash in any unit, set influence, +10 product levels, +1 manager level, finish every running cycle, hire a manager for every empty product, make everyone available, skip to payday.",
                        "<strong>FIXED:</strong> Time skips now run payroll, schedules and events on the way. Stat multipliers only boost gains (5× used to multiply losses too), and the sliders that did nothing are gone.",
                    ],
                },
                {
                    category: "⚙️ Settings & Small Fixes",
                    items: [
                        "<strong>NEW:</strong> The social feed's posts-per-page slider is back (Settings → AI &amp; Performance).",
                        "<strong>FIXED:</strong> On a new game, no Office Policy button was highlighted.",
                        "<strong>FIXED:</strong> Expired flags are now cleared out daily instead of piling up in the save.",
                        "<strong>CHANGED:</strong> Patch notes are now newest-first and collapsible.",
                    ],
                },
            ],
        },
        {
            version: "202607271800",
            date: "July 27, 2026",
            title: "🎨 Themes & Accessibility",
            changes: [
                {
                    category: "🎨 Settings → Display",
                    items: [
                        "<strong>NEW:</strong> 13 themes — Midnight (the original), Daylight, Match System, High Contrast and Dimmed, plus Sepia Paper, Nordic, Crimson, Deep Ocean, Synthwave, Slate, Terminal and Amber CRT. Money green, loss red and warning amber keep their meaning in every theme.",
                        "<strong>NEW:</strong> Text size from 90% to 140%.",
                        "<strong>NEW:</strong> Accessibility switches: reduce motion, reduce glow, bigger tap targets, visible focus rings and a more readable font.",
                        "Your display choices are remembered separately from your saves, so they survive a reset and apply from the title screen.",
                    ],
                },
                {
                    category: "🔍 Readability",
                    items: [
                        "<strong>FIXED:</strong> Every screen and popup was checked for contrast in every theme; text on coloured buttons now picks light or dark ink by actual contrast.",
                        "<strong>FIXED:</strong> Two pieces of text were invisible on the dark theme: the game clock in the chat header and the auto-visualization note.",
                    ],
                },
            ],
        },
        {
            version: "202607171800",
            date: "July 17, 2026",
            title: "🐛 Bug Fix Patch — Prestige, Saves & Imports",
            changes: [
                {
                    category: "💥 Prestige & Saves — No More Crashes",
                    items: [
                        "<strong>FIXED:</strong> Prestige was hard-crashing for players with big, long-running saves — you couldn't prestige at all. Squashed for good, no matter how large your save has grown.",
                        "<strong>FIXED:</strong> Exporting a save could fail the exact same way on large saves. Exports now go through reliably.",
                    ],
                },
                {
                    category: "🎭 Character Import — Keeps What You Actually Set",
                    items: [
                        "<strong>FIXED:</strong> Importing a character used to quietly reset their grooming, ethnicity, and accessories back to random defaults. Imported characters now come through exactly as you made them.",
                    ],
                },
                {
                    category: "⚔️ Boss Fights",
                    items: [
                        "<strong>FIXED:</strong> Boss portraits turning into a broken-image icon after you prestige. Bosses get their artwork back right away now.",
                    ],
                },
                {
                    category: "📸 Photos",
                    items: [
                        "<strong>FIXED:</strong> Solo photo requests could occasionally render a random extra person lurking in the background. Solo means solo now.",
                    ],
                },
                {
                    category: "🎁 Gifts — Easier to Manage",
                    items: [
                        "<strong>NEW:</strong> Gift cards now show the description you crafted instead of hiding it — no more guessing what a gift actually says.",
                        "<strong>NEW:</strong> Edit buttons are labeled now (Add Image, Rewrite, Vault, Delete) instead of unlabeled icons nobody could decode.",
                    ],
                },
                {
                    category: "⚙️ Settings Cleanup",
                    items: [
                        '<strong>REMOVED:</strong> The "Animation Quality" slider in Settings — it never actually did anything. One less confusing dead control.',
                    ],
                },
                {
                    category: "💬 Community",
                    items: [
                        "<strong>NEW:</strong> Now and then, after a boss win or a prestige, a short note invites you to the Discord. Maybe Later or Don't Ask Again, your call.",
                    ],
                },
            ],
        },
        {
            version: "202606281200",
            date: "June 28, 2026",
            title: "📤 Export & Import Characters",
            changes: [
                {
                    category: "📤 Take a Character to Another Save",
                    items: [
                        "<strong>NEW:</strong> Export any character to a file from their profile (📤 Export) or the People list's ⋯ menu, and import them into any save from the custom-employee form.",
                        "Choose what comes along: their identity, personality, looks, stats and profile picture always do; the full gallery, social posts, conversation history and learned memories are optional, each with a count.",
                        "A summary shows what was exported or imported, including any fields filled in from an older export.",
                        "<strong>FIXED:</strong> Futa and trans characters were imported as female/male.",
                    ],
                },
            ],
        },
        {
            version: "202606261200",
            date: "June 26, 2026",
            title: "🐛 Bug Fix Patch — Groups, Prestige & Loading",
            changes: [
                {
                    category: "🐛 Fixes",
                    items: [
                        "<strong>FIXED:</strong> Opening a group froze the game for a moment every time (it ran a full save first).",
                        "<strong>FIXED:</strong> A failed prestige could leave the game half-prestiged. Prestige now rolls back cleanly if anything goes wrong.",
                        "<strong>FIXED:</strong> A crash while loading some saves, and a single broken or empty group taking the whole Groups tab down with it.",
                    ],
                },
            ],
        },
        {
            version: "202606241200",
            date: "June 24, 2026",
            title: "🪵 Console Log Control + Discord Fixes",
            changes: [
                {
                    category: "🪵 Settings → Logging",
                    items: [
                        "<strong>NEW:</strong> An in-game copy of the console, so you can see and share errors on mobile when reporting a bug, with switches to mute noisy categories.",
                    ],
                },
                {
                    category: "🐛 Fixes from the June playtest",
                    items: [
                        "<strong>FIXED:</strong> Social posts (and their images) stopped generating entirely after one bad post; requested posts also lost their captions.",
                        "<strong>FIXED:</strong> After a prestige, the group participant picker showed \"clones\" of rehired employees, and group members could silently disappear.",
                        "<strong>FIXED:</strong> Pose and position reset between consecutive images in a scene.",
                        "<strong>FIXED:</strong> A character's personal voice only kicked in from their second message.",
                    ],
                },
            ],
        },
        {
            version: "202606221200",
            date: "June 22, 2026",
            title: "💼 Payroll Overhaul, Accountants & Smarter Photos",
            changes: [
                {
                    category: "💼 Payroll",
                    items: [
                        "<strong>NEW:</strong> Salaries follow the market: pay scales with the role, the location and the product someone runs. Pay people below market for too long and they get an Underpaid chip, then start eyeing the door.",
                        "<strong>NEW — Accountants:</strong> hire dedicated accountants (each with traits like Forensic Eye or Expensive Taste) to process payroll. Staff they don't cover need a hands-on payroll run on Friday, or you can wave it through and risk paycheck errors.",
                        "<strong>NEW:</strong> Employees ask for raises (with a negotiation), request salary advances, and react to bonuses and missed pay with chips like Well Paid, Strapped or Passed Over.",
                        "<strong>NEW:</strong> Loans now come with a credit rating.",
                    ],
                },
                {
                    category: "🎁 Gifts",
                    items: [
                        "<strong>NEW:</strong> A gift inventory and a Vault for keeping gifts out of the way, plus a preview of how someone will react before you give it.",
                    ],
                },
                {
                    category: "📸 Photos",
                    items: [
                        "<strong>CHANGED:</strong> Photo requests in chats and groups go through one smarter prompt-writer, so the picture follows what you actually asked for and the conversation around it.",
                        "<strong>NEW:</strong> Request Group Photo draws every participant as they really look, doing what you asked.",
                    ],
                },
            ],
        },
        {
            version: "202606011200",
            date: "June 1, 2026",
            title: "🩹 Hotfix — Names with Apostrophes",
            changes: [
                {
                    category: "🩹 Fix",
                    items: [
                        "<strong>FIXED:</strong> An NPC with an apostrophe in their name (O'Brien, D'Angelo…) broke the Reply button on their comments and threw errors across the page.",
                    ],
                },
            ],
        },
        {
            version: "202605300001",
            date: "May 30, 2026",
            title: "🐛 Bug Fix Patch — Social Feed, Chat Streaming & Comments",
            changes: [
                {
                    category: "📸 Social Feed — Image Regeneration Fix",
                    items: [
                        "<strong>FIXED:</strong> Regenerating a post image now immediately updates the preview card on the main feed — no page refresh required.",
                        "• Root cause: the feed's fingerprint optimization only tracked whether a post <em>had</em> an image, not which URL. The new image URL now factors into the fingerprint so the card re-renders on change.",
                    ],
                },
                {
                    category: "💬 1-on-1 Chat — Streaming Response Polish",
                    items: [
                        "<strong>FIXED:</strong> Streaming response bubbles now match the real NPC message style from the very first character — correct background color, border-radius, left-alignment, and max-width.",
                        "• Previously the streaming bubble used completely different styling (full-width, glowing cyan border), then snapped to the correct look when generation finished, causing a jarring visual jump.",
                        "• The streaming bubble now also includes a timestamp placeholder so there is no layout shift when the final message settles in.",
                    ],
                },
                {
                    category: "💬 Social Feed — Comment Visibility Bugs",
                    items: [
                        "<strong>FIXED:</strong> NPC comments that incremented the count and fired notifications but were invisible/blank in the modal.",
                        "• Root cause: the autonomous NPC-to-NPC comment system pushed comments to the post even when the AI returned empty or null text, resulting in blank comment elements. Empty comment text is now skipped.",
                        "<strong>FIXED:</strong> Reply comments added via live-update while the post modal is open now appear in the correct threaded position (directly under their parent) instead of being appended to the bottom of the comment list.",
                        "• Root cause: the smooth-update path always used <code>appendChild</code> regardless of thread position. Replies now use DOM insertion to slot in after their parent's last sibling reply.",
                    ],
                },
            ],
        },
        {
            version: "202605291200",
            date: "May 29, 2026",
            title: "👥 GROUPS OVERHAUL, STREAMING AI & UI POLISH",
            changes: [
                {
                    category: "👥 Groups — Conversations No Longer Stall",
                    items: [
                        "<strong>FIXED — the big one:</strong> Typing a message in a group and hitting Send used to do <em>nothing</em> unless you first manually clicked portraits to queue speakers. Now the group <strong>responds automatically</strong> — the most relevant participants reply on their own.",
                        "<strong>Smart responder selection:</strong> whoever you address by name jumps in first, alongside outgoing personalities and those who are into you; people who just spoke step back so the same voices don't dominate.",
                        "<strong>NEW — Replies-per-message setting:</strong> a slider in Group Settings (1–5, default 2) controls how many people answer when you don't hand-pick speakers. The advertised reply limit is back.",
                        "<strong>Natural pacing:</strong> when several people respond, their messages now arrive one at a time with a short, lifelike delay instead of dumping all at once.",
                        "Manually queueing speakers (click a face to set an order, double-click for an instant reply) still works as a power-user override.",
                    ],
                },
                {
                    category: "👥 Groups — Manage Your Roster",
                    items: [
                        '<strong>FIXED — "+ Add Participant" now works.</strong> The button in Group Settings was wired to nothing; you could remove people but never add them. You can now add any active employees to an existing group (multi-select, with an in-chat announcement).',
                        "<strong>FIXED — no more ghost members.</strong> Employees you fired (or who left) used to linger in your groups forever. They're now automatically removed from every group when fired and again on game load.",
                        "<strong>NEW — group size cap (8).</strong> Oversized groups quietly degraded every AI response by overflowing the context budget; group size is now capped with a clear message.",
                    ],
                },
                {
                    category: "📊 Groups — Meeting Recap & Stats",
                    items: [
                        "<strong>NEW — Meeting Recap (📊 in the group header):</strong> see at-a-glance stats for the meeting — total messages, participant count, images shared, and total money sent.",
                        "<strong>Who-talked-most breakdown</strong> ranks participants by how much they contributed.",
                        "<strong>AI Meeting Summary:</strong> generate a concise 2–4 sentence recap of what actually happened in the conversation — topics, decisions, tension, and mood. Summaries are saved and can be regenerated.",
                    ],
                },
                {
                    category: "🧠 Smarter Group Memory",
                    items: [
                        "<strong>Less noise, better recall:</strong> groups used to dump every single line into every participant's long-term memory, flooding it and pushing out genuinely important facts. Now only <strong>salient moments</strong> (promotions, gifts, romantic/intimate beats, conflicts, etc.) are remembered — attributed to who said them.",
                    ],
                },
                {
                    category: "🌊 Streaming AI Responses",
                    items: [
                        "<strong>NEW:</strong> AI responses now <strong>stream in word-by-word</strong> as they generate, with a live typing bubble and blinking cursor, instead of appearing all at once after a wait.",
                        "Applies to <strong>1-on-1 chat, group chat, and encounter narration</strong>.",
                        "Toggle it any time under <strong>Settings → AI &amp; Performance → 🌊 Stream AI Responses</strong> (on by default).",
                    ],
                },
                {
                    category: "🧭 Collapsible Top Bar (Menu Toggle)",
                    items: [
                        "<strong>NEW — header/menu collapse toggle (▲/▼):</strong> collapse the stats top bar and news ticker and shrink the tab navigation to icons-only to reclaim screen space for the game — especially handy on mobile.",
                        "Your collapsed/expanded preference is <strong>remembered across sessions</strong>, the toggle stays put and accessible, and the transition is smooth.",
                    ],
                },
                {
                    category: "🎨 UI & Mobile Polish",
                    items: [
                        "<strong>Clearer guidance:</strong> a persistent hint under the participant bar now explains that typing makes the group reply, and tapping a face picks who speaks next.",
                        '<strong>Cleaner action menu:</strong> "Visualize Scene" no longer shares the Send button\'s color, so the primary action stands out.',
                        "<strong>Better touch targets:</strong> group buttons now reliably hit the 44px tap-target size on touch and hybrid (touchscreen-laptop) devices, plus a new layout pass for very small phones (≤400px).",
                        "Quieter console: verbose group auto-visualization debug logging is now off by default.",
                    ],
                },
            ],
        },
        {
            version: "202605221500",
            date: "May 22, 2026",
            title: "🗓️ NPC SCHEDULES, GALLERY PRESERVATION & UI POLISH",
            changes: [
                {
                    category: "🗓️ NPC Schedule System",
                    items: [
                        '• <strong>NPCs now have detailed minute-by-minute daily schedules</strong> — instead of just showing "Online", you can see exactly what they\'re doing at any point in the day',
                        "• Schedule activities are contextually linked to NPC conversations and social posts, making their behavior feel more coherent and grounded",
                    ],
                },
                {
                    category: "📸 Image & Gallery Fixes",
                    items: [
                        "• <strong>FIXED:</strong> Images were sometimes not generating or disappearing from social posts — this has been resolved",
                        "• <strong>NEW:</strong> Images from pruned posts are now preserved in the NPC's photo gallery — even after old posts are removed to reduce save size, their images remain accessible",
                        "• <strong>FIXED:</strong> Post pruning was incorrectly removing the <em>newest</em> posts instead of the oldest — the system now correctly removes the oldest posts first as intended",
                    ],
                },
                {
                    category: "⚙️ Settings & Menu",
                    items: [
                        "• <strong>RESTORED:</strong> Menu options to control AI Queue-limit thresholds are back — these were removed during a prior menu redesign and have now been reinstated",
                    ],
                },
                {
                    category: "📱 UI & Mobile Improvements",
                    items: [
                        "• <strong>Top-bar collapse improved</strong> — the toggle element no longer overlaps and blocks gameplay (still being refined)",
                        "• Social Feed and Meetings tabs have improved layout and visibility on mobile screens",
                        "• Subtle spacing and density adjustments throughout the UI to make the mobile experience feel tighter and more usable (ongoing)",
                        '• "Beautifying" adjustments to certain race descriptions for improved AI image generation quality',
                    ],
                },
            ],
        },
        {
            version: "202603061600",
            date: "March 6, 2026",
            title: "🔥 THE ENCOUNTER UPDATE — Full Sex Scene System",
            changes: [
                {
                    category: "🔥 Encounter System — Overview",
                    items: [
                        "<strong>BRAND NEW SYSTEM: SEXUAL ENCOUNTERS!</strong> A full interactive sex scene engine with AI narration, AI image generation, NPC preferences, skill progression, and more.",
                        '• Encounters can be initiated through NPC chat — look for the <strong>"Go to Encounter"</strong> button when flirting leads somewhere',
                        "• Full-screen encounter modal with real-time AI-generated images, narration text, excitement meters, and an interactive action panel",
                        "• <strong>100+ sexual acts</strong> across 13 categories — oral, vaginal, anal, manual, breast, feet, power, bondage, toys, verbal, emotional, scene control, and orgasm",
                        "• Every act has unique narration with multiple variants for Liked, Neutral, Disliked, and climax reactions",
                    ],
                },
                {
                    category: "🎮 Turn-Based Interactive Gameplay",
                    items: [
                        "• <strong>You and the NPC take turns</strong> choosing actions — watch their excitement bar climb",
                        "• <strong>8 positions:</strong> Standing, Missionary, Doggy Style, Cowgirl, 69, Kneeling, Bent Over, Seated — each with unique available act categories",
                        "• <strong>3 intensity stages:</strong> Teasing → Heated → Intense — acts unlock progressively within each category (e.g., Tease → Suck → Deepthroat)",
                        "• <strong>Clothing system:</strong> Undress yourself or your partner (top/bottom separately) — body parts are blocked until clothing is removed",
                        "• <strong>Togglable acts:</strong> Some acts (grinding, oral, penetration) can be left running simultaneously — mix and match for combos",
                        "• <strong>Body part conflict resolution:</strong> The system automatically handles exclusive body parts — no impossible act combos",
                    ],
                },
                {
                    category: "📊 Excitement, Libido & Orgasm",
                    items: [
                        "• <strong>Dual excitement meters (0-100%):</strong> Separate bars for you and the NPC, with glow effects at high arousal",
                        "• <strong>Libido system:</strong> Affects excitement gain — low libido dampens pleasure, high libido amplifies it",
                        "• <strong>Orgasm mechanics:</strong> NPC can climax at 85%+ excitement, player at 95%+ — both require libido ≥30",
                        "• <strong>Male player orgasm options (5):</strong> Cum In Ass, Cum Inside, Cum On Face, Cum On Body, Cum In Mouth",
                        "• <strong>Female player orgasm options (4):</strong> Cum While Riding, Cum On Their Tongue, Cum On Their Fingers, Squirt",
                        "• <strong>Full gender support:</strong> Male, Female, Non-Binary, Trans, and Futa players all get anatomically appropriate act filtering",
                    ],
                },
                {
                    category: "🧠 NPC Preference System (6-Layer AI)",
                    items: [
                        "• <strong>NPCs have real sexual preferences</strong> built from 6 layers of personality data:",
                        "  - Layer 1: NPC kinks (32 kink types mapped to preference tags)",
                        "  - Layer 2: Personality stat bonuses (flirty NPCs like teasing, confident ones like dominance)",
                        "  - Layer 3: Personality trait bonuses (submissive NPCs prefer sub acts, romantic ones prefer emotional)",
                        "  - Layer 4: Appearance-based (e.g., large-breasted NPCs enjoy breast play)",
                        "  - Layer 5: Explicit dislikes (shy NPCs hate roughplay, dominant NPCs refuse submission)",
                        "  - Layer 6: Preference drift from past encounters (see below)",
                        "• Each act gets a <strong>Liked / Neutral / Disliked</strong> tier based on tag matching — affecting excitement gain, narration tone, and NPC reactions",
                    ],
                },
                {
                    category: "🔒 Disinhibition & Progression Gates",
                    items: [
                        "• <strong>4-Base Progression System:</strong> You can't skip straight to anal — NPCs need to be warmed up first",
                        "  - Base 0 (Always): Verbal, Emotional, Undress, Scene Control",
                        "  - Base 1 (After foreplay): Manual, Breast, Feet",
                        "  - Base 2 (After trust builds): Oral, Bondage, Toys",
                        "  - Base 3 (Full intimacy): Penetration, Anal",
                        "• <strong>Disinhibition score (0-100)</strong> per act calculated from NPC confidence, desire, comfort, trust, relationship depth, and kink relevance",
                        '• <strong>Locked acts show 🔒 icons</strong> — hover for reason ("Way too early for this" or "[Name] isn\'t ready yet")',
                        "• Acts unlock naturally as your relationship deepens across multiple encounters",
                    ],
                },
                {
                    category: "💭 NPC Desires & Satisfaction",
                    items: [
                        "• <strong>Dynamic desire system:</strong> NPCs periodically want something specific — oral, penetration, roughness, gentleness, a position change, etc.",
                        '• <strong>Desire hint UI:</strong> Emoji + text shows what they\'re craving (e.g., 💭 "wants oral")',
                        "• <strong>Satisfaction bar (0-100%):</strong> Fulfilling desires raises it (green), ignoring them drops it (red)",
                        "• <strong>Matching desires = 1.15× excitement multiplier</strong> and +5 to NPC AI scoring",
                        "• <strong>Ignoring desires 3+ rounds = 0.7× penalty</strong> — pay attention to what your partner wants!",
                    ],
                },
                {
                    category: "🤖 NPC AI Decision Making",
                    items: [
                        "• <strong>NPCs choose their own actions intelligently</strong> based on preference tags, inclinations, variety desire, excitement level, and libido",
                        "• <strong>Reactionary logic:</strong> If you're dominant, they lean submissive (and vice versa)",
                        "• <strong>Category synergy:</strong> NPCs tend to match the vibe of your last action",
                        "• <strong>Desire awareness:</strong> NPC actions account for what they currently want",
                        "• <strong>Variety seeking:</strong> NPCs avoid repeating the same 5 acts in a row",
                    ],
                },
                {
                    category: "📈 Skills, Quality & Progression",
                    items: [
                        "• <strong>11 sexual skill types:</strong> Oral, Penetration, Manual, Breast, Feet, Power, Verbal, Intimacy, Bondage, Toys, Edging",
                        '• <strong>10 skill levels</strong> per type — shown as "Lv1" through "Lv10" badges on action buttons',
                        "• <strong>Performance quality rolls:</strong> 😬 Poor (0.4×), 🎯 Decent (0.85×), ✨ Good (1.15×), 🌟 Excellent (1.5×) — higher skill = better odds",
                        "• <strong>XP gain per act</strong> scales with stage level and NPC reaction tier",
                    ],
                },
                {
                    category: "📸 AI Image Generation",
                    items: [
                        "• <strong>Real-time AI images</strong> generated every ~10 seconds during the encounter",
                        "• <strong>Position-aware prompts:</strong> Each of the 8 positions has a specific body-arrangement description for accurate images",
                        '• <strong>Distinct character rendering:</strong> Player and NPC are described as "PERSON 1" and "PERSON 2" with contrasting physical features to prevent "clone" images',
                        "• <strong>Dynamic prompts:</strong> Images reflect current clothing state, active acts, intensity level, and NPC expression (ecstatic, aroused, curious, etc.)",
                        "• <strong>Photo gallery:</strong> Generated encounter images are saved to the NPC's photo collection",
                    ],
                },
                {
                    category: "📝 Memory, Drift & Post-Encounter",
                    items: [
                        "• <strong>Per-NPC sex history:</strong> Every encounter is remembered — act types used, categories explored, encounter count, and dates",
                        "• <strong>Preference drift:</strong> NPCs' tastes <em>change</em> based on experience:",
                        "  - Liked acts: +0.3 shift toward enjoying them more",
                        "  - Disliked acts used once: -0.1 resistance. Used repeatedly: +0.15 habituation (they warm up to it!)",
                        "  - Neutral acts: +0.1 familiarization bonus",
                        "• <strong>Post-encounter summary:</strong> Modal showing star rating (⭐-⭐⭐⭐⭐⭐), rounds played, unique acts, orgasm tally, dominant categories, and preference shifts",
                        "• <strong>Chat integration:</strong> Summary posted to NPC chat history — stats, satisfaction narrative, comfort progression, and the encounter's final image",
                        "• <strong>Stat gains:</strong> Encounters affect Desire, Comfort, Affection, and Trust based on performance, satisfaction, and variety",
                    ],
                },
            ],
        },
        {
            version: "202603041800",
            date: "March 4, 2026",
            title: "🔧 BUG FIXES — Post Images, Stories & Mobile",
            changes: [
                {
                    category: "📸 Social Post Image Fix (Post-Prestige)",
                    items: [
                        '• <strong>FIXED:</strong> "Request social post" from NPC profiles now correctly generates images after prestige',
                        "  - Completely rewrote the post request pipeline to use the same <code>createPost()</code> factory as autonomous posts",
                        "  - Removed broken <code>typeof generateImage</code> guard that was preventing image generation",
                        "  - Image generation now uses the same <code>queuedGenerateImage(applyImageStyle(...))</code> path as all other working systems",
                        "  - Posts now include all required fields: <code>authorName</code>, <code>type</code>, <code>explicitLevel</code>, <code>upvotes</code>, <code>downvotes</code>, <code>tags</code>, etc.",
                        "  - Added robust error handling with fallback text if AI text/image generation fails",
                        "  - Posts show notification progress while image is generating",
                    ],
                },
                {
                    category: "👤 Ghost Post Fix",
                    items: [
                        "• <strong>FIXED:</strong> Posts no longer appear with missing/undefined author names after prestige",
                        "  - Root cause: legacy <code>generateNPCPost()</code> created posts without <code>authorName</code> field",
                        "  - Now properly sets <code>authorName: emp.name</code> via <code>createPost()</code>",
                        "• <strong>FIXED:</strong> Prestige now properly resets The Algorithm™ sort state",
                        "  - Added missing <code>algorithm</code> property to prestige social network reset",
                        "  - Feed sorting buttons work correctly immediately after prestige",
                    ],
                },
                {
                    category: "📸 Story Images",
                    items: [
                        "• <strong>NEW:</strong> NPC Stories now generate AI images instead of just showing emoji + gradient",
                        "  - Image generation happens asynchronously in the background — stories appear instantly with gradient, then upgrade to AI images",
                        "  - Image probability varies by story category: nsfw stories always generate, mood/activity ~35-40%, work/morning ~20-25%",
                        "  - High-relationship NPCs (intimacy > 40, desire > 50) have increased image generation chance",
                        "  - Image prompts are contextual: nsfw stories get intimate/suggestive selfies, work stories get office photos, activity stories match the activity",
                        "  - Stories without AI images now show NPC profile photo as blurred background (instead of plain gradient)",
                        "  - Story viewer live-updates when image finishes generating while you're watching",
                        "  - Text repositions to bottom overlay when image is present (Instagram-style)",
                    ],
                },
                {
                    category: "📱 Mobile Comment Input Fix",
                    items: [
                        "• <strong>FIXED:</strong> Comment reply input on mobile is now properly sized for touch",
                        "  - Increased textarea min-height from 44px to 52px on mobile",
                        '  - Reply indicator ("Replying to X") now has larger padding and font size on mobile',
                        "  - Cancel reply button (✕) has larger touch target (32x32px minimum)",
                        "  - All comment input elements respect 16px font-size to prevent iOS zoom",
                    ],
                },
            ],
        },
        {
            version: "202603032100",
            date: "March 3, 2026",
            title: "📱 SOCIAL FEED 2.0 — STORIES, THREADS, POLLS & MORE",
            changes: [
                {
                    category: "📸 NPC Stories",
                    items: [
                        "• <strong>Instagram-Style Stories:</strong> NPCs now post ephemeral stories that expire after 1 hour",
                        "  - Stories appear in a scrollable bar at the top of the Social Feed",
                        "  - 8 categories: morning, work, mood, activity, nsfw, reaction, ama — with 60+ templates",
                        "  - Full-screen story viewer with progress bar, emoji reactions, and direct chat button",
                        "  - NPC personality and activity influence what stories they post",
                        "  - Gradient backgrounds, auto-close timer, and smooth animations",
                        "  - High-relationship NPCs get notification when they post stories",
                    ],
                },
                {
                    category: "💬 Comment Threading & Reply Chains",
                    items: [
                        "• <strong>Threaded Comment Replies:</strong> Comments now support full reply chains with visual threading",
                        '  - Click reply on any comment to reply directly — shows "Replying to [name]" with cancel button',
                        "  - Threaded replies display indented with a border line and reply label",
                        "• <strong>NPC-to-NPC Reply Drama:</strong> 35% of autonomous comments are now threaded replies to other NPCs",
                        "  - Relationship-weighted targeting: rivals reply 4x more, crushes 3x, friends 2x",
                        "  - 100+ unique reply templates per relationship type (snarky, admiring, banter, hostile, affectionate)",
                        "  - 40% chance for AI-generated replies for rivals/crushes/romantic interests",
                        '• <strong>🍿 Comment Wars:</strong> When 2 NPCs exchange 3+ replies back and forth, a "Comment War!" banner appears',
                    ],
                },
                {
                    category: "🔔 Social Notifications",
                    items: [
                        "• <strong>Real Notification System:</strong> Bell icon in the feed header with unread badge count",
                        "  - Get notified when NPCs like your posts, comment, reply to comments, or mention you",
                        "  - Notifications for viral posts, comment wars, and NPC stories",
                        "  - Click any notification to jump directly to the relevant post",
                        '  - Notification panel with rich format, avatars, timestamps, and "Clear all" button',
                        "  - Dashboard social section now shows rich notifications instead of basic mentions",
                    ],
                },
                {
                    category: "✨ For You Algorithm",
                    items: [
                        '• <strong>"For You" Personalized Feed:</strong> New algorithm sort mode in the sidebar',
                        "  - Scores posts based on your relationship with each NPC (affection, trust, desire, intimacy)",
                        "  - Boosts posts from NPCs you've chatted with recently",
                        "  - Considers engagement signals, post type preference, and adds slight randomization for freshness",
                        "  - Recency decay prevents old posts from dominating",
                    ],
                },
                {
                    category: "📊 Poll Posts",
                    items: [
                        "• <strong>Interactive Polls:</strong> NPCs now create poll posts that you can vote on",
                        "  - 10+ poll templates covering office life, preferences, personality questions",
                        "  - Flirty NPCs get additional romantic/dating poll templates",
                        "  - Click an option to vote — results show animated bar graph with percentages",
                        "  - NPCs autonomously vote on polls based on their personality",
                        "  - 10% of NPC posts are now polls — appear in both feed cards and post modal",
                    ],
                },
                {
                    category: "📱 Mobile Responsive Overhaul",
                    items: [
                        "• <strong>Slide-In Sidebar:</strong> Social feed sidebar becomes a slide-in overlay on mobile with backdrop",
                        "  - ☰ filter toggle button in the feed header",
                        "  - Smooth slide animation, tap backdrop to dismiss",
                        "• <strong>Mobile-Optimized Layout:</strong> Full-width feed, compact header, tighter padding",
                        "  - Floating ✏️ action button for quick post creation",
                        "  - Full-width notification panel on mobile",
                        "  - Responsive story viewer (full-screen on mobile, windowed on desktop)",
                        "  - Post modals sized appropriately for mobile screens",
                    ],
                },
            ],
        },
        {
            version: "202603022245",
            date: "March 2, 2026",
            title: "🩹 PROACTIVE DM & IMAGE REQUEST FIXES",
            changes: [
                {
                    category: "💬 Proactive DM Quality Fix",
                    items: [
                        '• <strong>No More "B" Messages:</strong> NPCs will no longer send single-letter garbage like "B" or "Hey" as unprompted DMs',
                        "  - Added minimum quality/length checks on all proactive messages",
                        "  - Messages under 5 characters or matching common filler words are now rejected",
                        "  - Rejected messages are replaced with contextual fallbacks based on the reason the NPC messaged (work update, casual chat, flirty, etc.)",
                        "• <strong>Better DM Generation:</strong> Increased token budget for proactive message generation for more coherent outputs",
                    ],
                },
                {
                    category: "📸 Image Request After Prestige",
                    items: [
                        "• <strong>Stale Reference Fix:</strong> Image requests no longer silently fail for rehired employees after prestige",
                        "  - After prestige + rehire, employees get new internal IDs — the image request system now resolves stale references by name",
                        "• <strong>No More Silent Failures:</strong> If an image request fails for any reason, you now get a visible error message in chat instead of nothing happening",
                        "  - Added try/catch wrappers around the entire image request evaluation and generation pipeline",
                        "  - Both the willingness check and image generation steps now show feedback on failure",
                    ],
                },
                {
                    category: "📱 Social Feed Fix",
                    items: [
                        '• <strong>No More Auto Player Posts:</strong> The "Generate Test Post" button no longer randomly creates posts as if the player wrote them',
                        "  - Previously had a 30% chance of generating a player-authored post — now always generates an NPC post",
                    ],
                },
            ],
        },
        {
            version: "202603012000",
            date: "March 1, 2026",
            title: "🔧 MASSIVE BUG FIX PATCH",
            changes: [
                {
                    category: "🚨 Critical Fixes",
                    items: [
                        "• <strong>Clear Posts Cheat:</strong> Now properly resets everything — no more ghost posts or broken feeds after clearing",
                        "• <strong>Social Feed Crash:</strong> Fixed a crash when viewing likes/comments on posts made before prestige",
                        "• <strong>Prestige Rehire:</strong> Rehired employees now actually run their products again instead of sitting idle",
                        "• <strong>Story Softlock:</strong> Story conclusion screens now have a close button and click-outside-to-dismiss — no more getting stuck",
                        "• <strong>Flag System Crash:</strong> Opening flags for a deleted employee no longer crashes the game",
                        "• <strong>Flags Deletion:</strong> You can actually delete flags now without errors",
                        "• <strong>Custom World Info:</strong> Your custom world/company/AI context now properly saves and loads on export/import",
                        "• <strong>Prestige Social Images:</strong> Post images no longer break after prestiging",
                    ],
                },
                {
                    category: "🏢 Employee & Slot Fixes",
                    items: [
                        "• <strong>Ghost Employees:</strong> Fired/terminated employees no longer block product slots or pyramid positions",
                        '  - Firing now properly cleans ALL product assignments, not just the one they were "supposed" to manage',
                        "  - Old saves with stuck slots are auto-repaired on load",
                        "• <strong>Nicknames Work Again:</strong> Employee nicknames now actually show up in social posts and AI context",
                        "• <strong>Schedule Editing:</strong> Work day checkboxes in employee profiles actually save now",
                    ],
                },
                {
                    category: "⏱️ Time & Speed",
                    items: [
                        "• <strong>Speed Badge Always Visible:</strong> You can now always see your current game speed, even during conversations",
                        "  - Shows when time dilation is overriding your set speed",
                        "• <strong>Skip Time Buttons:</strong> Added +1 Hour, +3 Hours, and +8 Hours buttons to cheats panel",
                        "• <strong>No Story While Paused:</strong> Random events and story beats no longer fire while the game is paused",
                    ],
                },
                {
                    category: "🎮 Gameplay Tweaks",
                    items: [
                        "• <strong>Anti-Autoclicker:</strong> Thunder minigame and boss fight mashing now have a 50ms cooldown — no more infinite-speed exploits",
                        "• <strong>Buttons React Instantly:</strong> Hire, upgrade, and unlock buttons now enable/disable the moment you can afford them instead of up to a second later",
                        "• <strong>Patch Notes Button:</strong> The quick patch notes button on the dashboard actually loads the content now",
                        '• <strong>[object Object] Fix:</strong> Recruited bosses no longer show "[object Object]" for their personality in posts and prompts',
                    ],
                },
                {
                    category: "📱 Social Feed & Chat",
                    items: [
                        "• <strong>Smarter Comments:</strong> NPC comments are way more varied now — more templates, post-type awareness, and more interactions use real AI instead of canned replies",
                        '• <strong>Image Request Messages:</strong> Asking NPCs for pics no longer always says "Could you send..." — messages are now natural and varied',
                        "• <strong>Mobile HUD:</strong> Top bar is more compact on phones, tab bar scrollbar hidden, and tiny screens now hide less-important stats to save space",
                    ],
                },
            ],
        },
        {
            version: "202601201700",
            date: "January 20, 2026",
            title: "🐛 BUG FIXES & STABILITY",
            changes: [
                {
                    category: "📱 Mobile UI Fixes",
                    items: [
                        "• <strong>Boss Portrait Fix:</strong> Boss fight portrait no longer cuts off on mobile devices",
                        "• <strong>Special Button Position:</strong> Special attack button now properly aligned in boss fight UI",
                        "• <strong>Search Bar Fix:</strong> Groups search bar no longer disappears when tapped on small screens",
                        "• <strong>Chat Button Swap:</strong> Close (✕) and Clear buttons swapped in chat header for better mobile UX",
                    ],
                },
                {
                    category: "💥 Crash Fixes",
                    items: [
                        "• <strong>Groups Crash Fixed:</strong> Fixed TypeError crash when viewing groups with messages from unknown senders",
                        "• <strong>NaN Cash Bug Fixed:</strong> Fixed $NaN display after unlocking locations and hiring bosses",
                        "  - Root cause: Manager stats (productivity/trust/obedience) were being accessed incorrectly",
                    ],
                },
                {
                    category: "⚙️ System Fixes",
                    items: [
                        "• <strong>Boss Bounty Rehire:</strong> Bosses are now added to the rehire pool when claiming bounty reward",
                        "  - Previously, choosing bounty meant losing the boss forever",
                        "• <strong>Prestige Employee Reassign:</strong> Fixed inability to reassign employees after prestige reset",
                        "  - Corporate pyramid structure now properly initialized on prestige",
                        "• <strong>Boss Gender Display:</strong> Fixed recruited bosses displaying wrong gender in chat",
                        "  - Gender now properly tracked through boss generation and recruitment",
                    ],
                },
            ],
        },
        {
            version: "202601171430",
            date: "January 17, 2026",
            title: "⚔️ BOSS FIGHT SYSTEM OVERHAUL",
            changes: [
                {
                    category: "🎮 QTE Combat System Rework",
                    items: [
                        "<strong>COMPLETELY REDESIGNED BOSS FIGHTS:</strong> Skill-based combat!",
                        "• <strong>4 Combat Actions:</strong> Attack (Q), Block (W), Parry (E), Dodge (R)",
                        "• <strong>Reaction-Based Combat:</strong> Watch for attack indicators and respond correctly",
                        "• <strong>Special Meter:</strong> Build charge through successful parries, unleash devastating specials (SPACE)",
                        "• <strong>Mash-to-Escape:</strong> Grab attacks require rapid button mashing to break free",
                        "",
                        "<strong>ATTACK INDICATOR SYSTEM:</strong>",
                        "• 🟡 Yellow Flash = Quick Attack → Parry or Block",
                        "• 🔴 Red Flash = Heavy Attack → Block or Dodge",
                        "• 🟣 Purple Flash = Grab Attack → Mash to Escape",
                        "• Clear telegraph text tells you exactly what to do",
                        "• Pulsing borders and screen effects for maximum visibility",
                    ],
                },
                {
                    category: "🎲 Procedurally Generated Bosses",
                    items: [
                        "<strong>EVERY BOSS IS UNIQUE:</strong> No two playthroughs are the same!",
                        "• Dynamic character generation: names, ages, appearances, personalities",
                        "• AI-enhanced dialogue when available (falls back to procedural)",
                        "• Unique attack patterns based on boss archetype",
                        "• Boss images generated and cached automatically",
                        "",
                        "<strong>BOSS ARCHETYPES:</strong>",
                        "• Corporate Demanding (Home Office)",
                        "• Corporate Queen (Office Suite)",
                        "• Retail Empress (Factory)",
                        "• Mad Scientist (R&D Lab)",
                        "• Seductress (Creative Studio)",
                        "• Fashion Mogul (Private Club)",
                        "• Underground Queen (Velvet Room)",
                        "• Final Boss (Inner Sanctum)",
                    ],
                },
                {
                    category: "🏆 Victory Rewards & Recruitment",
                    items: [
                        "<strong>DEFEAT BOSSES, GAIN REWARDS:</strong>",
                        "• <strong>Recruit Option:</strong> Hire the defeated boss as an employee!",
                        "  - Unique passive bonuses (income, efficiency, sales, etc.)",
                        "  - Special active abilities on cooldown",
                        "  - Full employee profile with backstory",
                        "• <strong>Bounty Option:</strong> Claim cash reward instead",
                        "  - Reward scales with prestige level",
                        "  - Higher difficulty = bigger payouts",
                        "",
                        "<strong>LOCATION UNLOCK:</strong> Defeating a boss unlocks their location!",
                    ],
                },
                {
                    category: "📱 Mobile-Optimized UI",
                    items: [
                        "<strong>BOSS FIGHTS WORK GREAT ON MOBILE:</strong>",
                        "• Compact, centered modal design (340px max)",
                        "• Touch-friendly combat buttons",
                        "• Responsive layout for all screen sizes",
                        "• Portrait boss image with 4:3 aspect ratio",
                        "• Timer bar and health bars scale properly",
                        "",
                        "<strong>VICTORY/DEFEAT MODALS:</strong> Clean, readable on any device",
                    ],
                },
                {
                    category: "⚖️ Difficulty & Accessibility",
                    items: [
                        "<strong>GENEROUS REACTION WINDOWS:</strong>",
                        "• Quick Attacks: 1.2-1.6 seconds to respond",
                        "• Heavy Attacks: 2.0-2.5 seconds to respond",
                        "• Grab Attacks: 1.8-2.2 seconds, reduced mash requirement",
                        "",
                        "<strong>VISUAL FEEDBACK:</strong>",
                        "• Screen flashes in attack color",
                        "• Pulsing animated borders",
                        "• Large centered icons with glow effects",
                        "• Timer bar turns red when low (urgency effect)",
                        "• Green/red flash for correct/wrong responses",
                    ],
                },
                {
                    category: "👤 Alumni System (People Tab)",
                    items: [
                        '<strong>NEW "SHOW ALUMNI" TOGGLE:</strong> See former employees!',
                        "• View terminated, resigned, or prestige-reset employees",
                        "• Alumni cards show status badge (why they left)",
                        "• Departure date displayed when available",
                        "• Cards slightly grayed to distinguish from active",
                        "• Favorites work across both active and alumni lists",
                    ],
                },
            ],
        },
        {
            version: "202601162100",
            date: "January 16, 2026",
            title: "💰 PAYROLL, EVENTS & SMARTER NPCs",
            changes: [
                {
                    category: "💰 Payroll System & Meaningful Salaries",
                    items: [
                        "<strong>NEW PAYROLL TAB:</strong> Complete financial management system!",
                        "• <strong>Weekly Payroll:</strong> See total company salary expenses at a glance",
                        "• <strong>Next Payday Countdown:</strong> Track when salaries are due",
                        "• <strong>Employee Salary List:</strong> View and manage individual salaries",
                        "• <strong>Salary Adjustments:</strong> Give raises or cut pay with immediate effect",
                        "",
                        "<strong>MEANINGFUL SALARIES:</strong> NPCs now have realistic, role-based pay",
                        "• Staff: $800-$1,500/week based on performance & skills",
                        "• Managers: $1,500-$3,000/week with leadership bonuses",
                        "• Division Heads: $3,000-$6,000/week reflecting seniority",
                        "• Automatic raises based on tenure, performance reviews, and skill growth",
                    ],
                },
                {
                    category: "🔔 Meta Events System",
                    items: [
                        "<strong>NEW EVENT BELL:</strong> Dynamic events that affect your whole company!",
                        "• Bell icon in top bar shows pending events",
                        "• Events appear based on time, company state, and random chance",
                        "• Accept or dismiss events - your choice shapes the company",
                        "",
                        "<strong>EVENT TYPES:</strong>",
                        "• 📋 Company-wide announcements",
                        "• 💼 Business opportunities",
                        "• 🎉 Social events and celebrations",
                        "• ⚠️ Crises and challenges",
                        "• 💰 Financial windfalls or setbacks",
                    ],
                },
                {
                    category: "⏰ Time Dilation System",
                    items: [
                        "<strong>CONVERSATIONS NO LONGER WARP TIME:</strong> Chat at your own pace!",
                        "• Time now passes much slower during 1-on-1 chats",
                        "• Group conversations also have reduced time flow",
                        "• Configurable time scales in Settings (default: 0.3x for DMs, 2x for groups)",
                        '• No more "8 hours passed during a 5-message chat" situations',
                    ],
                },
                {
                    category: "📅 NPC-Aware Event Scheduling",
                    items: [
                        "<strong>NPCs KEEP THEIR PROMISES:</strong> Informal plans become real events!",
                        '• When NPCs say "Let\'s grab lunch tomorrow" - they mean it',
                        "• AI detects scheduling language in conversations",
                        "• Events auto-created with appropriate timing",
                        "• NPCs remember and reference upcoming plans",
                        "• Configurable detection sensitivity in Settings",
                    ],
                },
                {
                    category: "📸 Unprompted NPC Images",
                    items: [
                        "<strong>NPCS SEND PHOTOS SPONTANEOUSLY:</strong> More natural conversations!",
                        "• High-affection NPCs may send selfies unprompted",
                        "• Context-aware: morning selfies, work photos, evening pics",
                        "• Relationship-gated: more intimate photos require higher trust",
                        "• Photos saved to NPC galleries automatically",
                        "• Weighted system ensures variety (not every message has a pic)",
                    ],
                },
                {
                    category: "👥 Groups UI Overhaul",
                    items: [
                        "<strong>DESKTOP IMPROVEMENTS:</strong>",
                        "• Fixed portrait/name clipping in participant bar",
                        "• Better header layout with proper text truncation",
                        "• Improved sidebar positioning and overlap issues",
                        "",
                        "<strong>MOBILE IMPROVEMENTS:</strong>",
                        "• Taller chat area (fills available screen)",
                        "• Compact sidebar that collapses properly",
                        "• Touch-friendly tap targets (44px minimum)",
                        "• Landscape mode optimization",
                        "",
                        "<strong>RESPONSIVE BREAKPOINTS:</strong>",
                        "• Desktop (1200px+): Full sidebar, spacious layout",
                        "• Tablet (1024px): Narrower sidebar",
                        "• Mobile (768px): Stacked layout, collapsible sidebar",
                        "• Small Mobile (480px): Ultra-compact mode",
                    ],
                },
                {
                    category: "🎬 Group Action Commands Enhanced",
                    items: [
                        "<strong>NEW COMMAND SYNTAX:</strong> More control over NPC actions!",
                        "",
                        "<strong>1-on-1 Chats:</strong>",
                        "<code>/actionType {Your message} &lt;Instructions&gt;</code>",
                        "• Example: <code>/kiss {I love you} &lt;Be passionate&gt;</code>",
                        "",
                        "<strong>Group Chats:</strong>",
                        "<code>/actionType NPCName {Your message} &lt;Instructions&gt;</code>",
                        "• Example: <code>/interact Sarah {} &lt;Be flirty&gt;</code>",
                        "• Target specific NPCs by first name",
                        '• Use "narrator" to direct the narrator',
                        "",
                        "<strong>📜 Narrator Command (NEW!):</strong>",
                        "<code>/narrator &lt;Your instructions&gt;</code>",
                        "• Available in both 1-on-1 chats and group chats",
                        "• Shortcut: <code>/n</code>",
                        "• Add custom instructions in angle brackets for guided narration",
                        "• Example: <code>/narrator &lt;Focus on the romantic tension&gt;</code>",
                        "",
                        "<strong>Custom Instructions:</strong> Override default action behavior",
                        "• <code>&lt;Instructions&gt;</code> parameter lets you guide exactly how the NPC responds",
                    ],
                },
                {
                    category: "💬 Idle Group Conversations",
                    items: [
                        "<strong>NPCs CHAT WITHOUT YOU:</strong> Groups feel alive!",
                        '• Enable "Idle Conversations" in group settings',
                        "• When chat is quiet, NPCs start talking to each other",
                        "• Configurable idle threshold (default: 2 minutes)",
                        "• Only triggers in active/viewed group",
                        "• Natural conversation starters between random participants",
                    ],
                },
                {
                    category: "🎁 Gift Shop Persistence",
                    items: [
                        "<strong>GIFTS SURVIVE PRESTIGE:</strong> Your collection is safe!",
                        "• Gift inventory no longer resets on prestige",
                        "• Purchased gifts carry over to new playthroughs",
                        "• Generated unique gifts are preserved",
                        "• Given gift history maintained",
                    ],
                },
                {
                    category: "🖼️ Scene Visualization Fixes",
                    items: [
                        "<strong>FIXED:</strong> Auto-visualization in groups now works properly",
                        "• Corrected element ID references that broke image display",
                        "• Added validation to prevent empty image messages",
                        "• Better error handling and loading indicator cleanup",
                        '• Images now actually appear (not just "Scene visualization" text)',
                    ],
                },
                {
                    category: "🔧 Additional Improvements",
                    items: [
                        "<strong>Action Buttons for Groups:</strong> Full action bar system in group chats",
                        "• Same /do commands and buttons as 1-on-1 chats",
                        "• Narrator-specific actions available",
                        "• Customizable per-group",
                        "",
                        "<strong>Performance:</strong> Various optimizations for smoother gameplay",
                    ],
                },
            ],
        },
        {
            version: "202601152111",
            date: "January 15, 2026",
            title: "👥 GROUPS SYSTEM & MAJOR BUG FIXES",
            changes: [
                {
                    category: "🆕 Groups System (Replaces Meetings)",
                    items: [
                        '<strong>COMPLETE REBUILD:</strong> "Meetings" system removed and replaced with powerful new "Groups" system!',
                        "<strong>• Create Custom Groups:</strong> Name your group, add any combination of employees",
                        "<strong>• Persistent Chat Rooms:</strong> Groups save their chat history permanently",
                        "<strong>• Dynamic Member List:</strong> See who's in the conversation, add/remove anytime",
                        "",
                        "<strong>GROUP FEATURES:</strong>",
                        "• <strong>Narrator System:</strong> Add an AI narrator to describe scenes and settings",
                        "• <strong>Auto-Visualization:</strong> Automatic image generation based on group conversation intensity",
                        "• <strong>Pre-Text:</strong> Set context that shapes how all NPCs respond",
                        "• <strong>Scenario Context:</strong> Define the current scene/setting for the group",
                        "• <strong>Member Portraits:</strong> Visual roster with quick-add functionality",
                        "• <strong>Attachment Menu:</strong> Send gifts, request actions, target specific members",
                        "",
                        "<strong>WHY THE CHANGE:</strong>",
                        '• Old "Meetings" were temporary and didn\'t save history',
                        "• Groups persist forever with full conversation history",
                        "• More intuitive UI with sidebar member list",
                        "• Better control over who's in each conversation",
                    ],
                },
                {
                    category: "🎭 Narrator for Groups",
                    items: [
                        "<strong>NEW:</strong> Add a Narrator to any group chat!",
                        "• Toggle in group settings to add/remove narrator",
                        "• Narrator has unique purple styling and portrait",
                        "• Describes scenes, actions, and atmosphere",
                        "• Typing indicator shows when narrator is composing",
                        "• Perfect for roleplay scenarios and storytelling",
                    ],
                },
                {
                    category: "📊 Race Distribution Fix",
                    items: [
                        '<strong>FIXED:</strong> HR tab race distribution no longer shows "undefined"',
                        "• Added all 29 races to display system (was only showing 8)",
                        "• New races now display properly: Succubus, Tiefling, Angel, Vampire, Dwarf, Goblin, Halfling, Dragonborn, Bunny, Werewolf, Fairy, Dryad, Mermaid, Lamia, Centaur, Harpy, Slime, Ghost, Robot, Cyborg, Alien",
                        "• Each race has unique color coding in the distribution chart",
                    ],
                },
                {
                    category: "👤 Custom Employee Fixes",
                    items: [
                        "<strong>FIXED:</strong> Custom employee physical appearance no longer resets!",
                        "• Previously: Your hair color, eye color, body type etc. were overwritten with random values",
                        "• Now: All user-specified physical attributes are preserved",
                        "• Only truly missing fields get random generation",
                        "<strong>FIXED:</strong> Custom race selection now works properly",
                        "<strong>FIXED:</strong> Physical descriptions now match in image generation",
                    ],
                },
                {
                    category: "🖼️ Auto-Visualization Fixes",
                    items: [
                        "<strong>FIXED:</strong> Auto-vis now responds to frequency setting changes immediately",
                        "• Changing min/max frequency now recalculates all existing trackers",
                        "• Setting 1-2 message frequency actually triggers within 1-2 messages now",
                        "• Both individual chat and group trackers are updated",
                    ],
                },
                {
                    category: "✋ Image Generation Improvements",
                    items: [
                        "<strong>FIXED:</strong> Reduced extra arms/hands in generated images",
                        '• Changed "avoid extra X" to "no extra X" phrasing',
                        '• Added positive reinforcement: "exactly two arms, exactly two hands"',
                        '• Some AI models were misinterpreting "avoid" as "include"',
                    ],
                },
                {
                    category: "🔧 UI Fixes",
                    items: [
                        "<strong>FIXED:</strong> Group settings modal no longer overflows on mobile",
                        "<strong>FIXED:</strong> Target selector modal appears above action modals (z-index fix)",
                        "<strong>IMPROVED:</strong> Better scrolling behavior in group member lists",
                    ],
                },
            ],
        },
        {
            version: "202601121020",
            date: "January 12, 2026",
            title: "🧠 SMARTER NPCs & PLAYER IDENTITY UPDATE",
            changes: [
                {
                    category: "🔁 NPC Repetition Fix",
                    items: [
                        "<strong>NO MORE COFFEE SPITTING 12 TIMES:</strong> NPCs now track their recent actions",
                        "• System extracts physical actions from responses and remembers them",
                        "• Similar actions detected (sips ≈ drinks, wipes ≈ dabs, laughs ≈ chuckles)",
                        "• AI prompted to avoid recently-used gestures - more natural conversations!",
                    ],
                },
                {
                    category: "👤 Expanded Player Bio",
                    items: [
                        "<strong>YOUR CHARACTER, YOUR WAY:</strong> Massive expansion to player customization",
                        "• New sections: Hair details, Face & Eyes, Skin, Body, Intimate Details",
                        "• Add personality traits, hobbies, likes, dislikes, and kinks",
                        "• Choose from fantasy races (elf, demon, angel, and more!)",
                        "• NPCs now reference your full description in conversations",
                    ],
                },
                {
                    category: "💬 Per-NPC Nicknames",
                    items: [
                        "<strong>NEW:</strong> Each NPC can call you by a different name!",
                        "• Set a custom nickname in each character's bio",
                        "• Leave blank to use your default player name",
                    ],
                },
                {
                    category: "🐕 Pet Management",
                    items: [
                        "<strong>NEW:</strong> Edit, remove, or add pets in employee bios",
                        "<strong>FIXED:</strong> NPCs no longer obsessively mention their pets every message",
                    ],
                },
                {
                    category: "🖼️ Better Image Generation",
                    items: [
                        "<strong>ANATOMY FIX:</strong> All images now include anti-mutation prompts",
                        '• "Correct hand anatomy, five fingers per hand, avoid extra limbs"',
                        "• Should reduce weird hands and extra appendages across the board",
                    ],
                },
                {
                    category: "🐛 Bug Fixes",
                    items: [
                        "<strong>FIXED:</strong> Communication mode now saves per-NPC (no more resetting to Auto)",
                        "<strong>FIXED:</strong> Races dropdown in character creation now works",
                        "<strong>FIXED:</strong> Gallery/family images now load correctly",
                        "<strong>FIXED:</strong> Fired employees removed from family tab",
                        "<strong>FIXED:</strong> Character generation no longer leaves traits blank",
                        "<strong>FIXED:</strong> Social feed refresh button actually refreshes now",
                        '<strong>FIXED:</strong> "All Types" post filter works reliably',
                        '<strong>FIXED:</strong> "Last message" timestamp uses in-game time',
                    ],
                },
            ],
        },
        {
            version: "202601111040",
            date: "January 11, 2026",
            title: "🌍 ETHNICITY, FAMILY & DIVERSITY UPDATE",
            changes: [
                {
                    category: "👨‍👩‍👧 Family Relationships",
                    items: [
                        "<strong>NEW FEATURE:</strong> Create family members for your employees!",
                        '<strong>• Click "Add Family Member"</strong> in any employee\'s bio modal',
                        "<strong>• Choose relationship:</strong> Mother, Father, Sister, Brother, Spouse, Cousin, Aunt, Uncle, and more!",
                        "",
                        "<strong>SMART INHERITANCE:</strong> Family members share traits",
                        "<strong>• Same ethnicity</strong> as their relative",
                        "<strong>• 70% chance</strong> to inherit eye color",
                        "<strong>• 50% chance</strong> to inherit hair color",
                        "<strong>• Appropriate ages</strong> (parents older, siblings similar, children 18+)",
                        "",
                        "<strong>AI AWARENESS:</strong> NPCs know about their family at work",
                        "<strong>• Shows in bio modal</strong> with clickable links",
                        "<strong>• Subtle context in chats</strong> - they won't obsess over it",
                        "<strong>• Meetings recognize family</strong> connections between participants",
                    ],
                },
                {
                    category: "🌍 Employee Ethnicities",
                    items: [
                        "<strong>NEW:</strong> Employees now have ethnicities! 11 diverse backgrounds represented",
                        "<strong>• East Asian, Southeast Asian, South Asian, Middle Eastern, Latino/Hispanic</strong>",
                        "<strong>• Black/African, Caucasian/European, Pacific Islander, Native American</strong>",
                        "<strong>• Central Asian, Indigenous/First Nations</strong>",
                        "",
                        "<strong>CHARACTER CREATION:</strong> Choose ethnicity when creating custom employees",
                        "<strong>BIO MODAL:</strong> Ethnicity now displayed in employee profiles",
                        "<strong>EXISTING SAVES:</strong> All current employees automatically assigned fitting ethnicities",
                    ],
                },
                {
                    category: "📛 Culturally-Inspired Names",
                    items: [
                        "<strong>SMARTER NAMES:</strong> Name generation now considers ethnicity",
                        "<strong>• First names:</strong> 60% chance of culturally-inspired name, 40% generic",
                        "<strong>• Last names:</strong> 75% chance of culturally-inspired surname, 25% generic",
                        "<strong>NATURAL FEEL:</strong> Names blend cultural heritage with universal appeal",
                    ],
                },
                {
                    category: "📊 Generation Counters",
                    items: [
                        "<strong>NEW:</strong> Track your total AI generations for the entire playthrough!",
                        "<strong>• Text Generations:</strong> See how many AI text responses you've requested",
                        "<strong>• Image Generations:</strong> See how many character portraits you've created",
                        "<strong>PERSISTENT:</strong> Counters save with your game and survive page refreshes",
                    ],
                },
                {
                    category: "🧹 Settings Cleanup",
                    items: [
                        '<strong>REMOVED:</strong> "UI Density" slider - it never actually did anything!',
                        "<strong>CLEANER:</strong> Settings panel now shows only functional options",
                    ],
                },
            ],
        },
        {
            version: "202601031900",
            date: "January 3, 2026",
            title: "🛡️ CUSTOM CHARACTER PROTECTION",
            changes: [
                {
                    category: "🛡️ Accidental Closure Protection",
                    items: [
                        "<strong>CRITICAL FIX:</strong> Custom character confirmation modal now prevents accidental closure",
                        "<strong>• PROBLEM:</strong> Clicking outside the modal would instantly close it, losing your generated character and prompt",
                        "<strong>• SOLUTION:</strong> Modal now requires confirmation before closing with unsaved character",
                        "<strong>• RESULT:</strong> No more lost characters from misclicks!",
                        "",
                        "<strong>NEW: Recover Last Character:</strong> Button appears in custom employee creator when you have an unsaved character",
                        '<strong>NEW: Confirmation Dialog:</strong> Closing the modal asks "Are you sure?" and reminds you the character is saved',
                        "<strong>NEW: Escape Key Protection:</strong> Pressing Escape also requires confirmation",
                    ],
                },
            ],
        },
        {
            version: "202601031800",
            date: "January 3, 2026",
            title: "💾 SAVE SYSTEM OPTIMIZATION",
            changes: [
                {
                    category: "💾 Debounced Save System",
                    items: [
                        "<strong>PERFORMANCE FIX:</strong> Eliminated save congestion during bulk operations",
                        "<strong>• PROBLEM:</strong> Team Building, Training Workshops, and other bulk operations were triggering 30+ simultaneous saves (one per employee)",
                        "<strong>• SOLUTION:</strong> Implemented debounced save system that coalesces rapid-fire saves into single operations",
                        "<strong>• RESULT:</strong> Massive performance improvement during stat-boosting activities!",
                        "",
                        "<strong>NEW: debouncedSave():</strong> Batches multiple save requests within 500ms window into one save",
                        "<strong>NEW: flushPendingSave():</strong> Forces immediate save when needed (used at end of bulk operations)",
                        "<strong>NEW: Save throttling:</strong> Auto-saves now skip if another save is in progress",
                        "<strong>NEW: MIN_SAVE_INTERVAL:</strong> 500ms minimum between saves prevents rapid-fire congestion",
                    ],
                },
                {
                    category: "⚡ Technical Changes",
                    items: [
                        "<strong>gainSkillXP():</strong> Now uses debouncedSave() instead of immediate saveGame()",
                        "<strong>conductTeamBuilding():</strong> Properly flushes pending saves before final save",
                        "<strong>conductTrainingWorkshop():</strong> Properly flushes pending saves before final save",
                        "<strong>saveGameToSlot():</strong> Added concurrency protection and throttling for auto-saves",
                    ],
                },
            ],
        },
        {
            version: "202601031440",
            date: "January 3, 2026",
            title: "🎬 NPC ACTION BUTTONS + CUSTOM EMPLOYEES",
            changes: [
                {
                    category: "🎬 NPC Action Buttons",
                    items: [
                        "<strong>NEW ACTION BAR:</strong> Guide NPCs with one-click action buttons during chat!",
                        "<strong>▶️ Continue:</strong> Keep the scene going naturally",
                        "<strong>🎬 Action:</strong> Trigger detailed physical actions (NPC does something, no dialogue)",
                        "<strong>💭 Thoughts:</strong> Peek into what the NPC is thinking",
                        "<strong>💕 Flirt / 😏 Tease / ✅ Comply / ⛔ Resist:</strong> Steer the mood",
                        "<strong>🎯 Custom:</strong> Type <code>/do [instruction]</code> for any custom action",
                        "<strong>⚙️ Configurable:</strong> Enable/disable buttons per employee",
                    ],
                },
                {
                    category: "👤 Custom Employee Creation",
                    items: [
                        "<strong>THREE WAYS TO CREATE:</strong>",
                        "<strong>🔗 From URL:</strong> Paste a wiki/character page link - AI extracts the character",
                        "<strong>✍️ From Description:</strong> Describe your character in plain text",
                        "<strong>📝 Manual Mode:</strong> Full control over every stat, trait, and appearance",
                        "",
                        "<strong>SMART WORKFLOW:</strong> Generation happens in background - keep playing!",
                        "<strong>REVIEW BEFORE HIRE:</strong> Edit and approve the generated character before finalizing",
                    ],
                },
                {
                    category: "📍 Position Selection",
                    items: [
                        "<strong>HIRE AT ANY LEVEL:</strong> Create Staff, Managers, or Division Heads directly",
                        "<strong>CHOOSE YOUR SLOT:</strong> Pick exactly which position to fill in your corporate pyramid",
                        "<strong>SMART DEFAULTS:</strong> Auto-selects the location you clicked from",
                    ],
                },
                {
                    category: "📋 Full Character Customization",
                    items: [
                        "<strong>EVERYTHING IS CUSTOMIZABLE:</strong> Name, age, gender, race, bio, personality sliders, relationship stats, work performance, traits, hobbies, kinks, physical appearance, schedule, and more!",
                        "<strong>AI FILLS GAPS:</strong> Leave fields blank and AI generates fitting values",
                    ],
                },
            ],
        },
        {
            version: "202512061200",
            date: "December 6, 2025",
            title: "🏛️ INNER SANCTUM FIXES + AI REQUEST MANAGEMENT",
            changes: [
                {
                    category: "🏛️ Inner Sanctum - Critical Fixes",
                    items: [
                        "<strong>🎯 HIRING SYSTEM FIX:</strong> Inner Sanctum staff now correctly assigned to location when hired",
                        "<strong>• PROBLEM:</strong> New managers hired for Inner Sanctum weren't getting location assignment",
                        "<strong>• SOLUTION:</strong> Added proper locationId assignment in hiring functions",
                        "<strong>• RESULT:</strong> Staff actually show up in Inner Sanctum after hiring!",
                        "",
                        '<strong>💰 UPGRADE COSTS FIX:</strong> Fixed "NaN%" display in Inner Sanctum money upgrades',
                        "<strong>• PROBLEM:</strong> Missing base cost entries caused percentage calculations to fail",
                        "<strong>• SOLUTION:</strong> Added Inner Sanctum entries to upgrade cost database",
                        '<strong>• RESULT:</strong> Upgrade percentages now display correctly instead of "NaN%"!',
                        "",
                        '<strong>⭐ ELITE UPGRADES FIX:</strong> Fixed "Nan% Level" display in Elite upgrade tooltips',
                        "<strong>• PROBLEM:</strong> Missing null-safety checks when accessing global upgrade data",
                        "<strong>• SOLUTION:</strong> Added proper safety operators throughout upgrade system",
                        "<strong>• RESULT:</strong> Elite upgrades now show proper level information!",
                    ],
                },
                {
                    category: "🤖 AI Request Management System - NEW!",
                    items: [
                        '<strong>🎯 SMART REQUEST QUEUE:</strong> Automatic prevention of "Max Requests Exceeded" errors',
                        "<strong>• PROBLEM:</strong> Too many simultaneous AI text generation requests causing failures",
                        "<strong>• SOLUTION:</strong> Built intelligent queue system that manages all AI requests automatically",
                        "<strong>• FEATURES:</strong> Configurable max concurrent requests (5-50), real-time status display, smart context detection",
                        "<strong>• RESULT:</strong> No more AI errors! Smooth text generation even during busy gameplay",
                        "",
                        "<strong>⚙️ NEW SETTINGS PANEL:</strong> AI Request Management in Settings",
                        "<strong>• Control max concurrent AI requests with easy slider</strong>",
                        "<strong>• Real-time monitoring of active/queued requests</strong>",
                        "<strong>• Visual feedback and status updates</strong>",
                        "<strong>• Settings persist across game saves/loads</strong>",
                        "",
                        "<strong>🔄 ZERO-IMPACT INTEGRATION:</strong> Works automatically with existing features",
                        "<strong>• All AI text generation now uses smart queue system</strong>",
                        "<strong>• No changes needed to existing game functions</strong>",
                        "<strong>• Automatic context detection for better queue descriptions</strong>",
                        "<strong>• Smart throttling prevents overwhelming Perchance AI plugin</strong>",
                    ],
                },
                {
                    category: "🛡️ System Improvements",
                    items: [
                        "<strong>🔒 Enhanced Null-Safety:</strong> Added protective checks throughout upgrade system to prevent crashes",
                        "<strong>💾 Persistent Settings:</strong> AI queue settings save/load with game data automatically",
                        "<strong>🎯 Smart Context Detection:</strong> AI queue provides better descriptions of what's being generated",
                        "<strong>📊 Real-Time Monitoring:</strong> Live status updates for AI request activity",
                    ],
                },
                {
                    category: "📊 Update Summary",
                    items: [
                        "<strong>INNER SANCTUM:</strong> 3 critical fixes (hiring, upgrades, elite display)",
                        "<strong>AI SYSTEM:</strong> Complete request management overhaul with settings UI",
                        "<strong>SAFETY:</strong> Enhanced null-safety throughout upgrade calculations",
                        "<strong>USER EXPERIENCE:</strong> New settings panel for AI request control",
                        "<strong>IMPACT:</strong> Eliminates AI request errors, fixes endgame location issues",
                        "<strong>TECHNICAL:</strong> ~100 lines new queue system, automatic integration",
                        "<strong>COMPATIBILITY:</strong> Zero breaking changes, works with existing saves",
                    ],
                },
            ],
        },
        {
            version: "2511132155",
            date: "November 13, 2025",
            title: "🎯 Quality of Life Update - Name Editing, Autosaves, Polish & Balance",
            changes: [
                {
                    category: "✨ New Features",
                    items: [
                        "<strong>✏️ Edit NPC Names in Overview Tab:</strong> Rename employees directly from Overview with validation (no duplicates, min 2 chars)",
                        "<strong>💾 Autosave Snapshots:</strong> 10 rotating snapshot slots (every 5 min) = 50 minutes of recovery history",
                        "<strong>🧝 Beautified Orcs:</strong> Modern athletic aesthetic instead of brutal warriors (gym-toned, radiant skin, cute tusks)",
                        "<strong>💬 Natural AI Conversations:</strong> Eliminated exhausting purple prose - NPCs talk like normal people now",
                        "<strong>🗑️ Cleaner Social Feed:</strong> Failed posts discard completely instead of posting generic spam",
                    ],
                },
                {
                    category: "⚖️ Balance Changes",
                    items: [
                        "<strong>🎮 Late Game Content:</strong> Rebalanced bosses for higher difficulty, added late-game upgrades",
                        "<strong>💰 Offline Earnings:</strong> Adjusted base offline earning rates",
                        "<strong>📊 Upgrade Rebalancing:</strong> Location-specific costs, increased upper limits",
                        "<strong>⚙️ Difficulty Controls:</strong> New employee start stat difficulty settings",
                    ],
                },
                {
                    category: "🐛 Bug Fixes",
                    items: [
                        "<strong>💾 Save Migration:</strong> Fixed kv.gameSave.del() → delete() TypeError",
                        "<strong>🔢 Number Display:</strong> Fixed abbreviation formatting issues",
                    ],
                },
                {
                    category: "🎨 Content Additions",
                    items: [
                        "<strong>🖼️ Art Styles Expanded:</strong> 20+ professional art style options for image generation",
                    ],
                },
            ],
        },
        {
            version: "2511130002",
            date: "November 13, 2025",
            title: "💰 CRITICAL FIX: Money Request Timing (Player Feedback)",
            changes: [
                {
                    category: "💰 Money Request System - Timing & Relationship Requirements",
                    items: [
                        '<strong>PLAYER FEEDBACK:</strong> "I have noticed that the NPC\'s almost always send a money request after the first or the second message" - Players felt NPCs were asking for money way too early in relationships.',
                        "<strong>PROBLEM ANALYSIS:</strong> Three timing issues allowed premature money requests:",
                        '<strong>• Too-Short Activity Window:</strong> Only 5 minutes since last message before considering conversation "inactive"',
                        "<strong>• Too-Short Player Protection:</strong> Only 10 minutes since player's last message before NPCs could interrupt",
                        "<strong>• No Relationship Gate:</strong> NPCs could request money after just 1-2 messages with zero relationship development",
                        "<strong>SOLUTION - TRIPLE FIX:</strong>",
                        "<strong>⏰ Extended Activity Window:</strong> 5 minutes → 60 minutes (12x increase)",
                        "<strong>⏰ Extended Player Protection:</strong> 10 minutes → 120 minutes (12x increase)",
                        "<strong>💕 Relationship Requirement:</strong> NOW REQUIRES 30+ messages exchanged before money requests are even considered",
                        "<strong>TECHNICAL CHANGES:</strong>",
                        "<strong>• Line ~30182:</strong> evaluateProactiveMessageTriggers() - Updated all timing checks",
                        "<strong>• Conversation Inactivity:</strong> timeSinceLastMessage > 60 minutes (was 5)",
                        "<strong>• Player Activity Check:</strong> timeSinceLastPlayerMessage > 120 minutes (was 10)",
                        "<strong>• Message Count Gate:</strong> conversation.messages.length < 30 early returns",
                        "<strong>BEHAVIOR CHANGES:</strong>",
                        "<strong>Before:</strong> NPCs could send money requests after 1-2 messages if 5 minutes passed",
                        "<strong>After:</strong> NPCs wait for 30+ messages AND 60+ minutes of inactivity AND 120+ minutes since your last message",
                        "<strong>📊 IMPACT ESTIMATE:</strong> Reduces premature money requests by ~90%. Money requests now only happen in established relationships after significant conversation history.",
                        "<strong>RESULT:</strong> NPCs no longer pester you for money immediately after meeting. Money requests now feel appropriate and relationship-appropriate!",
                    ],
                },
                {
                    category: "📊 Update Summary",
                    items: [
                        "<strong>FILES MODIFIED:</strong> 1 (index.html)",
                        "<strong>LINES CHANGED:</strong> ~15 lines in evaluateProactiveMessageTriggers()",
                        "<strong>TIMING ADJUSTMENTS:</strong> 3 critical thresholds increased",
                        "<strong>NEW REQUIREMENTS:</strong> 1 (30-message minimum)",
                        "<strong>PLAYER IMPACT:</strong> Immediate - affects all conversations",
                        "<strong>COMPILATION:</strong> ✅ No errors",
                    ],
                },
            ],
        },
        {
            version: "2511130001",
            date: "November 13, 2025",
            title: "✨ NEW FEATURES: Character Name Editing + Fantasy/Anthro Races",
            changes: [
                {
                    category: "✏️ NEW: Character Name Editing with Validation",
                    items: [
                        "<strong>EDIT CHARACTER NAMES:</strong> You can now change employee names in the bio modal while in edit mode! The name field is fully editable with comprehensive validation.",
                        "<strong>VALIDATION SYSTEM:</strong> Prevents common issues with name changes:",
                        "<strong>• Empty Name Check:</strong> Cannot save blank or whitespace-only names",
                        "<strong>• Minimum Length:</strong> Names must be at least 2 characters long",
                        "<strong>• Duplicate Detection:</strong> Cannot create duplicate names - checks against all active employees (case-insensitive)",
                        "<strong>• Onboarding Queue Check:</strong> Also checks names in the onboarding queue to prevent conflicts",
                        "<strong>• usedEmployeeNames Sync:</strong> Automatically updates the global name tracking Set (removes old name, adds new name)",
                        "<strong>SAFETY FEATURES:</strong>",
                        "<strong>• Auto-Revert:</strong> If validation fails, the name field automatically reverts to the original value",
                        "<strong>• Clear Errors:</strong> Specific error notifications tell you exactly what went wrong",
                        "<strong>• Success Confirmation:</strong> Shows notification with old → new name when successful",
                        "<strong>DATA INTEGRITY:</strong> All references remain intact:",
                        "<strong>• Chat History:</strong> Uses employee IDs, not names (safe)",
                        "<strong>• Relationships:</strong> Uses employee IDs, not names (safe)",
                        "<strong>• Social Posts:</strong> Uses employee IDs, not names (safe)",
                        '<strong>HOW TO USE:</strong> Open any employee bio → Click "✏️ Edit" → Click the name field → Type new name → Click "💾 Save"',
                        "<strong>TECHNICAL:</strong> Name validation runs BEFORE the main save handler, with early return on failure. Name field is explicitly excluded from the general field save loop to prevent double-processing.",
                    ],
                },
                {
                    category: "🧬 NEW: Fantasy & Anthropomorphic Races System",
                    items: [
                        '<strong>SPECIES DIVERSITY:</strong> Employees can now be generated as fantasy and anthropomorphic species! Configure in HR → Gender Options (now "Gender & Race Options").',
                        "<strong>PROPORTIONAL DISTRIBUTION:</strong> Works exactly like gender sliders - adjust percentages that must total 100%.",
                        "<strong>AVAILABLE RACES:</strong>",
                        "<strong>Fantasy Races:</strong>",
                        "<strong>• 👤 Human:</strong> Standard humans (default: 100%)",
                        "<strong>• 🧝 Elf:</strong> Graceful with pointed ears and ethereal beauty",
                        "<strong>• 💪 Orc:</strong> Muscular with green skin, tusks, strong jawline",
                        "<strong>• 😈 Demon:</strong> Horns, spaded tail, pale skin with red undertones",
                        "<strong>Anthropomorphic Races:</strong>",
                        "<strong>• 🦊 Foxkin:</strong> Fox ears, fluffy tail, sharp canine features",
                        "<strong>• 🐺 Wolfkin:</strong> Wolf ears, tail, fierce golden eyes",
                        "<strong>• 😺 Catkin:</strong> Cat ears, tail, feline eyes with slit pupils",
                        "<strong>• 🐰 Rabbitkin:</strong> Long rabbit ears, cotton ball tail, soft features",
                        "<strong>SLIDER SYSTEM:</strong>",
                        "<strong>• Proportional Normalization:</strong> Sliders auto-adjust to maintain 100% total",
                        "<strong>• Real-time Updates:</strong> Live percentage display for each race",
                        "<strong>• Visual Feedback:</strong> Total turns red if not exactly 100%",
                        "<strong>• Smart Distribution:</strong> When you change one slider, others adjust proportionally",
                        "<strong>PHYSICAL INTEGRATION:</strong> Race features automatically added to descriptions:",
                        '<strong>• Ears:</strong> "pointed elf ears", "cat ears", "fox ears", "wolf ears", "long rabbit ears", "small pointed horns"',
                        '<strong>• Tails:</strong> "cat tail", "fluffy fox tail", "wolf tail", "cotton ball tail", "spaded demon tail"',
                        '<strong>• Skin:</strong> "green skin" (orcs), "pale skin with subtle red undertones" (demons)',
                        '<strong>• Other:</strong> "ethereal beauty", "feline eyes with slit pupils", "tusks", "fierce golden eyes", etc.',
                        "<strong>IMAGE GENERATION:</strong> Physical descriptions include race features in AI prompts:",
                        '<strong>• Short Description:</strong> "average height slim foxkin woman with..."',
                        '<strong>• Full Description:</strong> Includes "Distinctive features: fox ears, fluffy fox tail, sharp canine features"',
                        '<strong>• Gender-Neutral Terms:</strong> Uses "kin" suffix (foxkin, wolfkin, etc.) instead of gendered terms',
                        "<strong>UI DESIGN:</strong>",
                        "<strong>• Organized Layout:</strong> Fantasy races grouped separately from anthropomorphic races",
                        "<strong>• Color-Coded:</strong> Each race has unique accent colors",
                        '<strong>• Category Headers:</strong> Clear "✨ Fantasy Races" and "🐾 Anthropomorphic Races" sections',
                        "<strong>• Descriptive Text:</strong> Each race includes a brief description",
                        "<strong>TECHNICAL IMPLEMENTATION:</strong>",
                        "<strong>• selectRaceForEmployee():</strong> Weighted random selection matching gender system",
                        "<strong>• getRaceFeatures():</strong> Returns race-specific physical attributes",
                        "<strong>• normalizeRaceSliders():</strong> Auto-balances percentages to 100%",
                        "<strong>• Race Field:</strong> Added to employee objects alongside gender",
                        '<strong>BACKWARDS COMPATIBLE:</strong> Existing employees default to "human" race. System works seamlessly with all existing features.',
                        "<strong>SETTINGS PERSISTENCE:</strong> Race settings save with your game and persist across sessions",
                        "<strong>DEFAULT CONFIGURATION:</strong> All races start at 0% except Human (100%) - opt-in system",
                        "<strong>PERFECT FOR:</strong> Fantasy office settings, furry-friendly gameplay, diverse character rosters, roleplay scenarios, creative storytelling",
                    ],
                },
            ],
        },
        {
            version: "2511122010",
            date: "November 12, 2025",
            title: "💾 MAJOR: Multi-Slot Save Manager + 🐛 Critical Player Feedback Fixes",
            changes: [
                {
                    category: "💾 NEW: Advanced Multi-Slot Save System",
                    items: [
                        "<strong>🎉 BRAND NEW SAVE MANAGER:</strong> Complete overhaul of the save system inspired by modern RPGs! Replace simple save/load buttons with a full-featured modal interface for managing multiple save slots.",
                        "<strong>💾 MULTI-SLOT ARCHITECTURE:</strong> Create unlimited named saves - no more overwriting your only save! Save types: Manual Saves (your named saves), Quick Saves (F5 shortcut), Autosaves (automatic every 5 seconds).",
                        "<strong>⌨️ KEYBOARD SHORTCUTS:</strong> Press F5 anywhere for instant Quick Save, F9 for Quick Load (loads most recent quick save), Esc to close Save Manager.",
                        "<strong>🎨 BEAUTIFUL MODAL INTERFACE:</strong> Tab-based view (Manual / Auto & Quick), sortable table (Name, Day, Saved At, Playtime), search/filter by save name, inline editing (double-click to rename), row selection and highlights.",
                        "<strong>📊 RICH METADATA TRACKING:</strong> Every save stores: Save date/time, custom save name, save type (auto/quick/manual), total playtime, current game day, money amount, employee count, prestige level.",
                        "<strong>✨ POWERFUL FEATURES:</strong>",
                        '<strong>• Create New Save:</strong> "+ Create New Save" button in manual tab',
                        "<strong>• Rename Saves:</strong> Double-click any save name to edit inline",
                        "<strong>• Delete Saves:</strong> Click ✕ button with confirmation (autosave protected)",
                        "<strong>• Export/Import:</strong> Download individual saves as JSON files, import saves from backup files",
                        '<strong>• Load Saves:</strong> Click "Load" button or double-click save row',
                        '<strong>• Continue:</strong> Quick "Continue" button loads most recent save',
                        "<strong>• Sort & Filter:</strong> Click column headers to sort, search box for filtering",
                        "<strong>🔒 SAFETY FEATURES:</strong> Autosave slot cannot be deleted or renamed, confirmation dialogs before deleting saves, duplicate name checking prevents overwrites, corrupted save validation before loading, automatic migration from legacy format.",
                        '<strong>📱 SETTINGS PANEL UPDATE:</strong> Replaced 4 individual buttons (Save, Load, Export, Import) with single "💾 Save/Load Manager" button, added keyboard shortcut hints (F5/F9), clean gradient styling with hover effects.',
                        '<strong>🔄 AUTOMATIC MIGRATION:</strong> Old single-save format automatically converts to new system on first load, creates "migrated_legacy" save with all your progress, preserves original save for safety, completely transparent to users.',
                        "<strong>🎨 VISUAL DESIGN:</strong> Dark blue theme matching FUOC style (var(--l-panel-2)), cyan accents (var(--l-cyan)), save type badges (blue=auto, green=quick, default=manual), smooth animations and transitions, custom scrollbar styling, empty state messages.",
                        "<strong>💾 STORAGE FORMAT:</strong> Slot naming: fuoc_save_autosave, fuoc_save_quick_123, fuoc_save_My_Adventure. Backward compatible with old saveGame() function. Uses existing kv-plugin for persistence.",
                        "<strong>📝 CONSOLE LOGGING:</strong> All operations log with [SaveManager] prefix, shows save/load/delete/rename/export/import actions, emoji indicators for different operation types.",
                        "<strong>📊 CODE STATS:</strong> ~1,600 lines of new code added, 9 new backend functions, ~690 line SaveManager UI class, ~508 lines of CSS styling, zero compilation errors.",
                        "<strong>✅ BENEFITS:</strong> Never lose progress from overwriting saves, experiment with different game paths, backup important milestones, quick save before risky decisions, organize saves with meaningful names, modern professional UX.",
                    ],
                },
                {
                    category: "💰 CRITICAL FIX: Money Request Frequency",
                    items: [
                        '<strong>PLAYER FEEDBACK:</strong> "Love how everyone of my employees keeps asking me for ridiculous amounts of money." - Players felt constantly pestered by money requests.',
                        "<strong>PROBLEM:</strong> NPCs requesting money every 24 game hours (1 day), ~15% of ALL proactive messages were money requests, felt like constant spam.",
                        "<strong>SOLUTION - DRASTICALLY REDUCED:</strong>",
                        "<strong>⏰ Cooldown increased:</strong> 24 hours → 168 hours (7 game days)",
                        "<strong>⏰ Emergency requests:</strong> 72 hours minimum (3 days) even when broke",
                        "<strong>📊 Target frequency:</strong> 15% → 3-5% of proactive messages",
                        "<strong>📉 Weight reductions:</strong> Base: 8→2 (75% cut), Broke: 20→8 (60% cut), Low cash: 14→5 (64% cut)",
                        "<strong>🎯 Stricter requirements:</strong> Now requires affection > 50 AND trust > 50 (was 40/40)",
                        "<strong>💰 Updated thresholds:</strong> Low on cash: 7→14 days spending, Broke: 2→7 days spending",
                        "<strong>RESULT:</strong> Money requests are now rare, meaningful events that only happen when NPCs genuinely need help. No more constant financial nagging!",
                    ],
                },
                {
                    category: "👻 CRITICAL FIX: Fired Employees in Social Feed",
                    items: [
                        '<strong>PLAYER FEEDBACK:</strong> "Some characters i fired keep talking in socials not sure how to fix that" - Ex-employees haunting the social feed.',
                        "<strong>PROBLEM:</strong> Social feed showed posts from ALL employees ever hired, fired/terminated employees continued posting, no filter to remove ex-employees.",
                        "<strong>SOLUTION:</strong> Added Step 0 to filterAndSortPosts() that filters out fired employees BEFORE all other filters, checks current employee roster and only shows posts from active employees, preserves player and system posts.",
                        "<strong>📊 LOGGING:</strong> Console shows how many posts were filtered out from ex-employees.",
                        "<strong>RESULT:</strong> Social feed now only shows posts from current employees. Ex-employees no longer haunt your feed!",
                    ],
                },
                {
                    category: "☠️ CRITICAL FIX: PR Meeting Extreme Content",
                    items: [
                        '<strong>PLAYER FEEDBACK:</strong> "Just held a PR meeting, after roughly 10 suggestions made by the AI, they suggested we tattoo our company logo onto terminal ill patients morphine ridden skin, and to have suicide notes with our logo live sent on tv." - AI generating horrifying, morbid PR suggestions.',
                        "<strong>PROBLEM:</strong> No content safety filters in meeting responses, AI could generate morbid/extreme/illegal suggestions, no boundaries on what NPCs could suggest.",
                        "<strong>SOLUTION - COMPREHENSIVE CONTENT SAFETY:</strong> Added safety rules to all meeting prompts:",
                        "<strong>❌ BLOCKS:</strong> Suicide, self-harm, death references, terminal illness/hospices/medical trauma, exploitation of vulnerable people (sick/dying/imprisoned), extreme violence/gore/morbid content, illegal activities (murder/terrorism/exploitation)",
                        "<strong>✅ ENFORCES:</strong> Ethical, legal, reasonable suggestions, constructive redirection if topic gets dark",
                        "<strong>RESULT:</strong> NPCs now stay within appropriate boundaries during meetings. No more horrifying PR disasters!",
                    ],
                },
                {
                    category: "🗑️ BUG FIX: Clear Chat Button",
                    items: [
                        "<strong>PLAYER FEEDBACK:</strong> \"The 'clear' button in chat doesn't work\" - Button failing silently.",
                        "<strong>PROBLEM:</strong> gameState.activeChat could be either ID (string) or object, code assumed it was always an ID, failed silently when activeChat was an object.",
                        "<strong>SOLUTION:</strong> Added flexible handling: const activeChatId = gameState.activeChat?.id || gameState.activeChat, better validation checks, enhanced console logging for debugging, improved user feedback.",
                        "<strong>RESULT:</strong> Clear button now works reliably regardless of activeChat format!",
                    ],
                },
                {
                    category: "📸 BUG FIX: Chat Images Not Generating",
                    items: [
                        '<strong>PLAYER FEEDBACK:</strong> "In chats its describing an image but not sending an image" - NPCs saying "Here\'s a picture" without generating it.',
                        "<strong>PROBLEM:</strong> Agreement detection too strict, missed cases where NPC described sending without using specific keywords.",
                        "<strong>SOLUTION - IMPROVED DETECTION:</strong>",
                        '<strong>• Added keywords:</strong> "attaching", "attached" to strong agreement',
                        '<strong>• Added describingSending check:</strong> "send", "sent", "sending", "here is", "this is", "look at", "check out"',
                        '<strong>• Added imageDescribed check:</strong> NPC mentions "picture", "photo", "selfie", "image"',
                        "<strong>• Combined logic:</strong> Agrees if describing sending + mentioning image + no refusal",
                        "<strong>• Enhanced logging:</strong> Shows when image detected, type requested, whether NPC agreed, response snippet",
                        "<strong>RESULT:</strong> NPCs now actually send images when they say they will. More reliable image generation!",
                    ],
                },
                {
                    category: "✅ Scene Visualization Verification",
                    items: [
                        '<strong>PLAYER FEEDBACK:</strong> "scene visualization stopped using the character description" - Concern about missing character details.',
                        "<strong>STATUS:</strong> Already working correctly! visualizeCurrentScene() calls getPhysicalDescriptionForPrompt(emp) which includes full physical appearance, active flags (pregnant, chastity, pierced, etc.), and passes description to AI.",
                        "<strong>VERIFIED:</strong> Feature is implemented and functional - no changes needed.",
                    ],
                },
                {
                    category: "📊 Update Summary",
                    items: [
                        "<strong>FILES MODIFIED:</strong> 1 (index.html)",
                        "<strong>TOTAL NEW CODE:</strong> ~1,750 lines (1,600 save system + 150 fixes)",
                        "<strong>BALANCE CHANGES:</strong> 1 major (money request frequency)",
                        "<strong>SAFETY FEATURES:</strong> 1 new (meeting content filters)",
                        "<strong>BUG FIXES:</strong> 3 critical (fired employees, clear button, image detection)",
                        "<strong>MAJOR FEATURES:</strong> 1 (complete save manager overhaul)",
                        "<strong>COMPILATION:</strong> ✅ No errors",
                        "<strong>GIT COMMITS:</strong> 2 (dc5ae84 save system, 9e418d0 feedback fixes)",
                    ],
                },
            ],
        },
        {
            version: "2511051900",
            date: "November 5, 2025",
            title: "🐛 Critical Bug Fixes - Chat, Posts, Selfies & Rehire System",
            changes: [
                {
                    category: "💬 Chat Message Persistence Fix",
                    items: [
                        "<strong>FIXED: Messages Disappearing on Chat Close:</strong> Chat messages no longer disappear when you close the chat modal before the next autosave.",
                        "<strong>ROOT CAUSE:</strong> Autosave runs every 5 seconds. If you sent messages and closed the chat within those 5 seconds, the messages would be lost.",
                        "<strong>SOLUTION:</strong> Added explicit saveGame() call when closing chat modal. Messages are now immediately persisted to localStorage/kv-plugin.",
                        "<strong>IMPACT:</strong> You can safely close chats immediately after sending messages without losing your conversation history.",
                    ],
                },
                {
                    category: "📝 Post Regeneration Context Preservation",
                    items: [
                        "<strong>FIXED: Post Refresh Losing Context:</strong> Regenerating/refreshing posts now maintains the same topic and theme instead of generating completely random new content.",
                        "<strong>ROOT CAUSE:</strong> The regeneratePost() function was calling the AI without any reference to the original post content, so each refresh created an entirely new random post.",
                        '<strong>SOLUTION:</strong> Modified AI prompt to include the original post content as context with instruction: "Rewrite this same idea with different wording, keep the same vibe and topic."',
                        "<strong>IMPACT:</strong> Clicking refresh on a work achievement post will generate different wording of the same achievement, not a completely unrelated post about lunch or weekend plans.",
                    ],
                },
                {
                    category: "📸 Meeting Selfie Error Handling",
                    items: [
                        "<strong>FIXED: Meeting Selfie Silent Failures:</strong> Meeting selfie requests now provide helpful error messages instead of failing silently.",
                        "<strong>ROOT CAUSE:</strong> The requestGroupSelfie() function had minimal error checking. If your profile was incomplete or participants were invalid, it would fail without telling you why.",
                        "<strong>SOLUTION:</strong> Added 5 validation checkpoints with specific error messages:",
                        "<strong>• Check 1:</strong> Verify participants array exists",
                        '<strong>• Check 2:</strong> Verify player profile is complete (shows "Please set up your profile in Settings")',
                        "<strong>• Check 3:</strong> Verify at least one valid participant",
                        "<strong>• Check 4:</strong> Filter out invalid/deleted employees",
                        "<strong>• Check 5:</strong> Confirm remaining participants after filtering",
                        "<strong>IMPACT:</strong> Clear error messages guide you to fix issues (e.g., completing your profile) instead of wondering why the selfie button doesn't work.",
                    ],
                },
                {
                    category: "🔧 Rehire System Complete Overhaul",
                    items: [
                        '<strong>FIXED: Duplicate Employee Names:</strong> You can no longer hire the same person twice (e.g., two "Lydia Hunt" employees).',
                        "<strong>FIXED: Rehires Going Through Onboarding:</strong> Rehired employees no longer go through the onboarding process or generate new info.",
                        '<strong>ROOT CAUSE #1:</strong> When selecting a candidate for hire, their name was marked as "used" during generation but not verified again at selection time. If someone was still in the onboarding queue, the same name could be regenerated.',
                        '<strong>ROOT CAUSE #2:</strong> Clicking "⭐ Rehire" was calling selectManagerCandidate() which treats everyone as a new hire and adds them to the onboarding queue, even though these were returning employees with saved data.',
                        "<strong>SOLUTION - Part 1 (Duplicate Names):</strong> ",
                        "<strong>• Immediate Name Marking:</strong> Added name to usedEmployeeNames Set immediately when candidate is selected, not just when finalized",
                        "<strong>• Onboarding Sync:</strong> generateUniqueName() now checks the onboarding queue and adds those names to the Set before generating new names",
                        "<strong>• Safety Checks:</strong> Added Set initialization checks and console logging for debugging",
                        "<strong>SOLUTION - Part 2 (Rehire Onboarding):</strong>",
                        "<strong>• Route Fix:</strong> Rehire candidates now call finalizeRehire() instead of selectManagerCandidate() when clicked",
                        "<strong>• Data Preservation:</strong> All rehire data (stats, skills, personality, physical, chat history, etc.) is restored from the rehire pool",
                        "<strong>• Skip Onboarding:</strong> Rehired employees are added directly to gameState.employees with onboarding: false, hired: true, bioComplete: true",
                        "<strong>• ID Tracking:</strong> Preserves original rehire pool ID to properly remove them from the pool after hiring",
                        "<strong>WHAT THIS MEANS:</strong>",
                        "<strong>✅ No Duplicate Names:</strong> Each employee name is unique across active employees, onboarding queue, and rehire pool",
                        "<strong>✅ Instant Rehires:</strong> Former employees are ready to work immediately with all their history intact",
                        "<strong>✅ Data Preservation:</strong> Rehired employees keep their productivity bonuses, loyalty bonuses, relationship stats, chat history, and memories",
                        "<strong>✅ No Bio Generation:</strong> Rehires don't get new random bios or stats - everything is preserved from their previous employment",
                        "<strong>IMPACT:</strong> The rehire system now works exactly as intended - bringing back former employees with all their context and history, not treating them as brand new hires.",
                    ],
                },
                {
                    category: "🎨 UI Layout Optimization",
                    items: [
                        "<strong>IMPROVED: Social Feed Layout:</strong> Made the social feed sidebar more compact and extended the main feed area.",
                        "<strong>CHANGES:</strong>",
                        "<strong>• Sidebar Width:</strong> Reduced from 280px to 220px",
                        "<strong>• Container Height:</strong> Increased from calc(100vh - 200px) to calc(100vh - 160px)",
                        "<strong>• Spacing:</strong> Reduced gap from 20px to 15px, padding from 12px to 8px",
                        "<strong>• Font Sizes:</strong> Reduced from 0.95rem to 0.85rem for more compact display",
                        '<strong>• Button Text:</strong> Shortened labels ("All Content" → "All", "Popular (5+ reactions)" → "Popular (5+)")',
                        "<strong>• Scrolling:</strong> Added overflow-y: auto to sidebar for better scroll behavior",
                        "<strong>IMPACT:</strong> More screen space for posts, less scrolling needed, cleaner visual hierarchy.",
                    ],
                },
            ],
        },
        {
            version: "2511051245",
            date: "November 5, 2025",
            title: "🎭 THE ALGORITHM™ + Mean Girl Drama System",
            changes: [
                {
                    category: "📊 NEW: The Algorithm™ - Advanced Social Feed System",
                    items: [
                        "<strong>🔥 HOT SORTING:</strong> Reddit-style hot algorithm shows what's trending RIGHT NOW based on engagement divided by time decay",
                        "<strong>🏆 BEST SORTING:</strong> Find the highest quality posts with time filters (Hour/Day/Week/Month/All Time)",
                        "<strong>📅 RECENT SORTING:</strong> Classic chronological view - newest posts first",
                        "<strong>💥 CONTROVERSIAL SORTING:</strong> See posts with the most disagreement - high engagement but mixed upvotes/downvotes",
                        "<strong>🎨 CONTENT RATING FILTERS:</strong> Toggle between All/SFW/NSFW/Explicit to control what you see",
                        "<strong>📝 POST TYPE FILTERS:</strong> Filter by Text/Images/Selfies/Work Posts",
                        "<strong>👥 AUTHOR FILTERS:</strong> View posts from everyone, just you, people you follow, or specific employees",
                        "<strong>🔥 ENGAGEMENT FILTERS:</strong> Show All Posts, Popular (10+ likes), Viral (25+ likes), or Active Discussion (5+ comments)",
                        "<strong>🔍 REAL-TIME SEARCH:</strong> Search post content, authors, hashtags, and mentions with live result counts",
                        "<strong>💾 SAVED PREFERENCES:</strong> All your filter settings are remembered between sessions",
                    ],
                },
                {
                    category: "😈 NEW: Mean Girl Drama System",
                    items: [
                        "<strong>👎 DOWNVOTING:</strong> NPCs now downvote posts they don't like - controversial sorting finally works!",
                        "<strong>💔 RIVALRY DRAMA:</strong> Enemies downvote each other 70% of the time, leaving shade in their wake",
                        '<strong>💅 SNARKY COMMENTS:</strong> 25% chance for downvoters to leave catty comments like "Sure, if you say so 🙄" or "Must be nice"',
                        "<strong>😳 PRUDISH REACTIONS:</strong> Conservative NPCs clutch their pearls at explicit content (+50% downvote chance)",
                        "<strong>😤 JEALOUS HATERS:</strong> Mean NPCs target popular posts, lazy NPCs hate on work posts",
                        "<strong>⚔️ ESCALATING FEUDS:</strong> Each downvote reduces relationship by -3, can escalate to full rivalry status",
                        "<strong>🎲 RANDOM CATTINESS:</strong> Even neutral NPCs have a 25% chance to be randomly mean - keeps things spicy",
                    ],
                },
                {
                    category: "📸 Profile & Meeting Enhancements",
                    items: [
                        "<strong>🏢 COMPANY NAME:</strong> Your company name now appears on your profile (not just description)",
                        "<strong>🤳 PLAYER SELFIES FIXED:</strong> @player and @TheBoss mentions now work properly in image generation",
                        "<strong>💬 AUTOCOMPLETE:</strong> Type @TheBoss or @player in any image prompt for instant suggestions",
                        "<strong>🎬 MEETING VISUALIZATIONS:</strong> Generate AI images of your current meeting scene",
                        "<strong>📸 GROUP SELFIES:</strong> Request all meeting participants to pose together (+2 affection boost for everyone)",
                        "<strong>📊 MEETING STATS:</strong> Track messages sent, participants, images shared, and money spent per meeting",
                        "<strong>🤖 AI MEETING SUMMARIES:</strong> Generate smart summaries of what happened in each meeting",
                        "<strong>🧹 AUTO-CLEANUP:</strong> Old/deleted employees are automatically removed from meeting participants on load",
                    ],
                },
                {
                    category: "💰 Money Request Improvements",
                    items: [
                        "<strong>💳 PROPER MODAL UI:</strong> Money requests now use the proper Approve/Counter/Deny interface instead of plain text",
                        "<strong>⏰ COOLDOWN SYSTEM:</strong> 1 hour cooldown between money requests prevents spam",
                        "<strong>🎲 UNPROMPTED REQUESTS:</strong> Most money requests now come out of the blue, not mid-conversation",
                        "<strong>⚖️ BALANCED FREQUENCY:</strong> ~15% of proactive messages are money requests - feels natural not annoying",
                        "<strong>💰 SMART AMOUNTS:</strong> Request amounts calculated based on NPC spending rate, bank balance, and financial need",
                    ],
                },
                {
                    category: "💬 Proactive Message Personalization",
                    items: [
                        "<strong>💕 RELATIONSHIP-AWARE MESSAGING:</strong> NPCs now send more personal messages based on relationship depth",
                        "<strong>✨ CLOSE RELATIONSHIPS (70+ affection, 20+ messages):</strong> Reference earlier conversations, pick up hanging threads, show they've been thinking about you, bring up inside jokes and shared moments",
                        "<strong>🌱 FRIENDLY RELATIONSHIPS (40+ affection, 10+ messages):</strong> More comfortable and personal, mix professional and personal topics, reference past conversations naturally",
                        "<strong>👔 PROFESSIONAL RELATIONSHIPS (Low affection, few messages):</strong> Work-focused with friendly touches, appropriate getting-to-know-you questions",
                        "<strong>🎯 SMART CONTEXT:</strong> Work updates connect to previous discussions for close relationships, casual chats reference specific shared topics, questions build on conversation history",
                        '<strong>🚫 NO MORE GENERIC SPAM:</strong> Close relationships won\'t send random "quick q" or generic work updates - messages feel authentic and connected',
                    ],
                },
                {
                    category: "📸 Image Request Fixes",
                    items: [
                        "<strong>🎨 FIXED: Custom Image Requests:</strong> NPCs now send images that actually match what they say they're sending!",
                        '<strong>🔧 ROOT CAUSE:</strong> Generic presets were overriding custom requests - even detailed requests would generate generic "casual selfie" images',
                        "<strong>✅ PRIORITY FIX:</strong> Custom prompts now take priority over generic templates - AI analyzes your request and conversation context",
                        '<strong>🏖️ CONTEXT-AWARE:</strong> Detailed requests like "send your island vacation balcony pics" now generate appropriate matching images',
                        "<strong>💯 ACCURATE RESULTS:</strong> What NPCs describe in their message now matches the actual image they send",
                    ],
                },
            ],
        },
        {
            version: "2511032200",
            date: "November 3, 2025",
            title: "💬 MAJOR: Group Meetings System - Multi-NPC Dynamic Conversations",
            changes: [
                {
                    category: "💬 NEW: Group Meetings System",
                    items: [
                        '<strong>🎉 BRAND NEW TAB:</strong> Introducing the "Meetings" tab - a revolutionary group chat system where you can have dynamic conversations with up to 5 employees at once! NPCs interact with each other naturally, creating organic, emergent group dynamics.',
                        '<strong>CREATE CUSTOM MEETINGS:</strong> Choose up to 5 employees to invite. Set a custom meeting name (e.g., "Q4 Planning", "Friday Night Drinks", "Emergency Meeting"). Configure reply limit (1-10 responses per player message). Meetings are persistent - they save automatically and you can return to them anytime.',
                        "<strong>INTELLIGENT SPEAKER SELECTION:</strong> Advanced AI-driven priority system determines who speaks next based on multiple factors: Direct mentions (+100 priority), question detection (+30), recency penalty (recently spoken NPCs are less likely), silence bonus (NPCs who haven't spoken get +25), contextual keywords (management/technical/creative topics boost relevant NPCs), relationship levels (higher affection = slight boost), randomness (keeps conversations unpredictable).",
                        "<strong>NATURAL GROUP DYNAMICS:</strong> NPCs reference each other's comments, build on previous points, and create threaded conversations. Anti-repetition system tracks overused phrases across last 5 messages and guides NPCs to bring fresh perspectives. Perspective Mode: NPCs only know about relationships and events they've witnessed (secret relationships stay secret unless both parties are present).",
                        '<strong>RELATIONSHIP-AWARE CONTEXT:</strong> Compact relationship maps show each NPC\'s connection to you and other participants (♥ relationship level, 🔥 attraction, kids, relationship flags). NPCs leverage their knowledge of group dynamics: "I noticed you two have been spending time together..." Dynamic history depth: 2-3 people = 25 messages context, 4 people = 20 messages, 5+ people = 15 messages (prevents token overflow).',
                        "<strong>FLEXIBLE REPLY SYSTEM:</strong> Configurable reply limit per message (default: 5). NPCs take turns responding naturally - not everyone speaks every turn. Live reply counter shows remaining responses. Stop button to halt current reply chain if conversation gets too long. Turn-based structure: You speak → NPCs respond up to limit → Your turn again.",
                        "<strong>RICH INTERACTION MENU:</strong> Click any participant avatar to open action menu: 💰 Send Money (individual cash gifts), 🎁 Give Gift (show appreciation in meetings), 📷 Request Image (ask specific NPC for photo), 📤 Send Image (share photos directly). Plus global meeting actions: 💰 Send Money (Group) - give cash to all participants at once, 🍕 Order Food/Drinks - treat everyone to meals, 🎬 Visualize Current Scene - AI-generated group photo of current situation, 📷 Request Group Selfie - all NPCs pose together, 🎮 Start Team Building Activity - boost morale of all participants.",
                        "<strong>PROFESSIONAL UI/UX:</strong> Two-panel layout: Sidebar lists all meetings with participant avatars, main area shows active conversation. Clean chat interface with participant avatars for each message. Message regeneration per NPC response (♻️ button on hover). Meeting settings modal: Rename meetings, adjust reply limits, customize text/image size, view participant list. One-click meeting deletion with confirmation.",
                        "<strong>CONVERSATION QUALITY:</strong> Higher temperature (0.9) for more personality variety in group settings. Stop sequences prevent run-on responses. Rich participant descriptions passed to AI. Dynamic history prevents token bloat in large meetings. Compact relationship notation saves tokens while preserving context.",
                        "<strong>MOBILE RESPONSIVE:</strong> Collapsible sidebar with toggle button. Touch-friendly action menus. Adaptive text sizing. Optimized for all screen sizes.",
                        "<strong>USE CASES:</strong> Business meetings with department heads, casual hangouts with friend groups, team building sessions, romantic encounters with multiple partners, drama-filled confrontations, party planning with social circles, office gossip sessions, training/mentoring groups.",
                        "<strong>TECHNICAL MARVEL:</strong> 3,000+ lines of new code. Full integration with existing systems (gifts, money transfers, images, relationships). Persistent state management. Smart memory handling for performance. Console logging for debugging speaker selection and AI decisions.",
                    ],
                },
                {
                    category: "🔧 Conversation System Improvements",
                    items: [
                        "<strong>FIXED: Regenerate Stat Penalty:</strong> Regenerating NPC responses in 1-on-1 conversations NO LONGER triggers stat change evaluation. Previously, re-rolling a response multiple times would compound negative stat changes if you were unlucky. Now stats are only evaluated when the original message is sent, not on regenerations.",
                        "<strong>WHY THIS MATTERS:</strong> Sometimes you need to regenerate an AI response to get better quality or avoid bugs. You shouldn't be penalized with relationship damage just for using the regenerate button.",
                        "<strong>TECHNICAL:</strong> Removed updateEmployeeStatsFromChat() call from regenerateMessage() function. Added explanatory comment in code. Regeneration count and temperature scaling still work normally.",
                    ],
                },
            ],
        },
        {
            version: "2511021300",
            date: "November 2, 2025",
            title: "🐛 CRITICAL: Message Concatenation Bug Fix + 📸 Smart Image Proof System",
            changes: [
                {
                    category: "🐛 Critical Bug Fixes",
                    items: [
                        "<strong>FIXED: Message Concatenation Bug:</strong> Resolved critical issue where NPC responses would concatenate entire conversation history into a single massive response. This occurred when the AI echoed back previous messages instead of generating only a new response.",
                        "<strong>ROOT CAUSE:</strong> Conversation history was being passed to AI as plain text context, which the AI would sometimes interpret as content to include in its response rather than background information.",
                        '<strong>PROMPT FIX:</strong> Wrapped conversation history with clear header "=== RECENT CONVERSATION (for context only - do NOT repeat or echo these messages) ===" and added explicit instruction: "CRITICAL: Respond ONLY as [Name] with a NEW single message. DO NOT repeat or include previous conversation messages in your response."',
                        '<strong>SANITIZATION FIX:</strong> Enhanced sanitizeNpcResponse() with conversation history echo detection. If AI response contains multiple "Name: message" patterns (3+ instances), function now automatically extracts only the final new response and discards echoed history.',
                        "<strong>FALLBACK PROTECTION:</strong> Added multi-layer extraction logic - first attempts to find last non-history line, then falls back to extracting last paragraph if heavy echoing detected (5+ pattern matches).",
                        "<strong>IMPACT:</strong> NPCs now always generate single, fresh responses instead of accidentally repeating 5+ previous messages. Chat conversations remain clean and properly formatted.",
                    ],
                },
                {
                    category: "📸 NEW: Universal Smart Image System",
                    items: [
                        "<strong>NEW: NPCs Respond with Images to ANYTHING!</strong> Massively expanded image detection system. NPCs can now generate and attach images for virtually ANY type of request - animals, food, nature, hobbies, selfies, nudes, and more!",
                        "<strong>WORKS EVERYWHERE:</strong> Image detection works in ALL comment scenarios: NPCs replying to your comments on THEIR posts, NPCs commenting on YOUR posts, NPCs joining ongoing conversations.",
                        '<strong>ANIMALS & PETS:</strong> Ask for cat/dog/pet pictures and NPCs will send adorable animal photos. Special feature: "pussy/kitty" requests have playful misinterpretation chance! 😏',
                        '<strong>PLAYFUL MISUNDERSTANDING:</strong> When flirty NPCs (65+ flirtiness, 60+ desire) see requests for "pussy" or "kitties", 35% chance they "understand the assignment" and send a suggestive intimate photo instead of a cat. Others send actual cat pics.',
                        "<strong>FOOD & DRINKS:</strong> Recognizes requests for: food/meals, coffee/lattes, cocktails/drinks, desserts/sweets. Generates appetizing food photography.",
                        "<strong>NATURE & OUTDOORS:</strong> Detects: sunsets/sunrises, beaches/ocean, mountains/hiking, flowers/gardens. Creates beautiful nature photography.",
                        "<strong>ACTIVITIES & HOBBIES:</strong> Responds to: books/reading, gaming, music/instruments with appropriate themed images.",
                        "<strong>SEXUAL/INTIMATE:</strong> Full support for: nudes, sexy selfies, regular selfies, work photos, outfit pics, gym photos, artistic content. Context-aware based on request tone.",
                        "<strong>INTELLIGENT FALLBACK:</strong> If specific category not detected, extracts key nouns from post to generate relevant image. Ultimate fallback: selfie.",
                        "<strong>EXAMPLE SCENARIOS:</strong>",
                        '<strong>• Wholesome:</strong> "I\'m feeling down. Show me your kitties" → Multiple NPCs send cute cat photos 🐱',
                        '<strong>• Playful:</strong> Same request → Flirty Faith "misunderstands" and sends intimate close-up 😈, while shy Loretta sends actual cat pic',
                        '<strong>• Food:</strong> "Post your best meal!" → NPCs share delicious food photography 🍕',
                        '<strong>• Nature:</strong> "Sunset pics?" → Beautiful sunset photos from multiple NPCs 🌅',
                        '<strong>• Challenge:</strong> "Sexiest selfie wins $1000" → Faith/Vanessa/others compete with sexy selfies 💋',
                        "<strong>REUSABLE HELPER FUNCTION:</strong> detectAndGenerateCommentImage() handles all detection, context analysis, and generation. Used across all comment functions.",
                        '<strong>DEBUG LOGGING:</strong> Console shows what type of image is being generated and special "[MISUNDERSTOOD]" tag when flirty NPCs playfully misinterpret.',
                        "<strong>TECHNICAL:</strong> 50+ detection patterns covering animals, food, nature, hobbies, intimate content. Personality-driven behavior (flirtiness, desire affect interpretation). Graceful fallbacks at every level.",
                    ],
                },
                {
                    category: "💬 Comment Generation Quality Fixes",
                    items: [
                        "<strong>FIXED: Meta-Commentary Leakage:</strong> Resolved issue where NPC comments would include instruction text like \"Here's [Name]'s comment based on their personality...\" instead of just posting the comment naturally.",
                        '<strong>FIXED: Third-Person Narration:</strong> Eliminated narration bleeding into comments such as "*Marie Todd\'s eyes scan the social feed*" or "*chuckle escapes*". NPCs now write comments as themselves, not describe themselves.',
                        '<strong>FIXED: Name Prefix Problem:</strong> Removed erroneous name prefixes appearing in comments: "Kennedy Torres\' comment:", "Faith Starr\'s comment flashes on-screen:", etc.',
                        '<strong>FIXED: Phrasing Issues:</strong> Changed past tense "Already sent my cat\'s glamour shot" to natural present tense "Here\'s my kitty! 🐱" when posting images. Comments now sound like real-time social media interaction.',
                        '<strong>ENHANCED PROMPT:</strong> Complete rewrite of generateContextAwareComment() with explicit "CRITICAL RULES" section:',
                        "<strong>• Rule 1:</strong> Write ONLY the comment text itself (5-20 words)",
                        '<strong>• Rule 2:</strong> NO third-person narration (NO "*eyes scan*", "*chuckle escapes*")',
                        '<strong>• Rule 3:</strong> NO meta-text (NO "Here\'s my comment:", "Based on personality:")',
                        '<strong>• Rule 4:</strong> NO name prefixes (NO "[Name]:" or "[Name]\'s comment:")',
                        "<strong>• Rule 5:</strong> Be natural and conversational like a real social media comment",
                        "<strong>ENHANCED SANITIZATION:</strong> Multi-layer cleanup system catches any remaining issues:",
                        "<strong>• Strip narration:</strong> Removes all asterisk-wrapped narration patterns",
                        '<strong>• Remove meta prefixes:</strong> Eliminates "Here\'s", "Based on", "My comment is:", "I would say:"',
                        '<strong>• Remove name prefixes:</strong> Aggressively strips "[Name]:" or "[Name]\'s comment:" patterns (fixed to avoid removing legitimate comment starts like "Well," or "Dog person?")',
                        '<strong>• Remove character actions:</strong> Strips third-person narration like "[Name] raised an eyebrow at the screen, fingers already tapping."',
                        '<strong>• Fix phrasing:</strong> Replaces "already sent/DM\'d" with "Here\'s" for natural present tense',
                        "<strong>• Fallback detection:</strong> Checks for remaining meta-text patterns and triggers simple fallback",
                        "<strong>IMPROVED IMAGE DETECTION:</strong> Enhanced regex patterns to catch more image claim variations:",
                        '<strong>• Basic claims:</strong> "Posted!", "Here\'s mine!", "Sent!", "Sharing!" with or without emoji',
                        '<strong>• Specific content:</strong> "Here\'s my garden", "Posted a peek", "My kitty!"',
                        '<strong>• Context-aware:</strong> Better detection of "brought proof", "sharing this", etc.',
                        '<strong>NEW: "BUSH" CONTEXT DETECTION:</strong> Smart detection of intimate vs. garden context:',
                        '<strong>• Intimate context:</strong> When post mentions "carpet/drapes", "trim", "grooming", "wax" → Flirty NPCs (60+ flirtiness, 50+ desire) have 65% chance to respond with intimate photo',
                        '<strong>• Garden misunderstanding:</strong> Other NPCs playfully "misunderstand" and send garden/landscaping photos 🌿',
                        '<strong>• Example:</strong> "Does the carpet match the drapes? Send bush pics" → Flirty NPCs send intimate photos, others send garden photos with playful comments',
                        '<strong>NEW: "CHECK DMs" ACTUALLY WORKS!</strong> When NPCs comment "Check DMs" or "Sent you a DM", they now ACTUALLY send a private message!',
                        '<strong>• Detection:</strong> Automatically detects comments mentioning: "check DM", "sent your way", "DMing you", "private message", "in your inbox", etc.',
                        "<strong>• Smart Content:</strong> DM content matches original request - if you asked for nudes, they send nudes; if you asked for selfies, they send selfies",
                        "<strong>• Image Generation:</strong> DMs include actual generated images matching the request (nudes, sexy pics, regular photos, etc.)",
                        "<strong>• Timing:</strong> DM arrives 2-5 seconds after comment for natural feel",
                        '<strong>• Notifications:</strong> You get notification toast when DM arrives: "💬 [Name] sent you a private message with a photo!"',
                        '<strong>• Example:</strong> You post "Send me a nude", Quiana comments "Sent one your way! Check DMs 😉", then 3 seconds later she actually DMs you a nude photo',
                        '<strong>SPECIAL HANDLING:</strong> Image requests get extra guidance - NPCs say "Here\'s mine! 🐱" not "already sent my cat pic" when posting images. If AI still produces meta-text, fallback returns simple natural response.',
                        "<strong>IMPACT:</strong> Comments now read exactly like real social media - short, natural, no meta-text, no narration, no instruction leakage. Quality matches human-written social media comments. Image generation now understands context and responds appropriately (intimate vs. playful). NPCs follow through on DM promises!",
                    ],
                },
            ],
        },
        {
            version: "2511021212",
            date: "November 2, 2025",
            title: "⏱️ TIME CONTROL & BOSS SCALING UPDATE",
            changes: [
                {
                    category: "⏱️ Time Control System",
                    items: [
                        "<strong>NEW: Cheat Menu Time Controls:</strong> Added comprehensive time management panel in cheats menu. Includes time scale slider (1x-100x), pause/resume button, skip 1 day button, and live game time display.",
                        "<strong>Time Scale Slider:</strong> Adjust game speed from 1x (real-time) to 100x (ultra fast). Default 20x speed preserved. Visual display shows current speed with descriptive labels (Real Time, Slow, Default, Fast, Very Fast, Ultra Fast).",
                        "<strong>Quick Presets:</strong> Three one-click preset buttons - 1x Real Time, 20x Default, 60x Fast. Makes common speed adjustments instant.",
                        "<strong>Pause/Resume Time:</strong> Dedicated button to completely freeze game time. Button changes color (red when paused, green when running) and shows current status.",
                        "<strong>Skip 1 Day:</strong> Advance game time by exactly 24 hours and trigger all daily events. Perfect for testing or skipping downtime.",
                        '<strong>Live Time Display:</strong> Always-visible panel showing current game date/time formatted naturally (e.g., "Tuesday, November 2, 2025, 3:45 PM"). Updates every second while cheats menu is open.',
                        "<strong>Integrated Controls:</strong> All time controls modify gameState.time properties directly and persist through saves. Changes take effect immediately without requiring game restart.",
                    ],
                },
                {
                    category: "⚔️ Boss Fight Scaling",
                    items: [
                        "<strong>NEW: Prestige Health Scaling:</strong> Boss health now scales exponentially with prestige level using 1.5x multiplier formula. Prevents bosses from becoming trivial one-shots after multiple prestiges.",
                        "<strong>Scaling Formula:</strong> scaledHealth = baseHealth × (1.5^prestigeLevel). Prestige 0 = 100% health, Prestige 1 = 150%, Prestige 2 = 225%, Prestige 3 = 338%, etc.",
                        '<strong>Combat Log Notification:</strong> When boss fights start, combat log now shows prestige scaling message in gold: "⭐ Prestige X: Boss health increased by Y%"',
                        "<strong>Debug Logging:</strong> Console logs base health, scaled health, prestige level, and multiplier for each boss fight to help with balance testing.",
                        "<strong>Maintains Challenge:</strong> High-level players now face appropriately challenging bosses that require strategy rather than instant victories.",
                    ],
                },
                {
                    category: "🐛 Bug Fixes",
                    items: [
                        '<strong>FIXED: "Manage Flags" Button Error:</strong> Resolved SyntaxError in employee management modal. Renamed arrow function parameter from "e" to "emp" to avoid onclick attribute parsing conflicts.',
                        "<strong>FIXED: Children Array Undefined:</strong> Added defensive null checks in getEmployeeChildren(), renderChildren(), and ageChildren() functions. Game no longer crashes when children array is undefined in older save files.",
                        '<strong>ENHANCED: Social Posts Performance:</strong> Added helpful tooltip to "Clear All Posts" button explaining performance benefits. System already auto-trims posts to 100-500 range to prevent slowdowns.',
                    ],
                },
                {
                    category: "💬 NPC Conversation Improvements",
                    items: [
                        '<strong>Time Context Fix:</strong> NPCs now receive accurate time context in conversations. When time is paused, removed "Time has passed during this conversation" message to avoid confusion. When time is running normally, message remains to maintain time awareness.',
                        "<strong>Cleaner Prompts:</strong> Conversation prompts now dynamically adjust based on game state (paused vs running) for more natural and contextually appropriate NPC responses.",
                    ],
                },
                {
                    category: "🎮 Quality of Life",
                    items: [
                        "<strong>Backward Compatibility:</strong> All changes are fully compatible with existing save files. No data migration needed.",
                        "<strong>Persistent Settings:</strong> Time scale and pause state save with game state and restore on load.",
                        "<strong>Visual Feedback:</strong> Time controls provide clear visual feedback with color changes, status text, and real-time display updates.",
                        "<strong>Professional UI:</strong> Cheats menu time section features gradient styling, smooth transitions, and intuitive layout matching existing game aesthetic.",
                    ],
                },
            ],
        },
        {
            version: "2510312300",
            date: "October 31, 2025",
            title: "🔗 MASSIVE FLAG CHAIN EXPANSION - 16 Total Progression Systems",
            changes: [
                {
                    category: "🔗 Flag Chain System Architecture",
                    items: [
                        "<strong>NEW: Two-Tier Chain System:</strong> Chains are now classified as AUTO-APPLY (natural progressions that happen automatically) or SUGGESTED (player-approved changes for relationships/dynamics). Auto chains handle biological/time-based progressions, suggested chains require player confirmation via beautiful modal UI.",
                        "<strong>NEW: Chain Definitions System:</strong> Added comprehensive <code>gameState.flagChains.definitions</code> with 16 chain types. Each chain has type (auto/suggest), trigger conditions, duration thresholds, and metadata requirements.",
                        "<strong>NEW: Suggestion Queue:</strong> Added <code>gameState.flagChains.suggestions[]</code> array to track pending player decisions. Prevents duplicate suggestions and tracks approval/rejection history.",
                        "<strong>ENHANCED: processFlagChains():</strong> Completely rewrote to handle both auto-apply and suggestion logic (300+ lines). Runs daily via <code>onDayChange()</code>, checks all employees for chain eligibility, applies auto-chains instantly, creates suggestions for player-approved chains.",
                    ],
                },
                {
                    category: "⚡ AUTO-APPLY CHAINS (3) - Natural Progressions",
                    items: [
                        "<strong>EXISTING: Pregnancy Chain:</strong> pregnant → lactating (30 days) → postpartum (3 days). Already implemented, unchanged.",
                        "<strong>NEW: In Heat Duration:</strong> in_heat flag now AUTO-REMOVES after 5 game days. In heat is a temporary condition - NPCs return to normal after duration expires. Notification shown when heat ends.",
                        "<strong>NEW: Chastity → In Heat (7 days):</strong> After 7 days in chastity device, NPC automatically develops in_heat condition from prolonged denial. Extremely aroused, desperate, sensitive. System checks daily and auto-adds in_heat flag with proper AI guidance linking it to chastity frustration.",
                        "<strong>Implementation:</strong> All 3 auto-chains run silently in background with console logging. Player sees notifications for major events (heat starting/ending, birth) but chains execute automatically without interrupting gameplay.",
                    ],
                },
                {
                    category: "💕 SUGGESTED RELATIONSHIP CHAINS (3) - Player Approval Required",
                    items: [
                        "<strong>NEW: Relationship Progression (2 stages):</strong> in_relationship (30 days) → SUGGEST engaged_to_player → engaged_to_player (21 days) → SUGGEST married_to_player. Natural relationship escalation over 51+ total days. Player can approve engagement after 30 days of dating, then approve marriage after 21 days engaged.",
                        "<strong>NEW: Secret Revealed (14 days):</strong> secret_relationship → SUGGEST in_relationship. After 14 days of secret dating, system suggests making relationship official/public. Player chooses whether to reveal or keep hiding.",
                        "<strong>Approval UI:</strong> Beautiful gradient modal with NPC photo, relationship timeline, flag preview with emoji/category/AI guidance excerpt, clear APPROVE/DECLINE buttons. Non-intrusive - appears once per chain milestone, never spams.",
                    ],
                },
                {
                    category: "🎭 SUGGESTED D/s CHAINS (4) - Progressive Deepening",
                    items: [
                        "<strong>NEW: D/s Progression (3 stages):</strong> submissive (14 days) → SUGGEST collared → collared (21 days) → SUGGEST ownership_dynamic → ownership_dynamic (30 days) → SUGGEST 24_7_dynamic. Progressive deepening from casual submission to lifestyle 24/7 power exchange. Total timeline: 65+ days for full progression.",
                        "<strong>Stage 1 (14 days):</strong> Submissive behavior proven consistent → suggest formalizing with collar. Collar represents visible commitment to dynamic.",
                        "<strong>Stage 2 (21 days):</strong> Devoted collar-wearing → suggest deepening to ownership dynamic. NPC belongs to player completely.",
                        "<strong>Stage 3 (30 days):</strong> Ownership established → suggest 24/7 lifestyle dynamic. Power exchange extends to all aspects of life, not just intimate moments.",
                        "<strong>NEW: Pet Play → Collared (14 days):</strong> Parallel path - pet_play flag for 14 days suggests adding collar (pet formalization). Pet dynamic naturally includes collar-wearing.",
                    ],
                },
                {
                    category: "🔥 SUGGESTED ESCALATION CHAINS (3) - Intensity Increases",
                    items: [
                        "<strong>NEW: Free Use → Public Use (21 days):</strong> After 21 days of free_use with player, suggests expanding to public_use (available to others). Major escalation requiring explicit player approval.",
                        "<strong>NEW: No Clothes → Permanently Nude (14 days):</strong> After 14 days working naked, suggests formalizing as permanently_nude. Converts temporary arrangement to permanent commitment.",
                        "<strong>NEW: Exhibitionist → Permanently Nude (14 days):</strong> Parallel path - exhibitionist tendencies for 14 days suggests permanent nudity as natural escalation of showing-off desires.",
                    ],
                },
                {
                    category: "💀 SUGGESTED EXTREME CHAIN (1) - Corruption Breaking",
                    items: [
                        "<strong>NEW: Corruption → Mind Broken (30 days + intimacy):</strong> corruption_level_high for 30+ days + intimacy > 70 → SUGGEST mind_broken. Extreme corruption over extended time can lead to mental rewiring. Requires both duration AND high intimacy (can't break someone you barely know). Player must explicitly approve this permanent personality change.",
                        "<strong>Safety Checks:</strong> Dual requirements (time + relationship depth) prevent accidental mind-breaking. This is end-game corruption content requiring player intention.",
                    ],
                },
                {
                    category: "🧪 LOW PRIORITY / NICHE CHAINS (5) - Advanced Content",
                    items: [
                        "<strong>NEW: Breeding Progression (2 stages):</strong> breeding_kink (21 days) → SUGGEST impregnation_fetish → impregnation_fetish (14 days + intimacy >60) → SUGGEST pregnant. Natural escalation from kink to fetish to actualization. Player must approve pregnancy suggestion.",
                        "<strong>NEW: Masochist → Degradation Kink (21 days):</strong> After 21 days of masochist flag, suggests expanding from physical pain to verbal degradation/humiliation. Expands kink scope.",
                        "<strong>NEW: Rope Bunny → Chastity (21 days):</strong> After 21 days enjoying bondage, suggests escalating to chastity device. Equipment progression from rope to metal/plastic restraint.",
                        '<strong>NEW: Mind Broken Recovery Path (3 stages):</strong> mind_broken (30 days) → SUGGEST recovering_mind (manual start) → recovering_mind (21 days AUTO) → recovered_mind (permanent). Optional redemption arc - player can choose to help broken NPCs recover. Recovery takes 21 days of "therapy". Some personality changes remain permanent even after recovery.',
                        "<strong>NEW: Hypnotized Branching (14-30 days):</strong> Multi-path system - after 14 days hypnotized, suggests adding trigger flags (submissive, exhibitionist, pet_play). After 30 days, can deepen to mind_broken. Hypnosis becomes gateway to multiple personality modifications.",
                        "<strong>Recovery Mechanics:</strong> recovering_mind flag shows gradual improvement, recovered_mind flag indicates completion but with lasting vulnerability/submissiveness. New flags: 🧠 recovering_mind, ✨ recovered_mind.",
                    ],
                },
                {
                    category: "🎨 Chain Suggestion UI/UX",
                    items: [
                        "<strong>Beautiful Modal Design:</strong> Gradient purple header with 🔗 emoji, dark blue content area, NPC photo/name/position card, reason explanation in highlighted box, suggested flag preview with full details (emoji, description, category, AI guidance preview).",
                        "<strong>Clear Action Buttons:</strong> Green gradient APPROVE button, red gradient DECLINE button, both with hover animations (lift effect, glow intensifies). Visual hierarchy makes decision obvious.",
                        "<strong>Context Information:</strong> Modal shows days elapsed, relationship context, reason for suggestion. Player has full information to make informed decision.",
                        "<strong>Sound Effects:</strong> Gentle notification chime (600Hz sine wave) when suggestion appears. Non-jarring, just enough to draw attention.",
                        "<strong>No Spam:</strong> Each chain suggestion appears ONCE when threshold met. System tracks suggestion history to prevent re-suggesting rejected chains.",
                        "<strong>z-index: 30000000:</strong> Chain modals appear above everything (chat, other modals, notifications) ensuring player never misses decision opportunities.",
                    ],
                },
                {
                    category: "🔧 Technical Implementation",
                    items: [
                        "<strong>Modified: gameState.flagChains:</strong> Added suggestions[] array and comprehensive definitions{} object with 10 chain types. Each definition includes type, trigger conditions, durations, descriptions with {name}/{days} placeholders.",
                        "<strong>Created: suggestFlagChain():</strong> Checks for duplicate suggestions, fetches flag templates, creates suggestion object, shows approval modal. Prevents spam by tracking pending suggestions.",
                        "<strong>Created: getQuickFlagTemplate():</strong> Returns flag template by key for 16 most common flags. Used by chain system to build suggestions with proper emoji/guidance.",
                        "<strong>Created: showFlagChainSuggestion():</strong> Renders beautiful approval modal with NPC context, chain reasoning, flag preview. Includes animations (fadeIn, slideUp) for smooth appearance.",
                        "<strong>Created: approveFlagChainSuggestion():</strong> Adds flag with chain metadata, marks suggestion approved, closes modal, shows success notification, saves game.",
                        "<strong>Created: rejectFlagChainSuggestion():</strong> Marks suggestion rejected, closes modal, logs decision. Rejected suggestions won't re-appear.",
                        "<strong>Enhanced: processFlagChains():</strong> Now 200+ lines handling all 10 chains. Checks flag existence, calculates days elapsed, validates conditions, triggers auto-chains, creates suggestions. Comprehensive logging for debugging.",
                        "<strong>Animation Styles:</strong> Added fadeIn/slideUp CSS keyframe animations for modal entrance. Smooth 0.3s transitions for professional feel.",
                    ],
                },
                {
                    category: "📊 Chain System Statistics",
                    items: [
                        "<strong>Total Chains Implemented:</strong> 16 (3 auto-apply + 13 player-approved)",
                        "<strong>Auto-Apply Chains:</strong> pregnancy cycle, in_heat duration (5 days), chastity → in_heat (7 days), recovering_mind → recovered_mind (21 days)",
                        "<strong>Suggested Chain Duration Range:</strong> 14-30 days before suggestion appears",
                        "<strong>Longest Progression:</strong> D/s chain - 65+ days from submissive to 24/7 dynamic (3 stages with approval gates). Breeding chain - 35+ days from kink to pregnancy (2 stages).",
                        "<strong>Multi-Stage Chains:</strong> 4 chains with multiple stages (relationship progression, D/s progression, breeding progression, mind recovery)",
                        "<strong>Branching Chains:</strong> Hypnosis can branch to 4 different outcomes (submissive, exhibitionist, pet_play, or mind_broken)",
                        "<strong>Relationship Milestones:</strong> 30 days dating → engagement option, 51+ days total → marriage option",
                        "<strong>Safety Thresholds:</strong> Mind_broken requires both 30 days corruption AND 70+ intimacy. Pregnancy suggestion requires 14 days + 60+ intimacy.",
                        "<strong>Recovery System:</strong> Mind_broken can recover over 51 total days (30 broken + 21 recovering). Some changes remain permanent.",
                        "<strong>Total New Flags:</strong> Added 3 new flags (postpartum, recovering_mind, recovered_mind) as chain-only flags. Total premade flags now 50.",
                    ],
                },
                {
                    category: "🎮 Gameplay Impact",
                    items: [
                        "<strong>Natural Relationship Development:</strong> Relationships now feel organic - dating naturally progresses to engagement/marriage over time rather than instant jumps.",
                        "<strong>D/s Realism:</strong> Power dynamics deepen gradually with player approval at each escalation. Submissive → collar → ownership → 24/7 feels earned.",
                        "<strong>Temporary Conditions:</strong> In heat no longer permanent (5 day duration adds realism). Chastity has consequences (triggers heat after 7 days).",
                        "<strong>Player Agency:</strong> All major relationship/dynamic changes require explicit approval. Player controls relationship pace and intensity.",
                        "<strong>Corruption Stakes:</strong> High corruption can lead to mind_broken if player chooses - adds weight to corruption gameplay.",
                        "<strong>Nudity Escalation:</strong> Exhibitionism/workplace nudity can formalize into permanent naked lifestyle with player consent.",
                        "<strong>Kink Progression:</strong> Physical kinks (masochism, bondage) can escalate to more intense forms (degradation, chastity). Breeding kink can become reality.",
                        "<strong>Redemption Arcs:</strong> Mind_broken NPCs can be helped to recover, though some personality changes remain. Adds compassionate gameplay option.",
                        "<strong>Hypnosis Flexibility:</strong> Hypnotized NPCs can develop in multiple directions based on player choice (submissive training, exhibitionism, pet play, or breaking).",
                    ],
                },
                {
                    category: "🔮 Future Chain Expansion Ready",
                    items: [
                        "<strong>Extensible Architecture:</strong> Adding new chains only requires defining them in gameState.flagChains.definitions and adding check logic to processFlagChains().",
                        "<strong>ALL PLANNED CHAINS IMPLEMENTED:</strong> Original 16 suggested chains now complete (pregnancy, in_heat, chastity, relationships, D/s, pet, free_use, nudity, exhibitionism, corruption, breeding, masochism, rope, recovery, hypnosis).",
                        "<strong>Metadata Support:</strong> All flags track startDate enabling duration calculations. Can add event counters, intensity levels, etc. for complex chain conditions.",
                        "<strong>Conditional Chains:</strong> System supports additional conditions beyond time (e.g., intimacy thresholds, corruption levels, conversation counts).",
                    ],
                },
            ],
        },
        {
            version: "2510312100",
            date: "October 31, 2025",
            title: "🏷️ MAJOR FLAG SYSTEM OVERHAUL - Pregnancy, Children & Auto-Detection",
            changes: [
                {
                    category: "🏷️ Flag Detection System Expansion",
                    items: [
                        "<strong>EXPANDED: 31+ Detection Patterns (TRIPLED!):</strong> Massively expanded from 9 to 31+ auto-detection patterns. New patterns: engaged, cumslut, anal_only, bimbo, pet_play, masochist, sadist, switch, bratty, size_queen, degradation_kink, praise_kink, creampie_lover, oral_fixation, lactation_kink, impregnation_fetish, cock_worship, daddy_kink, mommy_kink, voyeur, cucking, ownership_dynamic, service_submissive, rope_bunny, 24_7_dynamic, mind_broken (fucked stupid), and more.",
                        "<strong>ENHANCED: Pattern Definitions:</strong> All patterns include proper emoji, category (condition/agreement/personality/relationship/preference), priority levels, and detailed playerDescription + aiGuidance text. Categories: condition (pregnancy, chastity), agreement (free use, nudity), relationship (dating, married, engaged, ownership), preference (kinks, fetishes), personality (dom/sub/switch/brat/bimbo).",
                        '<strong>IMPROVED: Detection Accuracy:</strong> Enhanced keyword lists with more variations and natural language patterns. Added contextKeywords for better accuracy (e.g., pregnancy keywords require "your/yours/our/baby" context). Lowered thresholds for clear signals (many now 1-2 occurrences).',
                        "<strong>FIXED: Z-Index Issue:</strong> Flag notification modals were appearing BEHIND chat windows (z-index 100000 vs chat at 10000010). Increased flag notifications to z-index 20000000 ensuring they always appear on top during conversations.",
                    ],
                },
                {
                    category: "🤰 Pregnancy & Birth System",
                    items: [
                        "<strong>NEW: Automatic Pregnancy Tracking:</strong> When pregnant flag is added, system auto-calculates due date based on <code>gameState.pregnancySettings.duration</code> (default 14 game days, configurable 7-21). Stores conception date and due date in flag metadata.",
                        "<strong>NEW: Birth Events:</strong> <code>processFlagChains()</code> runs daily checking pregnant NPCs' due dates. On due date arrival, <code>giveBirth()</code> triggers: creates child object, removes pregnant flag, adds postpartum + lactating flags, shows birth notification.",
                        "<strong>NEW: Flag Chains (UNREALISTIC TIMING):</strong> Pregnancy → Lactating (30 days) → Postpartum (3 days - FAST recovery). System automatically removes flags after duration expires. Lactating flag added immediately after birth with metadata linking to child. Postpartum only lasts 3 game days for unrealistic quick recovery.",
                        '<strong>NEW: Father Tracking:</strong> Pregnancy metadata stores father ID ("player" or employee ID). Father info displayed in child records and used for genetic inheritance.',
                        "<strong>NEW: Pregnancy Initialization:</strong> <code>initializePregnancy()</code> function called automatically when pregnant flag added via detection OR manual creation. Sets due date, shows notification with countdown.",
                    ],
                },
                {
                    category: "👶 Children System",
                    items: [
                        "<strong>NEW: Children Data Structure:</strong> Added <code>gameState.children[]</code> array storing all offspring. Each child has: id, name, gender (boy/girl), motherID, fatherID, birthDate, age (auto-calculated daily), genetics{}, traits[], photo.",
                        "<strong>NEW: Genetic Inheritance:</strong> <code>createChild()</code> generates child with 50/50 genetics from both parents: hairColor, eyeColor, skinTone, height. Randomly inherits physical traits ensuring biological realism.",
                        "<strong>NEW: Personality Inheritance:</strong> Children inherit 2 random personality traits from combined parent trait pool (mother.personality.traits + father.personality.traits). Creates unique blend of parental characteristics.",
                        "<strong>NEW: Name Generation (70+ Names!):</strong> Auto-generates age-appropriate names from curated lists of 70 boy names and 70 girl names (expanded from 10 each). Includes modern popular names like Theodore, Santiago, Aurora, Gabriella, etc. Gender randomly determined at birth (50/50 chance).",
                        '<strong>NEW: Age Progression:</strong> <code>ageChildren()</code> function calculates child age in game days from birthDate. Ages displayed as "Newborn", "X days old", "X months old", "X years old" with proper pluralization.',
                        '<strong>NEW: Children Tab in Profile:</strong> Added "👶 Children" tab to unified employee profile modal. Displays all children with photos, ages, genetics, personality traits, and parent info. Shows "No children yet" if none exist.',
                    ],
                },
                {
                    category: "📊 Children Display System",
                    items: [
                        "<strong>NEW: Child Cards:</strong> Beautiful card layout showing child photo (emoji-based), name in gold text, age with proper formatting, gender icon (♂️/♀️), parent names with colored styling.",
                        "<strong>NEW: Genetics Display:</strong> Each child card shows inherited traits in grid layout: Hair color, Eye color, Skin tone, Height. All inherited from biological parents.",
                        '<strong>NEW: Personality Traits:</strong> Shows inherited personality traits as colored badges (e.g., "friendly", "caring", "confident"). Traits come from both parents\' trait pools.',
                        "<strong>NEW: Parent Info Section:</strong> Displays mother and father with proper name coloring (player name in gold, NPC names in character colors). Shows relationship clearly.",
                        '<strong>NEW: Empty State:</strong> Graceful "No children yet" message with centered styling when employee has no children.',
                    ],
                },
                {
                    category: "🔗 Flag Chain System",
                    items: [
                        "<strong>NEW: Chain Definitions:</strong> Added <code>gameState.flagChains</code> with active chain tracking and definitions. Pregnancy chain defined with 3 stages: pregnant (until due date) → lactating (30 days) → postpartum (3 days - UNREALISTIC fast recovery).",
                        "<strong>NEW: Daily Processing:</strong> <code>processFlagChains()</code> called from <code>onDayChange()</code> every game day. Checks all active flags for expiration, progression triggers, and automatic transitions.",
                        "<strong>NEW: Auto-Removal:</strong> Lactating (30 days) and postpartum (3 days only!) flags automatically removed after duration expires. System calculates days since startDate and compares to configured duration. Quick postpartum recovery for unrealistic gameplay.",
                        "<strong>NEW: Metadata Linking:</strong> All chain-related flags store child ID in metadata enabling cross-reference between flags and children. Postpartum/lactating flags link back to specific child.",
                        "<strong>EXTENSIBLE: Future Chains:</strong> System designed for easy expansion - can add new chains for other conditions (illness → recovery, addiction → withdrawal, training → mastery, etc.)",
                    ],
                },
                {
                    category: "⚙️ Technical Implementation",
                    items: [
                        "<strong>Modified: <code>gameState</code> Structure:</strong> Added <code>children[]</code> array and <code>flagChains{}</code> object to save data. Fully serializable and backward compatible.",
                        "<strong>Modified: <code>addFlag()</code>:</strong> Now calls <code>initializePregnancy()</code> when pregnant flag added. Auto-populates father metadata if missing. Handles pregnancy initialization automatically.",
                        '<strong>Modified: <code>removeFlag()</code>:</strong> Enhanced to accept flag key OR flag ID for flexible removal. Used by chain system to remove flags by key (e.g., "pregnant", "lactating").',
                        "<strong>Modified: <code>approveFlagSuggestion()</code>:</strong> Now initializes pregnancy when approving detected pregnant flag. Ensures due date calculation happens automatically.",
                        "<strong>Modified: <code>onDayChange()</code>:</strong> Added <code>processFlagChains()</code> call ensuring chains processed daily. Children ages updated daily via this system.",
                        "<strong>Created: <code>giveBirth()</code>:</strong> Handles complete birth event - creates child, removes pregnant flag, adds lactating + postpartum flags, shows notification, saves game.",
                        "<strong>Created: <code>createChild()</code>:</strong> Generates complete child object with genetics, traits, name, photo. Handles genetic inheritance logic from both parents. Name pool expanded to 70 boy names + 70 girl names.",
                        "<strong>Created: <code>getEmployeeChildren()</code>:</strong> Helper function to retrieve all children for specific employee. Used by children tab rendering.",
                        "<strong>Created: <code>initializePregnancy()</code>:</strong> Calculates due date based on settings, stores conception date, sets metadata, shows notification.",
                        "<strong>Created: <code>renderChildren()</code>:</strong> New tab renderer for children display in unified profile. Shows all children with full details, genetics, traits.",
                    ],
                },
                {
                    category: "🎨 UI/UX Improvements",
                    items: [
                        '<strong>Added Tab:</strong> "👶 Children" tab added to tab list in <code>openUnifiedProfile()</code> between Relationship and Appearance tabs.',
                        '<strong>Tab Routing:</strong> Added <code>case "children": return renderChildren();</code> to <code>renderContent()</code> switch statement.',
                        '<strong>Notification Enhancement:</strong> Birth events trigger 10-second success notification: "🎉 [Name] gave birth to a daughter/son named [ChildName]!"',
                        "<strong>Visual Hierarchy:</strong> Children cards use dark blue backgrounds (var(--l-line)) with nested darker sections (var(--l-panel-2)) for genetics/traits. Gold accents for names.",
                        "<strong>Color Coding:</strong> Father names colored based on type - gold (var(--l-gold)) for player, character colors for NPCs, gray (var(--l-ink-dim-2)) for unknown.",
                    ],
                },
                {
                    category: "📝 NEW: 26+ Additional Flag Patterns (KINKS & DYNAMICS)",
                    items: [
                        '<strong>Relationships (5):</strong> engaged (💎 - detects proposals/engagement), ownership_dynamic (🔒 - "own me", "i\'m yours", possession), 24_7_dynamic (🔄 - lifestyle D/s relationship), plus existing married/in_relationship patterns.',
                        "<strong>Personality Types (6):</strong> bimbo (💋 - ditzy, hyperfeminine persona with valley girl speech), switch (🔄 - can be dom or sub), bratty (😏 - playfully disobedient, seeks reactions), masochist (⛓️ - enjoys pain), sadist (😈 - enjoys causing pain), service_submissive (🛎️ - fulfillment through service).",
                        '<strong>Extreme Conditions (1):</strong> mind_broken (😵 - "fucked stupid", mental rewiring from excessive pleasure. AI speaks in simpler/fragmented sentences, struggles with complex thoughts, drools, stutters, hyper-focused on pleasure/obedience. Permanent personality alteration).',
                        "<strong>Specific Kinks (8):</strong> cumslut (💦), anal_only (🍑), degradation_kink (🔻 - enjoys verbal humiliation), praise_kink (⭐ - needs validation), daddy_kink (👨), mommy_kink (👩), pet_play (🐾 - puppy/kitten dynamics), rope_bunny (🪢 - bondage enthusiast).",
                        "<strong>Acts & Preferences (5):</strong> creampie_lover (💦 - internal completion preference), oral_fixation (👄 - loves giving oral), cock_worship (🙏 - reverence/obsession), lactation_kink (🍼), impregnation_fetish (🤰 - aroused by pregnancy concept).",
                        "<strong>Dynamics (2):</strong> voyeur (👀 - enjoys watching others), cucking (🔺 - cuckold/hotwife dynamics).",
                        "<strong>Plus Existing:</strong> size_queen (📏), exhibitionist (🎭), collared (🔗), chastity (🔐), and all original 9 patterns.",
                        '<strong>Detection Features:</strong> Natural language keywords ("i\'m mind broken", "you broke me", "fucked stupid", "can\'t think"), context validation, low thresholds (1-2 occurrences for explicit statements), comprehensive AI guidance for each including speech pattern changes.',
                    ],
                },
                {
                    category: "🔄 Save Compatibility",
                    items: [
                        "<strong>Backward Compatible:</strong> All new fields initialize gracefully if missing. Existing saves work without modification.",
                        "<strong>Auto-Migration:</strong> If <code>children</code> or <code>flagChains</code> missing from loaded save, they auto-initialize as empty arrays/objects.",
                        "<strong>No Breaking Changes:</strong> Existing flag system fully preserved. New features additive only.",
                        "<strong>Future-Proof:</strong> System designed for expansion - can add new chain types, child features, genetic traits without breaking saves.",
                    ],
                },
            ],
        },
        {
            version: "2510311040",
            date: "October 31, 2025",
            title: "🔧 FLAG SYSTEM AUDIT & CONSISTENCY FIX",
            changes: [
                {
                    category: "🔍 Comprehensive Flag System Audit Results",
                    items: [
                        "<strong>AUDIT SCOPE:</strong> Manual verification of EVERY SINGLE detection pattern (45 total) against premade quickFlags (20 → 38 flags). Checked for: key mismatches, missing premade flags, redundancy, and flag chain involvement.",
                        "<strong>FINDINGS:</strong> Discovered 18 detection patterns without premade flags (broken UI functionality), 2 critical key mismatches (detection patterns suggesting wrong keys), and 5 intentionally manual-only flags confirmed.",
                        "<strong>METHODOLOGY:</strong> PowerShell Select-String to extract all pattern names with line numbers, systematic comparison against quickFlags array, line-by-line verification of key matching.",
                    ],
                },
                {
                    category: "✅ Key Mismatch Fixes (CRITICAL)",
                    items: [
                        '<strong>FIXED: no_clothes Detection Mismatch:</strong> Detection pattern was suggesting key "no_clothes_at_work" but premade flag used "no_clothes". Updated detection pattern to match premade: key changed to "no_clothes", emoji changed from 👙 to 👗, category changed from "appearance" to "agreement", priority changed from "high" to "medium". System now properly recognizes the flag.',
                        '<strong>FIXED: dominant Detection Mismatch:</strong> Detection pattern was suggesting key "player_dominant" but premade flag used "dominant_player". Updated detection pattern to match premade: key changed to "dominant_player", emoji changed from 👑 to 🎭, category changed from "relationship" to "personality", priority changed from "high" to "medium". Resolves flag suggestion failures.',
                    ],
                },
                {
                    category: "➕ Added 18 Missing Premade Flags",
                    items: [
                        "<strong>RELATIONSHIP FLAGS (4):</strong> in_relationship (💑 - dating player), engaged_to_player (💎 - engaged to player), ownership_dynamic (🔒 - belongs to player), 24_7_dynamic (🔄 - 24/7 D/s lifestyle).",
                        "<strong>APPEARANCE FLAG (1):</strong> permanently_nude (👙 - always 100% nude at work, new normal dress code).",
                        "<strong>KINK/PREFERENCE FLAGS (13):</strong> cumslut (💦), anal_only (🍑), degradation_kink (🔻), praise_kink (⭐), creampie_lover (💦), oral_fixation (👄), lactation_kink (🍼), impregnation_fetish (🤰), cock_worship (🙏), daddy_kink (👨), mommy_kink (👩), voyeur (👀), cucking (🔺).",
                        "<strong>PERSONALITY FLAGS (4):</strong> bimbo (💋 - ditzy hyperfeminine), sadist (😈), switch (🔄 - dom/sub versatile), bratty (😏).",
                        "<strong>DYNAMICS FLAGS (3):</strong> pet_play (🐾), service_submissive (🛎️ - fulfillment through service), rope_bunny (🪢 - bondage enthusiast).",
                        "<strong>SPECIALIZED FLAGS (2):</strong> masochist (⛓️ - enjoys pain), size_queen (📏).",
                        "<strong>IMPACT:</strong> Increased quickFlags array from 20 to 38 premade flags. All detection patterns now have corresponding manual-addition flags. UI functionality restored for all auto-detected flags.",
                    ],
                },
                {
                    category: "🎯 Added Detection Patterns for Manual-Only Flags",
                    items: [
                        '<strong>NEW: permanently_cumming Detection:</strong> Detects "always cumming", "never stop cumming", "constant orgasm", "perpetual orgasm" with 3 occurrence threshold. Extremely rare condition requiring strong evidence. Category: condition, Priority: critical.',
                        '<strong>NEW: recorded Detection (enjoys_being_recorded):</strong> Detects "record me", "film me", "camera", "video", "take pictures", "on camera" with 2 occurrence threshold. Category: preference, Priority: low.',
                        '<strong>NEW: public_use_interest Detection:</strong> Detects "share me", "let others", "everyone can", "anyone who wants", "public use", "pass me around" with 2 occurrence threshold. Category: agreement, Priority: high.',
                        '<strong>NEW: corruption_progression Detection (corruption_level_high):</strong> Detects "changed me", "corrupted me", "not the same", "different person", "what have you done to me", "never thought i\'d" with 3 occurrence threshold. Requires strong contextual evidence. Category: state, Priority: medium.',
                        "<strong>KEPT MANUAL ONLY: hypnotized:</strong> Requires specific trigger implementation, kept as manual-only flag (no auto-detection added).",
                        "<strong>TOTAL DETECTION PATTERNS:</strong> Increased from 41 to 45 patterns with improved coverage of extreme/niche content.",
                    ],
                },
                {
                    category: "📊 System Consistency Metrics",
                    items: [
                        "<strong>BEFORE AUDIT:</strong> 41 detection patterns, 20 premade flags, 2 key mismatches, 18 missing premades = 44% flag coverage, broken UI for 44% of detections.",
                        "<strong>AFTER FIXES:</strong> 45 detection patterns, 47 premade flags, 0 key mismatches, 0 missing premades = 100% flag coverage, fully functional UI.",
                        "<strong>DETECTION → PREMADE RATIO:</strong> 45 patterns : 47 flags. The 2 extra flags are chain-only (lactating, postpartum) - auto-added by pregnancy flag chain system, never detected directly. 13 detection patterns use different internal names than their suggested flag keys (e.g., pregnant_conversation → pregnant, always_nude → permanently_nude, engaged → engaged_to_player, breeding → breeding_kink, pet → pet_play, ownership → ownership_dynamic, service_sub → service_submissive, 24_7 → 24_7_dynamic, recorded → enjoys_being_recorded, public_use_interest → public_use, corruption_progression → corruption_level_high).",
                        "<strong>CHAIN-ONLY FLAGS (2):</strong> lactating and postpartum flags are NEVER detected - they are exclusively added automatically by the pregnancy flag chain system after birth events.",
                        "<strong>MANUAL-ONLY FLAGS (1):</strong> hypnotized - requires custom trigger implementation, no auto-detection.",
                        "<strong>SYSTEM INTEGRITY:</strong> All detection pattern suggestedFlag.key values now EXACTLY match their corresponding premade flag keys. Zero broken references. 100% functional detection-to-UI pipeline.",
                    ],
                },
                {
                    category: "🔄 Technical Implementation",
                    items: [
                        "<strong>Modified: FLAG_DETECTION_PATTERNS (lines 6718-7380):</strong> Fixed 2 key mismatches, added 4 new detection patterns, updated emoji/category/priority to match premades.",
                        "<strong>Modified: quickFlags Array (lines 7887-7950):</strong> Added 18 new premade flag templates with exact keys matching detection patterns. Total: 47 premade flags (45 detection-suggested + 2 chain-only).",
                        "<strong>Validated: Key Consistency:</strong> All suggestedFlag.key values in detection patterns verified against premade flag key values. 100% match rate achieved.",
                        "<strong>Enhanced: AI Guidance:</strong> Updated mind_broken aiGuidance to include cognitive impairment details (fragmented speech, drooling, stuttering, inability to form complex thoughts).",
                        "<strong>Categories Distribution:</strong> relationship (7), preference (15), personality (9), condition (7 including lactating/postpartum), agreement (4), state (1), appearance (1) = 47 total flags across 7 categories.",
                    ],
                },
            ],
        },
        {
            version: "2510310930",
            date: "October 31, 2025",
            title: "🐛 Community Bug Fixes - Discord Feedback Implementation",
            changes: [
                {
                    category: "🎁 Gift System Fixes",
                    items: [
                        '<strong>FIXED: Gift Genie Adult Content Sanitization:</strong> Gift Genie was returning overly sanitized descriptions for adult items (e.g., "vibrator" → "personal massager", "bondage rope" → "decorative rope"). Enhanced AI prompt with explicit adult content policy, examples of acceptable adult items, and "DO NOT sanitize" instructions. Now generates appropriately explicit gift descriptions for adult game context.',
                        "<strong>FIXED: Entire Gift Stack Removed Bug:</strong> When giving one gift from inventory, entire stack (e.g., 5 gifts) was being removed instead of just one. Changed from <code>splice(giftIndex, 1)</code> to proper quantity decrement logic - checks quantity, decrements by 1, only removes item if quantity ≤ 0.",
                        '<strong>FIXED: False Duplicate Gift Warnings:</strong> NPCs were claiming gifts were duplicates despite never receiving them before ("AGAIN? You know how much I loved the first set..." when this was the first gift). Improved duplicate detection with case-insensitive exact matching and added explicit AI flags: "⚠️ DUPLICATE ALERT" vs "✓ This is a NEW gift" to prevent AI confusion.',
                        '<strong>FIXED: Gifts Not Showing in NPC Bio:</strong> Gifts received by NPCs were not displaying in their Possessions tab at all. Added comprehensive "All Gifts Received" section showing chronological list with gift name, category badge, value, and date. Now displays full gift history with proper formatting.',
                    ],
                },
                {
                    category: "👤 Profile Editing Enhancements",
                    items: [
                        "<strong>NEW: Age Editing:</strong> Added editable age field (18+) in Basic Info section of NPC profiles. Age is now visible and changeable in edit mode with minimum age validation (18-99 range). Includes numeric input with increment/decrement on change.",
                        "<strong>NEW: Gender Editing:</strong> Added editable gender field in Basic Info section. Players can now modify NPC gender with text input supporting all gender options (Female, Male, Non-binary, Trans Woman, Trans Man, etc.).",
                        '<strong>NEW: Intimacy Level Editing:</strong> Added intimacy level display and editing in Relationship Statistics section. Shows as percentage bar (0-100%) with description "Combined measure of emotional and physical closeness". Fully editable in edit mode with +/− buttons and direct numeric input. Stored in <code>employee.memory.intimacyLevel</code>.',
                    ],
                },
                {
                    category: "🔧 Critical Technical Fixes",
                    items: [
                        "<strong>FIXED: Social Feed Comment Promise Rejection:</strong> Fixed \"Cannot read property 'push' of undefined\" error in <code>trackPlayerMention()</code> function causing promise rejections when commenting on posts. Added defensive array/object validation ensuring <code>mentionHistory</code> and <code>mentionCounts</code> exist and are correct types before operations.",
                        "<strong>FIXED: Social Feed Images Not Displaying:</strong> Images in social feed posts were not showing or failing to load silently. Added error handling with fallback placeholder (<code>onerror</code> handler), opacity fade-in transition on successful load, and prevents broken image icons. Images now display with proper loading states.",
                        "<strong>FIXED: Corporate Pyramid Error After Prestige:</strong> Opening Corporate Pyramid modal immediately after prestiging caused crashes due to uninitialized data structures. Added defensive initialization checks for <code>employees</code> array, <code>corporateHierarchy</code> structure, and <code>hierarchyLevels</code> array with automatic creation of missing structures and default values.",
                    ],
                },
                {
                    category: "🎭 NPC AI Improvements",
                    items: [
                        '<strong>FIXED: Male Character Pronouns Wrong:</strong> Male and trans man characters were consistently referred to with "she/her" pronouns by AI despite being defined as male. Added CRITICAL IDENTITY pronoun guidance system with explicit instructions for each gender: Male/Trans Man get "⚠️ You are a MAN. Use he/him/his. Do NOT use she/her under any circumstances", Trans Woman get "You are a TRANS WOMAN. Use she/her/hers", Female/Futanari get "You are a WOMAN. Use she/her/hers". Pronoun guidance injected directly into character context to prevent AI misgendering.',
                        '<strong>FIXED: Player Info Being Ignored:</strong> Enhanced <code>getPlayerDescription()</code> function with explicit name enforcement: "⚠️ THE PLAYER is named [FullName]. Do NOT call them by any other name." Added "do not invent names" instructions to prevent AI from making up player nicknames like "Phil" or "Mr. Roberts".',
                        "<strong>FIXED: Training Workshop Notification Spam:</strong> Training workshops were causing notification/UI flicker due to <code>saveGame()</code> being called during batch employee updates, combined with 5-second autosave interval. Changed to <code>saveGame(false)</code> to suppress manual save notifications during bulk operations. Batched all employee updates before single save call.",
                    ],
                },
                {
                    category: "🏢 Game Systems Fixes",
                    items: [
                        '<strong>FIXED: Flags System Syntax Error in Opera GX:</strong> <code>showAllFlags()</code> function was not accessible from inline onclick handlers causing "showAllFlags is not defined" error in Opera GX browser. Exposed <code>window.showAllFlags</code> and <code>window.removeFlagAndRefresh</code> globally for cross-browser compatibility.',
                    ],
                },
                {
                    category: "⚙️ Technical Implementation Details",
                    items: [
                        "<strong>Gift System:</strong> Enhanced <code>generateCustomGift()</code> AI prompt with explicit adult content policy examples. Fixed <code>sendGiftBtn</code> handler to decrement quantity properly. Improved <code>giveGiftToEmployee()</code> with case-insensitive duplicate detection. Enhanced <code>generateGiftReaction()</code> with explicit NEW vs DUPLICATE flags. Added gift display in <code>renderPossessions()</code>.",
                        "<strong>Profile Editing:</strong> Modified Basic Info section HTML to include gender and age input fields in edit mode. Added intimacy level widget to Relationship Statistics with +/− controls updating <code>window.profileEditState.editedData.memory.intimacyLevel</code>.",
                        "<strong>Pronoun System:</strong> Created <code>pronounGuidance</code> variable based on employee gender, injected into <code>contextFacts</code> array in <code>buildChatPrompt()</code> function. Explicit masculine/feminine language enforcement for all genders.",
                        "<strong>Social Feed:</strong> Added <code>onerror</code> and <code>onload</code> handlers to post image tags. Enhanced <code>trackPlayerMention()</code> with Array.isArray checks and typeof validation. Added defensive checks to <code>openCorporatePyramidModal()</code> with structure initialization.",
                        "<strong>Save Migration:</strong> All fixes include backward compatibility with existing saves. Missing properties auto-initialize with sensible defaults. No breaking changes to save format.",
                    ],
                },
                {
                    category: "🙏 Community Feedback",
                    items: [
                        "All fixes based on Discord & Perchance community feedback and bug reports",
                        "Prioritized most impactful issues affecting gameplay experience",
                        "Enhanced systems based on player expectations and use cases",
                        "Improved error messages and user feedback throughout",
                        "Added more granular control over NPC customization",
                        "Focus on polish and stability for core game systems",
                    ],
                },
            ],
        },
        {
            version: "2510240835",
            date: "October 24, 2025",
            title: "🔧 Critical Bug Fixes: Scene Visualization & Social Posts",
            changes: [
                {
                    category: "🎬 Scene Visualization - CRITICAL FIXES",
                    items: [
                        "<strong>FIXED: Random Unrelated Images Bug:</strong> Scene visualization was generating completely random images (mountain streams instead of erotica, lizards instead of characters, etc.) due to Perchance returning String objects instead of primitive strings.",
                        "<strong>String Object Extraction:</strong> Created <code>extractText()</code> helper function to properly convert Perchance's String objects to usable text. Prevents prompt from being treated as character array (0, 1, 2, ...) instead of actual string.",
                        "<strong>Markdown Pollution Fix:</strong> AI was adding <code>**Image Prompt:**</code>, <code>**Visual Details:**</code>, bullet points, and <code>*(Word count: X)*</code> to prompts - confusing image generator. Now strips all markdown formatting.",
                        "<strong>Enhanced Prompts:</strong> Increased max_tokens from 100→200, added detailed instructions for exact current activity, poses, expressions, location details, mood/atmosphere, and clothing/props.",
                        "<strong>Better Context:</strong> Now extracts last 3 player and NPC messages for deeper understanding of scene. Temperature increased from 0.7→0.8 for more creative but focused output.",
                        '<strong>Stop Sequences:</strong> Added stops for "Visual Details:", "**Visual", "Word count:" to prevent AI from continuing into metadata.',
                        "<strong>XML Tag Removal:</strong> Strips <code>&lt;image prompt&gt;</code> tags that AI sometimes adds.",
                    ],
                },
                {
                    category: "✏️ Custom Image Prompts",
                    items: [
                        '<strong>Custom Prompt Option:</strong> Added "Custom Prompt" to image style dropdown per user request.',
                        '<strong>Personal Style Directives:</strong> Users can now write their own custom style instructions (e.g., "watercolor painting, soft colors, dreamy atmosphere") instead of being limited to presets.',
                        "<strong>Expandable Textarea:</strong> UI shows/hides custom prompt field based on selection. Includes helpful placeholder text.",
                        "<strong>Persistent Storage:</strong> Custom prompts save to gameState and persist across sessions.",
                        '<strong>Fallback Handling:</strong> If custom prompt is empty, falls back to "high quality, detailed".',
                    ],
                },
                {
                    category: "📱 Social Post Quality Improvements",
                    items: [
                        '<strong>FIXED: Short Generic Posts:</strong> AI was spamming feed with one-word posts like "Self-care morning", "Made it to work", "Vibing". Increased max_tokens from 60→80 and added quality validation.',
                        '<strong>FIXED: "Caught in Mid-" Repetition:</strong> AI was obsessed with phrases like "caught in mid-laugh", "caught in mid-sip", "caught in mid-bite". Added regex filters to <code>cleanWithLearning()</code> to remove all "mid-action" patterns.',
                        "<strong>Post Quality Validation:</strong> Now rejects posts with <3 words, emoji-only posts, and generic phrases before they hit the feed.",
                        "<strong>Enhanced Fallback Templates:</strong> Expanded from 3 options per type to 7-10 varied options. Added personality-based variations (flirty emojis, professional hashtags).",
                        '<strong>Better AI Instructions:</strong> Explicit rules: "NOT single-word posts", "Avoid one-word or extremely short posts", "NEVER use caught in mid-[action] phrases", "Add personality and context".',
                        "<strong>Expanded Post Types:</strong> Added fallbacks for: fitness, hobby, entertainment, mood, question, achievement, throwback, pet, fashion, complaint, inspiration, weather, random, gossip.",
                    ],
                },
                {
                    category: "🕐 PostId Timestamp Validation",
                    items: [
                        "<strong>FIXED: Invalid PostIds Bug:</strong> Fallback system was generating posts with invalid postIds lacking timestamps, causing posts to get stuck at top of feed and become undeletable.",
                        "<strong>Robust Timestamp Generation:</strong> Added validation in <code>createPost()</code> with multiple fallbacks: 1) Date.now(), 2) gameState.time.currentTime, 3) new Date().getTime(), 4) Epoch timestamp.",
                        "<strong>Error Logging:</strong> Console warnings if timestamp is NaN or invalid.",
                        "<strong>Guaranteed Valid IDs:</strong> Ensures all posts have format <code>post_{counter}_{timestamp}</code> with valid timestamp for proper sorting and deletion.",
                    ],
                },
                {
                    category: "🛠️ Technical Implementation",
                    items: [
                        "<strong>New Helper Function:</strong> <code>extractText(response)</code> - Universal text extraction from generateText responses. Handles String objects, response objects with .text/.generatedText properties, and primitive strings.",
                        "<strong>Applied Everywhere:</strong> Scene visualization, social post generation, and image style application now use extractText() for consistent handling.",
                        "<strong>Markdown Stripping:</strong> Comprehensive regex patterns remove: bold headers, bullet points, labels, word counts, and formatting artifacts.",
                        '<strong>AI Prompt Improvements:</strong> Added explicit instructions: "Write ONLY the description itself. NO markdown formatting, NO bold headers, NO labels."',
                        "<strong>Debug Logging:</strong> Enhanced console logs show prompt length, style application, and final prompt endings for troubleshooting.",
                    ],
                },
                {
                    category: "📊 Expected Improvements",
                    items: [
                        "Scene visualizations accurately reflect conversation context instead of random images",
                        "Users can define custom art styles with personal preferences",
                        "Social posts are more substantive and varied (3+ words minimum)",
                        'No more "caught in mid-X" repetitive AI phrases',
                        "All posts have valid IDs with timestamps for proper sorting/deletion",
                        "Overall better AI content quality across all generation points",
                    ],
                },
            ],
        },
        {
            version: "2010232145",
            date: "October 23, 2025",
            title: "🎨 Global Image Style System & Prestige Bug Fixes",
            changes: [
                {
                    category: "✨ New Features",
                    items: [
                        "<strong>Global Image Style Setting:</strong> Choose a consistent art style for ALL image generation (profiles, chats, social posts, scenes)",
                        "<strong>6 Style Options:</strong> Photorealistic, Anime/Manga, Artistic/Painterly, Cartoon/Comic, Cinematic, Professional Studio",
                        "<strong>Automatic Style Application:</strong> Selected style is applied to all 14+ image generation points automatically",
                        "<strong>Style Persistence:</strong> Image style preference saves across sessions",
                        "<strong>Smart Style Directives:</strong> Each style includes comprehensive prompt modifiers for consistent results",
                    ],
                },
                {
                    category: "🐛 Critical Bug Fixes",
                    items: [
                        "<strong>Fixed Prestige Unlock Cost Bug:</strong> Product unlock costs were locked to pre-prestige values (e.g., garage products requiring billions after prestige). Now properly resets to base values.",
                        "<strong>Base Unlock Cost System:</strong> Added comprehensive lookup table with default costs for all 40+ products",
                        "<strong>Prestige Reset Logic:</strong> Product unlock costs now correctly reset to original values regardless of dynamic changes",
                    ],
                },
                {
                    category: "🎨 Image Generation Improvements",
                    items: [
                        "Updated 14+ image generation locations to use consistent styling",
                        "Employee profile pictures (onboarding)",
                        "Chat image requests (player to NPC)",
                        "Chat image requests (NPC to player)",
                        "Image regeneration in chats",
                        "Visualize current scene",
                        "Social feed posts with images",
                        "Social feed custom player posts",
                        "Boss fight character images",
                        "Gift preview images",
                        "First post selfies (new hires)",
                        "All images now respect global style setting",
                    ],
                },
                {
                    category: "⚙️ Technical Implementation",
                    items: [
                        "Added <code>applyImageStyle()</code> helper function for consistent style application",
                        "Style directives automatically append to all image prompts",
                        "Duplicate detection prevents style tags from being added multiple times",
                        "Debug logging shows style application for troubleshooting",
                        "Settings UI integration with real-time style switching",
                        "Base unlock costs for garage, home_office, office_suite, factory, and corporate_tower products",
                    ],
                },
                {
                    category: "💾 Prestige System Improvements",
                    items: [
                        "<strong>Complete Cost Reset:</strong> All product unlock costs reset to base defaults",
                        "Prevents progression blocks after prestige",
                        "Maintains game balance across prestige cycles",
                        "Preserves intended early-game flow after reset",
                        "Fixed unlock costs for 8 garage products, 10 home office products, 10 office suite products, 10 factory products, 10 corporate tower products",
                    ],
                },
            ],
        },
        {
            version: "2510221000",
            date: "October 22, 2025",
            title: "🚀 Nuclear Context Intelligence + Anti-Repetition System",
            changes: [
                {
                    category: "🧠 Revolutionary AI Context Selection",
                    items: [
                        '<strong>Nuclear Context Intelligence System:</strong> Completely rewrote how AI selects context for NPC conversations. Instead of "context dumping" (sending ALL employee data in every prompt), now intelligently selects 5-15 most relevant pieces using multi-dimensional scoring.',
                        "<strong>Multi-Dimensional Scoring:</strong> Each context piece scored on 5 dimensions: Base Priority (inherent importance), Semantic Relevance (matches conversation topic), Temporal Relevance (time-sensitive data gets freshness bonus), Novelty (anti-repetition penalty), Coherence (works well with other selected pieces).",
                        "<strong>Adaptive Selection Algorithm:</strong> Greedily selects best-scoring context with category balancing (prevents all personality, no current state). Respects token budgets: 400 tokens for casual chat, 300 for social posts, 250 for comments.",
                        "<strong>Usage Tracking:</strong> System tracks which context pieces are used in each interaction. Pieces used recently get heavy novelty penalties (70% reduction) to prevent repetition. Pieces used in last hour completely excluded.",
                        "<strong>Context Categories:</strong> 9 categories with different priorities: core_identity (always included), personality (high), current_state (high, time-sensitive), relationships (low), skills (work-context), stats (medium), flags (variable), personal_life (low), appearance (very low).",
                    ],
                },
                {
                    category: "🎯 Anti-Repetition Enforcement",
                    items: [
                        '<strong>FIXED: Physical Appearance Obsession:</strong> NPCs were constantly describing "bright blue eyes", "chestnut waves", and "barefoot" in EVERY response. Drastically reduced appearance priority (0.2→0.05, 0.1→0.02), added avoidRepetition flags, and explicit AI instruction to STOP obsessing over looks.',
                        "<strong>FIXED: Coworker Name-Dropping Plague:</strong> NPCs mentioned coworkers in EVERY SINGLE MESSAGE, even during intimate moments (\"Judith's budget reports wouldn't know what to make of this\"). Reduced relationship priority by 75-85%, removed automatic office dynamics/social context injection.",
                        '<strong>FIXED: Betting Obsession:</strong> NPCs constantly saying "[Coworker] bet me $20 that..." as excuse to mention people. Added explicit ban on using bets/wagers as crutch to name-drop coworkers.',
                        "<strong>Explicit AI Instructions:</strong> Added critical directives telling AI to: NOT constantly describe appearance (only when it changes or asked), NOT randomly bring up coworkers (only when player asks or directly relevant), NOT use betting patterns to shoehorn names, NEVER mention coworkers during intimate moments.",
                        "<strong>Context Selectivity:</strong> Removed automatic inclusion of office dynamics, recent social posts, and gossip. These now only appear when semantically relevant or player asks about them.",
                    ],
                },
                {
                    category: "🏢 Corporate Hierarchy Overhaul",
                    items: [
                        "<strong>FIXED: Hierarchy Levels Completely Redesigned:</strong> Levels now correctly match the corporate structure: Level 1 = Staff (product workers), Level 2 = Local Manager, Level 3 = Regional Manager, Level 4 = Branch Manager, Level 5 = CFO/COO, Level 6 = Senior Executive, Level 7 = CEO.",
                        '<strong>Proper Level Progression:</strong> New employees start at Level 1 (Staff) - the bottom tier managing products. Removed confusing "Entry Level" terminology. Everyone starts as Staff and can work their way up.',
                        "<strong>Corporate Pyramid Population:</strong> Migration system now syncs employees to corporate pyramid positions after auto-assignment. Your staff will properly appear in the Corporate Ladder screen at Level 1 positions.",
                        "<strong>Updated Promotion Requirements:</strong> Adjusted requirements to match new hierarchy: Staff→Local Manager (60% prod, Lv1 mgmt), Local→Regional (70%, Lv2), Regional→Branch (75%, Lv4), Branch→CFO/COO (80%, Lv6), CFO/COO→Senior Exec (85%, Lv8), Senior Exec→CEO (90%, Lv10).",
                        "<strong>Position Icons & Colors:</strong> Each level has appropriate icon and color: 👔 Staff (green), 👨‍💼 Local Manager (blue), 🎯 Regional Manager (gold), 📊 Branch Manager (pink), 💼 CFO/COO (purple), ⭐ Senior Executive (deep purple), 👑 CEO (red).",
                    ],
                },
                {
                    category: "🔧 Staff Position Management & Save Migration",
                    items: [
                        '<strong>SMART Auto-Assignment from Old Saves:</strong> Migration system intelligently extracts product assignments from old "Manager – [Product Name]" position fields, auto-assigns employees to correct products, syncs them to corporate pyramid, then cleans up outdated display fields.',
                        '<strong>FIXED: Promotion Vacancy Bug:</strong> When promoting employee from Staff position to higher role, the old product position is now properly vacated and automation disabled. Shows warning notification: "⚠️ [Position] is now vacant! Hire new staff to restore automation."',
                        '<strong>FIXED: "Managed by Unknown" Bug:</strong> Old saves had products with invalid manager references. Migration system now detects and clears broken assignments, showing helpful message: "⚠️ Staff assignment lost - click Hire Staff to reassign"',
                        '<strong>Cleaner People Tab Cards:</strong> Removed redundant "Manager – [Product] • [Product]" line from employee cards. The Corporate Hierarchy section already shows their level and role clearly.',
                        '<strong>Position Title Clarity:</strong> Business tab now shows which employee staffs each product: "✓ Staffed by [Name] (Lv.X)" or "⚠️ No staff assigned - automation disabled" when vacant.',
                        '<strong>Better Terminology:</strong> Changed "Hire Employee" → "Hire Staff", "Upgrade Manager" → "Upgrade Position", "Managed by" → "Staffed by" to clarify you\'re improving the position (equipment/processes) not the person.',
                        '<strong>Upgrade Notifications:</strong> Position upgrade messages now say "[Product] position upgraded to Lv.X - Better equipment & efficiency!" making it clear what\'s improving.',
                        "<strong>Save Migration:</strong> Loading old saves automatically validates all product-employee assignments and fixes any orphaned manager references from fired/promoted employees.",
                        '<strong>Secretary Title Fix:</strong> Executive Secretary position (level 6.5) now correctly sets employee title to "Executive Secretary" instead of incorrectly showing "Regional Director" (level 6).',
                    ],
                },
                {
                    category: "📊 Debug & Analytics Tools",
                    items: [
                        "<strong>debugContextSelection():</strong> Console function to see exactly what context is selected for any interaction. Shows scores, breakdown by dimension, and formatted output.",
                        "<strong>showContextAnalytics():</strong> View comprehensive analytics on context usage for any employee - most/least used pieces, category distribution, average pieces per interaction, recent history.",
                        "<strong>Token Budget System:</strong> Different interaction types have appropriate budgets to prevent bloat while maintaining quality context.",
                    ],
                },
            ],
        },
        {
            version: "2510220820",
            date: "October 22, 2025",
            title: "⬆️ Promotion UX Overhaul + Bug Fixes",
            changes: [
                {
                    category: "✨ Improved Promotion System",
                    items: [
                        '<strong>Promote Button in Employee Profiles:</strong> New "⬆️ Promote" button appears in employee profile modals. Shows as green/active when employee is eligible for promotion, grayed out with "🔒 Not Eligible" when not eligible.',
                        '<strong>Seamless Promotion Flow:</strong> Click "Promote" button → profile closes → Corporate Pyramid opens with eligible positions highlighted in gold. Much more intuitive than drag-and-drop.',
                        "<strong>Visual Confirmation Modal:</strong> Beautiful side-by-side comparison showing old position → new position with animated arrow. Displays employee photo, position cards with level/title, cost breakdown, and your remaining cash after promotion.",
                        "<strong>Smart Eligibility Detection:</strong> System automatically checks all higher-level positions and secretary role to determine if employee has promotion opportunities.",
                        "<strong>Mobile-Friendly:</strong> Click-based system works perfectly on mobile devices, replacing janky drag-and-drop.",
                        "<strong>Current Position Display:</strong> Employee profiles now show current position title and level badge next to the Promote button.",
                    ],
                },
                {
                    category: "🏢 Secretary Position Addition",
                    items: [
                        "<strong>Executive Secretary Role:</strong> New special position that reports directly to the CEO with no subordinates. Perfect for early-game hiring.",
                        "<strong>Visual Placement:</strong> Appears next to the CEO in the Corporate Pyramid (slightly smaller for visual hierarchy) with unique purple/magenta color scheme and 📋 icon.",
                        "<strong>Easy Access:</strong> Can be filled by Level 1-3 employees. Low cost ($1,000) encourages early hiring.",
                        "<strong>Auto-Migration:</strong> Automatically added to existing saves without requiring new game.",
                        "<strong>Fully Integrated:</strong> Works with all position management functions including assignment, removal, and promotion flow.",
                    ],
                },
                {
                    category: "🐛 Bug Fixes",
                    items: [
                        "<strong>Fixed createSocialPost Error:</strong> Function was being called but never defined, causing ReferenceError in generateMorningPost, generateEveningPost, and createActivityPost. Now properly creates and adds posts to social feed.",
                        "<strong>Fixed Mention Suggestions Crash:</strong> TypeError when accessing employee IDs in getMentionSuggestions. Added comprehensive null checks and validation for employee objects, IDs, and mention statistics.",
                        "<strong>Fixed Scarf Obsession:</strong> Removed accessories (including scarves) from the fullDescription string sent to AI. Employees were constantly mentioning scarves because it was in their character description for every AI interaction. Accessories still stored in data but no longer pollute conversations.",
                    ],
                },
                {
                    category: "🎨 UI Improvements",
                    items: [
                        "<strong>Discord Icon:</strong> Re-added Discord server link icon to top bar (left of settings gear). Opens in new tab with proper SVG icon in Discord brand color.",
                        "<strong>Promotion Confirmation Animations:</strong> Smooth fade-in, slide-up, and pulsing arrow effects in confirmation modal. Green glow on affordable promotions, disabled state for insufficient funds.",
                        "<strong>Better Error Messages:</strong> More descriptive error messages for position assignment failures with specific reasons.",
                    ],
                },
            ],
        },
        {
            version: "2510211800",
            date: "October 21, 2025",
            title: "🏢 Corporate Ladder System + NPC Lifelike Systems",
            changes: [
                {
                    category: "🎯 Corporate Hierarchy & Pyramid Visualization",
                    items: [
                        "<strong>7-Level Organizational Chart:</strong> Complete restructure from product-based positions to true hierarchical reporting structure (Level 1 Staff → Level 7 CEO). Positions automatically created based on products/locations unlocked.",
                        "<strong>Interactive Pyramid Modal:</strong> Beautiful visual org chart showing your entire company structure at a glance. Click any position to view details, drag employees between positions, pan/zoom controls, mobile-friendly touch support.",
                        "<strong>Auto-Assignment:</strong> Newly hired employees automatically assigned to Level 1 Staff positions for their product, appearing immediately in the pyramid.",
                        "<strong>Dynamic Position Creation:</strong> Positions scale with your business - Level 1 (1 per product), Level 2 (2-3 per location), Level 3 (1 per location), Level 4 (manages 2-3 locations), Level 5 (CFO/COO), Level 6 (Senior Executive), Level 7 (CEO - You!).",
                        "<strong>Reporting Relationships:</strong> Each position tracks who reports to whom, subordinate counts, span of control. Validates chain of command when assigning employees.",
                        "<strong>Position Details Modal:</strong> Click any position to see employee info, skills, salary, reporting structure. Remove employees or view vacant positions.",
                        "<strong>Migration System:</strong> Seamlessly converts old product-based save data to new hierarchical structure automatically on load.",
                    ],
                },
                {
                    category: "📈 Promotion System Overhaul",
                    items: [
                        "<strong>Clear Requirements:</strong> Each level has specific productivity and management skill requirements (Level 2: 60% productivity → Level 7: 90% productivity + Level 8 management).",
                        '<strong>Visual Promotion Badges:</strong> Employees eligible for promotion display a pulsing golden "⬆️ READY" badge on their pyramid tile.',
                        "<strong>Eligibility Display:</strong> Click any employee in the pyramid to see detailed promotion requirements with current vs. needed values. Shows what they're missing in red, what they've achieved in green.",
                        "<strong>Three Status States:</strong> Ready (green banner), Not Ready (shows gaps), Max Level (gold crown).",
                        "<strong>Promotion Costs:</strong> Scaling costs from $500 (Level 1→2) to $500,000 (Level 6→7). Lateral moves get 50% discount.",
                        "<strong>Smart Assignment:</strong> System validates if employee meets level requirements and has necessary management skills before allowing position assignment.",
                    ],
                },
                {
                    category: "🎓 Employee Development Programs",
                    items: [
                        "<strong>Training Workshops:</strong> Company-wide training affecting all employees at once. Cost: $500 per employee. Benefits: +5-10 productivity, +20 management XP. No cooldown - run as often as budget allows.",
                        "<strong>Performance Reviews:</strong> Individual one-on-one reviews with tiered benefits. Cost: $200. Cooldown: 7 days per employee. Low performers get +15-20 productivity, average +10-15, high performers +5-10. Also boosts affection by +5.",
                        "<strong>Team Building Activities:</strong> Fun company events boosting both productivity and morale. Cost: $800 per employee. Cooldown: 14 days. Benefits: +3-7 productivity, +8 affection, +8 comfort, +30 social XP.",
                        "<strong>Review History Tracking:</strong> All performance reviews tracked in employee career data with before/after productivity values.",
                        "<strong>Development Programs UI:</strong> New section at top of People tab with three cards showing each program, costs, cooldowns, and benefits. One-click activation buttons.",
                    ],
                },
                {
                    category: "🏷️ Universal Flag System",
                    items: [
                        '<strong>Dynamic State Tracking:</strong> NPCs can now have unlimited custom "flags" that track ANY state, condition, or trait - physical conditions (pregnant, sick, tired), relationship agreements (free use, exclusive dating), personality traits (dominant, submissive, shy), life events (birthday soon, recent breakup), preferences & kinks (exhibitionist, breeding kink), and literally anything imaginable.',
                        "<strong>Two Flag Types:</strong> System flags (auto-created by game mechanics like pregnancy) and custom flags (player-created for any purpose).",
                        "<strong>Smart AI Integration:</strong> Flags automatically inject into AI conversation context, so NPCs naturally remember and reference their states. No more forgetting major developments!",
                        "<strong>Automatic Detection:</strong> Game watches conversations and suggests flags based on patterns (e.g., detecting free-use agreements, relationship changes). Zero extra AI calls - pure regex pattern matching.",
                        "<strong>Flag Management UI:</strong> Beautiful modal accessible from People tab and unified profiles. View all active flags with their priority, AI guidance text, and expiration dates. One-click add/remove.",
                        "<strong>Quick-Add Buttons:</strong> 9 pre-configured common flags (Pregnant, In Relationship, Free Use Agreement, Secret Affair, Breeding Kink, Submissive, Dominant, Exhibitionist, Polyamorous) with appropriate emoji, priority, and AI context.",
                        "<strong>Flag Display:</strong> Active flags show as colored badges on employee cards with emoji icons (🤰 Pregnant, 💋 Free Use, etc.).",
                        "<strong>Custom Flag Creation:</strong> Full custom flag form with name, emoji, description, priority (low/medium/high), AI guidance, optional expiration dates.",
                        "<strong>Priority System:</strong> High-priority flags appear first in AI context to ensure important traits/states are emphasized.",
                    ],
                },
                {
                    category: "🗂️ Unified NPC Profile System",
                    items: [
                        "<strong>10-Tab Interface:</strong> Comprehensive profile modal consolidating all NPC information: Overview (bio + quick stats), Stats (relationship meters), Skills (work skills with levels), Possessions (gifts received), Flags (state management), Schedule (work hours), Social (feed activity), Relationship (detailed dynamics), Appearance (physical traits), Gallery (images).",
                        "<strong>Overview Tab Redesign:</strong> Merged Bio and Overview into single tab with profile picture, basic info, quick stat previews, active flags display, and action buttons.",
                        "<strong>Stats Tab:</strong> Visual progress bars for all relationship stats (affection, trust, comfort, desire, productivity) with hover tooltips and exact values.",
                        "<strong>Skills Tab:</strong> Work skills displayed with level, XP progress bars, next level requirements. Shows technical, creative, social, management, and life skills (fitness, cooking) with emoji icons.",
                        "<strong>Flags Tab:</strong> Full flag management interface within profile - view all flags, add custom flags, quick-add common flags, remove flags. Real-time updates.",
                        "<strong>Possessions Tab:</strong> Gallery of all gifts given to NPC with images, names, dates, and categories. Shows appreciation and relationship building over time.",
                        "<strong>Schedule Tab:</strong> Work schedule, PTO balance, sick days, hours worked, late days tracking. Future: will show daily routine and current activity.",
                        "<strong>Live Edit Mode:</strong> Toggle edit mode to modify NPC data directly in profile. Unsaved changes highlighted. Save/cancel with confirmation.",
                        "<strong>Clickable Everywhere:</strong> Access unified profiles by clicking NPC names/avatars anywhere - People tab cards, social media posts, comments, chat.",
                    ],
                },
                {
                    category: "📋 Skills & Progression System",
                    items: [
                        "<strong>Work Skills:</strong> Technical, Creative, Social, Management skills that level up through gameplay. Each skill has level (1-10), XP, and max XP with exponential scaling.",
                        "<strong>Life Skills:</strong> Fitness and Cooking skills for personal development and lifestyle activities.",
                        "<strong>XP Sources:</strong> Employees gain skill XP from work hours (automatic), evening activities, weekend activities, chat conversations (social), deep conversations (+5 social), flirting (intimate skill), work discussions (highest work skill +3).",
                        "<strong>Level-Up Notifications:</strong> Visual notifications when employees level up skills with celebration emoji 🎉.",
                        '<strong>Specialization Unlocks:</strong> Certain skill levels unlock specializations (e.g., Technical 3 = "Code Wizard").',
                        "<strong>Productivity Bonuses:</strong> Skills provide effective productivity bonuses - technical skills boost tech products, creative skills boost creative products, management gives universal 0.5x boost.",
                        "<strong>Skill Display:</strong> Skills shown in unified profiles, employee cards, position details with levels and progress bars.",
                    ],
                },
                {
                    category: "📅 Schedule & Time System",
                    items: [
                        "<strong>Work Schedule:</strong> Each employee has work days (Mon-Fri default), start/end hours (9 AM - 5 PM), currently-working status, clock in/out timestamps.",
                        "<strong>Hours Tracking:</strong> Daily hours worked, total days worked, late days counted for analytics and performance.",
                        "<strong>Leave System:</strong> PTO balance (10 days default), sick days (5 days), currently on leave status, leave type tracking (PTO/sick/maternity), leave end dates.",
                        "<strong>Future-Ready:</strong> Data structure prepared for time-aware NPC behaviors, location tracking, and daily routine generation.",
                    ],
                },
                {
                    category: "🏠 Life Outside Work",
                    items: [
                        "<strong>Current Activity Tracking:</strong> NPCs track what they're currently doing outside work (prepared for future real-time activity generation).",
                        "<strong>Hobbies System:</strong> Active hobbies with frequency (30-100% engagement), skill levels (1-5), and last-done timestamps.",
                        "<strong>Evening Preferences:</strong> Randomized preferences for gym (0-40%), cooking (0-60%), socializing (0-50%), relaxing (30-70%), hobbies (0-60%), dating (0-30%).",
                        '<strong>Living Situation:</strong> Apartment/house/condo type, roommate status, pet ownership with details (35% have pets - dogs, cats, birds, fish with randomly generated names like "Max", "Luna").',
                        "<strong>Social Circle:</strong> Outside contacts including best friend (70% have one), family (80%), relationship status (30% in relationships), detailed status tracking (single/dating/serious/married).",
                        "<strong>Weekend Plans:</strong> System ready to generate upcoming weekend activities and track last weekend activity.",
                        "<strong>Pet System:</strong> Pets tracked with name, type, who gifted them, and timestamps. Displayable in profiles and referenced in conversations.",
                    ],
                },
                {
                    category: "🎨 UI/UX Improvements",
                    items: [
                        '<strong>People Tab Enhancements:</strong> New "Employee Development Programs" section with three cards for Training, Team Building, and Performance Reviews. Cost displays, cooldown indicators, hover effects.',
                        '<strong>Employee Card Badges:</strong> Active flags display as colored emoji badges on employee cards. Promotion-ready employees get golden pulsing "⬆️ READY" badge.',
                        '<strong>New Action Buttons:</strong> Added "📊 Review" button to employee cards for quick performance review access. "🏷️ Flags" button for flag management.',
                        "<strong>Pyramid Controls:</strong> Pan/zoom controls, pinch-to-zoom on mobile, smooth animations, position tile hover effects.",
                        "<strong>Modal Improvements:</strong> All new modals use consistent styling with gradients, hover effects, responsive design. Better z-index management prevents stacking issues.",
                        "<strong>Visual Feedback:</strong> Success/error notifications for all development program actions. Cost displays update dynamically. Cooldown timers shown in UI.",
                    ],
                },
                {
                    category: "⚙️ Technical Improvements",
                    items: [
                        "<strong>Data Structure Expansion:</strong> Added gameState.corporatePyramid with CEO object, positions arrays by level, promotion costs. gameState.productivitySystems for tracking workshops/reviews. Flag arrays in employee objects.",
                        "<strong>Automatic Initialization:</strong> New data structures auto-initialize on first access with sensible defaults. Migration code converts old saves seamlessly.",
                        "<strong>Event Logging:</strong> Training workshops, team building, and promotions now create company event log entries for AI context.",
                        "<strong>Save Compatibility:</strong> All new systems designed with backward compatibility. Old saves load and automatically upgrade to new structure.",
                        "<strong>Performance:</strong> Flag detection uses regex patterns (no AI calls). Pyramid rendering optimized for large companies. Efficient subordinate counting.",
                        "<strong>Code Organization:</strong> New dedicated sections for corporate hierarchy functions, productivity systems, flag management. Clear function documentation.",
                    ],
                },
                {
                    category: "🔮 Foundation for Future Features",
                    items: [
                        "<strong>Advanced Social Dynamics:</strong> Flag system enables complex NPC-to-NPC relationships. Schedule system ready for time-aware interactions.",
                        "<strong>Family System:</strong> Data structures prepared for pregnancy tracking (7-14 day cycles), children with genetic inheritance, family relationships.",
                        "<strong>Dynamic Schedules:</strong> Time system ready to generate daily routines, track NPC locations throughout the day, implement time-aware behaviors.",
                        "<strong>Life Simulation:</strong> Weekend activities, evening routines, hobby progression, social events outside work - all data structures in place.",
                        "<strong>Relationship Depth:</strong> Flags enable tracking of complex relationship agreements (polyamory, exclusivity, kinks, preferences) that persist across save/load.",
                        "<strong>Expandable Systems:</strong> Universal flag system means ANY new state/trait can be added without code changes - just create a new flag!",
                    ],
                },
            ],
        },
        {
            version: "2510191600",
            date: "October 19, 2025",
            title: "💾 Comprehensive Save/Load System Overhaul",
            changes: [
                {
                    category: "🔒 Save/Load Coverage (50+ Properties)",
                    items: [
                        "<strong>Complete System Audit:</strong> Conducted comprehensive audit of all game systems to ensure 100% save/load coverage. Created detailed documentation tracking all 50+ gameState properties.",
                        "<strong>Social Network Data:</strong> Added explicit saving/loading for all social network properties including feedFilter, feedSort, recentPostTypes, playerDraft (caption, imagePrompt, altText, imageUrl).",
                        "<strong>Player Profile:</strong> Ensured complete player character data is saved (firstName, lastName, age, gender, ethnicity, physical details, intimate details, personality).",
                        "<strong>Company Context:</strong> Added full save/load for companyWideContext (currentBuzz, lastUpdate, maxItems, decayTime) and all company awareness data.",
                        "<strong>Prestige System:</strong> Verified prestige data saving (prestigeLevel, influencePoints, lifetimeEarnings, prestigeMultiplier, globalUpgrades, bossFights).",
                        "<strong>Employee Systems:</strong> Ensured typingStates, onboarding array, and currentCandidates are properly saved.",
                        "<strong>Missing Properties Fixed:</strong> Added initialization for playerMentionStats, activeGossip, lastProactiveMessageCheck, lifestyleAdjustmentCounter, and currentCandidates.",
                    ],
                },
                {
                    category: "📊 Backward Compatibility",
                    items: [
                        "<strong>Default Values:</strong> All new properties have sensible defaults, ensuring old saves load without errors.",
                        "<strong>Migration Path:</strong> Old saves automatically upgraded to new structure without manual intervention.",
                        "<strong>No Breaking Changes:</strong> Existing players can load saves from any previous version.",
                        "<strong>Future-Proof Template:</strong> Created comprehensive guide for adding new save properties (see SAVE_LOAD_AUDIT.md).",
                    ],
                },
                {
                    category: "📝 Documentation",
                    items: [
                        "<strong>Coverage Statistics:</strong> 50+ properties tracked across Core (12), Business (8), Employees (10), Social (12), Company (6), Gifts (7), AI (5).",
                        "<strong>Developer Guide:</strong> Step-by-step instructions for adding new save properties and handling Sets/Maps.",
                    ],
                },
            ],
        },
        {
            version: "2510191523",
            date: "October 19, 2025",
            title: "🚨 Critical Save/Load Bug Fixes",
            changes: [
                {
                    category: "🔥 Game-Breaking Fixes",
                    items: [
                        '<strong>CRITICAL: Fixed Hiring Crash After Loading:</strong> Fixed "TypeError: gameState.usedEmployeeNames.has is not a function" that prevented hiring employees after loading saved games. The Set object was being converted to an Array during JSON serialization, breaking the name uniqueness check.',
                        "<strong>Set Object Restoration:</strong> Added automatic conversion of usedEmployeeNames from Array back to Set when loading games. This preserves the .has() and .add() methods required by the hiring system.",
                        "<strong>Gender Settings Migration:</strong> Fixed \"Cannot read properties of undefined (reading 'female')\" error for old saves without genderSettings. Now automatically initializes with default values (100% female) for backwards compatibility.",
                        "<strong>Additional Set/Map Fixes:</strong> Also fixed blockedProactiveMessages (Set) and recentTopics (Map) which had the same serialization issue. All non-serializable objects now properly restored on load.",
                        "<strong>Debug Logging:</strong> Added console logs to track Set/Map restoration and settings initialization for easier troubleshooting.",
                    ],
                },
                {
                    category: "📝 Technical Details",
                    items: [
                        "<strong>Root Cause:</strong> JavaScript Sets and Maps are not JSON-serializable. When saving to localStorage/KV storage, Sets are converted to Arrays and Maps to plain objects. The loadGame function now detects this and converts them back.",
                        "<strong>Affected Systems:</strong> Name generation (usedEmployeeNames Set), gender selection (genderSettings object), topic tracking (recentTopics Map), proactive messages (blockedProactiveMessages Set).",
                        "<strong>Migration Safety:</strong> Fixes apply automatically to all existing saves without requiring manual intervention. Missing objects are initialized with proper defaults.",
                        "<strong>Future Prevention:</strong> This fix provides a comprehensive template for handling all non-serializable objects (Maps, Sets, etc.) in future features.",
                    ],
                },
            ],
        },
        {
            version: "2510191346",
            date: "October 19, 2025",
            title: "🎁 Gift System Fixes & AI Improvements",
            changes: [
                {
                    category: "🔧 Critical Gift System Fixes",
                    items: [
                        '<strong>Gift Price Scaling Overhaul:</strong> Fixed absurd gift expectations at high wealth levels. Previously at $27B lifetime income, game expected $8.7M-$8.7B gifts, treating a $15k Barcelona trip as "too cheap" (0.3× penalty). Now capped at reasonable human scale: $5k-$500k range regardless of wealth.',
                        "<strong>Price Philosophy Change:</strong> Gifts now judged on thoughtfulness, not price relative to net worth. Any gift $1k+ receives no penalty. Even billionaires appreciate a nice vacation!",
                        "<strong>New Price Ranges:</strong> Perfect range (1.5× bonus): $15k-$150k | Good range (1.2× bonus): $2.5k-$1M | Modest (1.0×): Any $1k+ gift | Only gifts under $100 receive penalties.",
                        '<strong>First Gift Detection:</strong> Fixed NPCs reacting to first-ever gifts as if they\'d received them before. Added explicit "THIS IS YOUR FIRST GIFT" flag in AI prompts with appropriate surprise/delight instructions.',
                        '<strong>Reduced "Overwhelmed" Penalty:</strong> Now only triggers for $500k+ gifts with very weak relationships (under 30), reduced from 0.5× to 0.7× penalty.',
                        "<strong>Debug Logging:</strong> Added comprehensive gift evaluation logs showing category match, price score, modifiers, and final reception calculations.",
                    ],
                },
                {
                    category: "⚡ AI Generation Optimization",
                    items: [
                        "<strong>Stat Evaluation Overhaul:</strong> Implemented optimizations for Player→NPC stat analysis. Reduced prompt from ~600 tokens to ~150 tokens (75% reduction).",
                        "<strong>Format-First Prompts:</strong> Moved output format instructions to beginning of prompts, forcing AI cooperation before seeing context.",
                        "<strong>Deterministic Output:</strong> Changed temperature from 0.3 → 0 and added top_p:0 for 100% consistent stat evaluations.",
                        '<strong>Aggressive Stop Sequences:</strong> Expanded from 8 to 15 stop sequences including "The", "This", "I", "Because" to prevent meta-commentary.',
                        "<strong>Context Compression:</strong> Reduced chat context from last 60 messages to last 4 messages (93% reduction) for faster processing.",
                        "<strong>Robust Parsing:</strong> Added value clamping to [-10, +10] range and better handling of malformed responses.",
                    ],
                },
                {
                    category: "💬 Comment Generation Fixes",
                    items: [
                        '<strong>Meta-Commentary Removal:</strong> Fixed AI outputting internal reasoning in comments like "Boss\'s post is explicit... personality traits: flirty at 36/100... Brainstorming authentic responses..."',
                        "<strong>Prompt Compression:</strong> Reduced comment generation prompts from ~50 lines to ~6 lines (88% reduction).",
                        "<strong>Short Direct Prompts:</strong> New format forces clean output: \"Name sees post: 'content' | Rel: type (strength/100) | Comment (5-25 words):\"",
                        "<strong>Nuclear Cleanup:</strong> Added aggressive sanitization that strips Perchance tokens ({SEEDS}, {BAN}, {BOOST}), name prefixes, and meta-text markers.",
                        "<strong>First-Line-Only:</strong> Comments now extract only first line/sentence, cutting any multi-line meta-analysis.",
                        '<strong>Fallback Detection:</strong> If comment starts with "Boss", "Personality", or other meta-text, automatically uses template comment instead.',
                    ],
                },
                {
                    category: "🔧 Other Fixes",
                    items: [
                        "<strong>Advanced Stats Editing:</strong> Fixed Sandbox Mode stats not persisting when reopening bio modal. Modal now closes and reopens automatically after save to display fresh values.",
                        "<strong>Gift History Tracking:</strong> Added logging of gift history before each gift to help debug duplicate detection.",
                        "<strong>Price Scale Display:</strong> All price calculations now log capped vs uncapped values for transparency.",
                    ],
                },
            ],
        },
        {
            version: "2510172020",
            date: "October 17, 2025",
            title: "🐛 Bug Fixes & AI Optimization",
            changes: [
                {
                    category: "🔧 Bug Fixes",
                    items: [
                        "<strong>Memory Initialization:</strong> Fixed crash when editing bio stats then sending chat messages (ensureEmployeeMemory now called after bio save)",
                        "<strong>Memory Validation:</strong> Added defensive checks to remember() function to prevent undefined memory.items errors",
                        '<strong>Product Unlock Discount:</strong> Fixed "Bulk Buying" prestige reward not applying to product unlock costs. Now shows discounted price with strikethrough original price and discount percentage.',
                        "<strong>Perchance Token Removal:</strong> Fixed {SEEDS:...}, {BAN:...}, {BOOST:...} and other Perchance formatting tokens appearing in posts, comments, and chat messages. Added aggressive sanitization to all AI-generated content.",
                    ],
                },
                {
                    category: "✅ Prestige System Audit (All Confirmed Working)",
                    items: [
                        "<strong>💰 Income Multiplier:</strong> ✓ Applied to all product earnings (visible in product values)",
                        "<strong>💵 Starting Capital:</strong> ✓ Bonus cash added when prestiging",
                        "<strong>👆 Quick Hands (Click Power):</strong> ✓ Reduces product cycle time when clicking (-0.05s per level)",
                        "<strong>👔 HR Efficiency:</strong> ✓ Reduces manager hire/upgrade costs (5% per level, max 50%)",
                        "<strong>📦 Bulk Buying:</strong> ✓ NOW FIXED - Reduces product unlock AND upgrade costs (3% per level, max 45%). Visual discount shown on unlock buttons.",
                        "<strong>⚡ Automation Boost:</strong> ✓ Managers work faster (5% per level, affects auto-run cycle time)",
                    ],
                },
                {
                    category: "⚡ AI Prompt Optimization (In Progress)",
                    items: [
                        '<strong>Chat Stat Evaluation:</strong> Simplified prompt 80%, reduced from 60 lines to 15 lines. Added explicit "Numbers only" instruction with aggressive stop sequences',
                        '<strong>NPC Reaction Evaluation:</strong> Changed "Rate -5 to +5:" to "Output single number -5 to +5 only:" to prevent narrative flashback stories',
                        '<strong>Image Prompt Generation:</strong> Reduced custom prompt analysis by 60%, added stop sequences to prevent verbose "Camera angle:", "Mood:" descriptions',
                        "<strong>Scene Visualization:</strong> Simplified prompt from 20 lines to 8 lines, removed numbered instructions",
                        '<strong>Post Generation:</strong> Added "The stapler" stop sequence to block narrative storytelling, reduced max_tokens to 50',
                        "<strong>Comment Generation:</strong> Added stop sequences to 6 additional functions (reply comments, mentions, autonomous comments)",
                        "<strong>Token Limits:</strong> Tightened across board - evaluations: 3-10 tokens, comments: 35-50 tokens, images: 100-150 tokens",
                        "<strong>Temperature Tuning:</strong> Lowered to 0.3 for evaluations (deterministic), 0.7-0.9 for creative content",
                        "<strong>Note:</strong> These fixes require page reload to clear prompt cache. Testing in progress to confirm effectiveness.",
                    ],
                },
            ],
        },
        {
            version: "2510170912",
            date: "October 17, 2025",
            title: "🎁 Complete Gift System - AI-Powered Gift Giving",
            changes: [
                {
                    category: "🎉 Major New Feature",
                    items: [
                        "<strong>🎁 Complete Gift System:</strong> Give meaningful gifts to employees with AI-powered reactions, dynamic pricing, and deep integration!",
                    ],
                },
                {
                    category: "🧞‍♂️ Gift Genie (AI Gift Generator)",
                    items: [
                        "<strong>Custom Gift Creation:</strong> Describe any gift in text and AI generates it with name, description, category, and price",
                        "<strong>100 Cycling Suggestions:</strong> Rotating placeholder text for inspiration (updates every 1.5 seconds)",
                        "<strong>Budget Limits:</strong> Set max price from $100 to $1 billion",
                        "<strong>Smart Category Mapping:</strong> Prevents AI drift with 11 fixed categories",
                        "<strong>Optional Image Generation:</strong> Create visual representations of your gifts",
                        "<strong>UNIQUE Gift Warnings:</strong> Special indicators for one-time-only items (private islands, landmarks, etc.)",
                    ],
                },
                {
                    category: "💝 11 Gift Categories",
                    items: [
                        "💕 <strong>ROMANTIC:</strong> Flowers, jewelry, love letters",
                        "💎 <strong>LUXURY:</strong> Designer items, champagne, spa days",
                        "✈️ <strong>EXPERIENCES:</strong> Concert tickets, vacations, skydiving",
                        "💻 <strong>TECH:</strong> Gadgets, smart devices, gaming gear",
                        "📚 <strong>INTELLECTUAL:</strong> Books, courses, museum memberships",
                        "🍰 <strong>FOOD:</strong> Gourmet treats, wine, restaurant vouchers",
                        "🛠️ <strong>PRACTICAL:</strong> Office supplies, tools, home goods",
                        "🎪 <strong>QUIRKY:</strong> Novelty items, weird collectibles",
                        "🧘 <strong>WELLNESS:</strong> Fitness equipment, meditation apps",
                        "👗 <strong>FASHION:</strong> Clothing, accessories, cosmetics",
                        "🌍 <strong>UNIQUE:</strong> One-time only items (private islands, landmarks, planets)",
                    ],
                },
                {
                    category: "📈 Dynamic Price Scaling",
                    items: [
                        "<strong>Scales with Company Growth:</strong> Recommended gift prices adapt to your lifetime income THIS prestige",
                        "<strong>Startup ($0-$10K):</strong> $10-$500 gifts",
                        "<strong>Small Business ($10K-$1M):</strong> $500-$10K gifts",
                        "<strong>Growing Company ($1M-$100M):</strong> $10K-$500K gifts",
                        "<strong>Corporation ($100M-$10B):</strong> $500K-$50M gifts",
                        "<strong>Mega Corp ($10B+):</strong> $50M-$1B+ gifts",
                        "Real-time recommendations displayed in Store UI",
                    ],
                },
                {
                    category: "🎭 NPC Gift Preferences",
                    items: [
                        "<strong>Personalized Tastes:</strong> Each employee has 2-3 loved categories, 2-3 hated categories",
                        "<strong>Loved Gifts:</strong> 1.5x to 2.5x stat bonus!",
                        "<strong>Hated Gifts:</strong> Negative stat changes (can harm relationship)",
                        '<strong>Visual Indicators:</strong> "They\'ll LOVE this! 💕" / "They might hate this... 💔" hints in gift selection',
                        "Generated at employee creation, persistent across saves",
                        'Visible in employee bio under "🎁 Gift Preferences"',
                    ],
                },
                {
                    category: "🎯 Intelligent Gift Reception",
                    items: [
                        "<strong>Multi-Factor Calculation:</strong> Category match, price, relationship, timing all affect reaction",
                        "<strong>Gift Fatigue:</strong> 3+ gifts in 7 days = -50% effectiveness (prevents stat grinding)",
                        "<strong>Duplicate Detection:</strong> Same gift within 30 days = -70% penalty",
                        "<strong>Price Appropriateness:</strong> Too cheap OR too expensive = penalties",
                        '<strong>Relationship-Based:</strong> Low relationship + expensive gift = "Suspicious" reaction',
                        "<strong>6 Reaction Tones:</strong> Delighted, Grateful, Overwhelmed, Underwhelmed, Suspicious, Confused",
                        "AI-generated contextual reactions based on employee personality, gift type, and reception quality",
                    ],
                },
                {
                    category: "💬 Conversation Integration",
                    items: [
                        "<strong>Give Gift Button:</strong> Added to conversation attachment menu (+ button)",
                        "<strong>Gift Selection Modal:</strong> Browse inventory with live preference hints",
                        "<strong>Visual Hints:</strong> Green borders for loved categories, red for hated, neutral for others",
                        "<strong>One-Click Giving:</strong> Select gift → instant AI reaction in chat",
                        "<strong>Stat Changes Visible:</strong> See exact affection, comfort, trust, desire changes",
                        "Gifts appear in chat history with reactions",
                        "Empty state when no gifts in inventory (directs to Gifts tab)",
                    ],
                },
                {
                    category: "📊 Gift History & Statistics",
                    items: [
                        "<strong>Bio Integration:</strong> View gift preferences in employee bio modal",
                        "<strong>Total Gifts:</strong> Count of all gifts received",
                        "<strong>Total Value:</strong> Sum of all gift prices",
                        "<strong>Recent Gifts:</strong> Gifts received in last 7 days",
                        "<strong>Favorite Gifts:</strong> Top 5 most-loved gifts displayed",
                        "Color-coded category badges (green for loves, red for hates)",
                        "Stat bonus explanations next to each preference",
                    ],
                },
                {
                    category: "📱 Social Media Integration",
                    items: [
                        "<strong>Expensive Gifts = Posts:</strong> Gifts over $100K trigger automatic social media posts",
                        "NPCs share their reactions publicly",
                        "Includes gift details (name, value, category)",
                        "Increases NPC fame and engagement",
                        "Visible on social feed with reactions",
                    ],
                },
                {
                    category: "🛡️ Anti-Exploit Features",
                    items: [
                        "<strong>UNIQUE Gift Tracking:</strong> One-time items can only be given once per save file",
                        "<strong>Gift Fatigue System:</strong> Prevents stat grinding with rapid gifting",
                        "<strong>Duplicate Detection:</strong> Encourages variety in gift selection",
                        "<strong>Price-Relationship Checks:</strong> Suspicious reactions to inappropriate gifts",
                        "Lifetime income tracking (THIS prestige only, resets on prestige)",
                        "Inventory unlimited but UNIQUE gifts tracked globally",
                    ],
                },
                {
                    category: "🎨 UI/UX Improvements",
                    items: [
                        "<strong>New Gifts Tab:</strong> Complete store interface with gradient styling",
                        "<strong>Gift Preview Modal:</strong> See all details before purchasing",
                        "<strong>Inventory Grid:</strong> Visual cards with hover effects",
                        "<strong>Delete Gifts:</strong> Remove unwanted items from inventory",
                        "<strong>Cycling Suggestions:</strong> Smooth 1.5-second transitions between ideas",
                        "<strong>Responsive Design:</strong> Works on all screen sizes",
                        "Color-coded visual language (pink for gifts, green for loves, red for hates)",
                    ],
                },
                {
                    category: "💾 Technical Implementation",
                    items: [
                        "<strong>~1500 Lines of Code:</strong> Complete feature with 15+ functions",
                        "<strong>Save/Load Support:</strong> All gift data persists correctly",
                        "<strong>Migration System:</strong> Old saves automatically get gift preferences",
                        "<strong>Performance Optimized:</strong> Efficient category lookups and calculations",
                        "Comprehensive error handling",
                        "Full documentation in GIFT_SYSTEM_COMPLETE.md",
                    ],
                },
            ],
        },
        {
            version: "2510170000",
            date: "October 17, 2025",
            title: "🤜 NPC Conversation Improvements",
            changes: [
                {
                    category: "✨ Improvements",
                    items: [
                        '<strong>Fixed repetitive "knuckles" descriptions:</strong> NPCs were constantly mentioning knuckles (whitening, clenching, tightening) in conversations. Added explicit ban on this overused trope with alternative body language suggestions (fidgeting, shifting weight, playing with hair/clothing, eye movements, breathing changes, facial expressions, etc.)',
                    ],
                },
            ],
        },
        {
            version: "2510162000",
            date: "October 16, 2025",
            title: "💰 Payment System Overhaul & Complete Save System",
            changes: [
                {
                    category: "✨ Major New Features",
                    items: [
                        "<strong>Company-Scaled NPC Spending:</strong> NPCs now develop spending habits that scale with company success (1.0x to 6.0x multiplier)",
                        "<strong>Gradual Lifestyle Adjustment:</strong> NPCs smoothly adapt their spending as your business grows (5% per tick)",
                        "<strong>Dynamic Money Requests:</strong> NPCs ask for amounts proportional to company size and their financial situation",
                        "<strong>Counter-Offer System:</strong> Send custom amounts with personal justifications when NPCs request money",
                        "<strong>Bank Balance Tracking:</strong> Each NPC tracks their cumulative money received and spending patterns",
                        "<strong>Lifestyle Inflation:</strong> NPCs develop more expensive habits when receiving money (+$1/day per $10K sent)",
                        "<strong>AI-Enhanced Requests:</strong> Smart, context-aware money requests based on financial need, personality, and relationship",
                        "<strong>Complete Save/Load System:</strong> Import/Export saves as JSON files with metadata and validation",
                        "<strong>Patch Notes System:</strong> View update history with timestamp-based versioning (YYMMDDHHMMSS format)",
                    ],
                },
                {
                    category: "💾 Save System Improvements",
                    items: [
                        "Export saves to JSON files with metadata (version, timestamp, player stats)",
                        "Import saves from files with validation and preview before loading",
                        "Save files include confirmation dialog showing money, employees, prestige level",
                        "Automatic filename generation with timestamps",
                        "Legacy save format detection and migration support",
                        "Pretty-printed JSON for easy editing and debugging",
                        "Full state restoration with UI refresh after import",
                    ],
                },
                {
                    category: "🐛 Critical Bug Fixes",
                    items: [
                        "<strong>Fixed black screen after prestiging</strong> - Now properly loads dashboard with full UI refresh",
                        "<strong>Fixed sandbox settings not saving</strong> - Personality attributes, conversation phase, and memory cap now persist correctly",
                        "Fixed personality attributes (confidence, outgoing, flirty, professional, humor) not being saved",
                        "Fixed conversation phase dropdown not persisting between edits",
                        "Fixed memory cap adjustments being lost after save",
                        "Prestige now forces complete UI refresh for all tabs (dashboard, business, people)",
                        "Added object initialization checks to prevent undefined property errors",
                    ],
                },
                {
                    category: "📈 Financial System Balance",
                    items: [
                        "<strong>Early game ($1K-$100K):</strong> NPCs spend $60-180/day, request $500-$3,000",
                        "<strong>Mid game ($1M):</strong> NPCs spend $125-375/day, request $2,000-$20,000",
                        "<strong>Late game ($100M):</strong> NPCs spend $225-675/day, request $10,000-$150,000",
                        "<strong>End game ($1B+):</strong> NPCs spend $300-900/day, request $50,000-$500,000+",
                        "Request probability scales with financial desperation (broke NPCs more likely to ask)",
                        "Spending rate caps at $50,000/day to prevent absurdity",
                        "Request probability caps at 35% maximum to prevent spam",
                    ],
                },
                {
                    category: "🎨 UI Enhancements",
                    items: [
                        "Redesigned Data Management section with color-coded buttons",
                        "Added emojis and better labels for all save/load actions",
                        "New Patch Notes modal with organized categories and version history",
                        "Improved notification messages with context and status",
                        "Better visual hierarchy in settings panel",
                        "Confirmation dialogs show detailed info before destructive actions",
                    ],
                },
                {
                    category: "⚙️ Technical Improvements",
                    items: [
                        "Added <code>calculateScaledSpendingRate()</code> function for company-scaled spending",
                        "Added <code>adjustEmployeeLifestyles()</code> for gradual lifestyle creep",
                        "Enhanced <code>considerMoneyRequest()</code> with financial intelligence",
                        "Improved <code>sendMoneyToNPC()</code> with better framing and reactions",
                        "New <code>loadSaveData()</code> function for complete state restoration",
                        "Added <code>handleImportedFile()</code> for file validation and parsing",
                        "Enhanced <code>exportSave()</code> with metadata and pretty printing",
                        "Better error handling and user feedback throughout save/load system",
                    ],
                },
            ],
        },
];

function loadPatchNotes() {
    const e = $("patchNotesContent");
    if (!e) return;
    const t = (e) => (e.startsWith("• ") ? `<li class="pn-sub">${e.slice(2)}</li>` : `<li>${e}</li>`);
    e.innerHTML =
        `<div class="pn-toolbar"><span>${PATCH_NOTES.length} releases · newest first</span><button type="button" class="pn-toggle">Expand all</button></div>` +
        PATCH_NOTES.map((e, n) => {
            const a = e.changes.reduce((e, t) => e + t.items.filter((e) => !e.startsWith("• ")).length, 0);
            return `<details class="pn-entry"${0 === n ? " open" : ""}>
          <summary><span class="pn-title">${e.title}</span><span class="pn-meta">${e.date} · v${e.version} · ${a} change${1 === a ? "" : "s"}</span></summary>
          <div class="pn-body">
            ${e.summary ? `<p class="pn-summary">${e.summary}</p>` : ""}
            ${e.changes.map((e) => `<section class="pn-cat"><h4>${e.category}</h4><ul>${e.items.map(t).join("")}</ul></section>`).join("")}
          </div>
        </details>`;
        }).join("");
    const n = e.querySelector(".pn-toggle");
    n.onclick = () => {
        const t = [...e.querySelectorAll(".pn-entry")],
            a = t.every((e) => e.open);
        t.forEach((e) => (e.open = !a)), (n.textContent = a ? "Expand all" : "Collapse all");
    };
}
