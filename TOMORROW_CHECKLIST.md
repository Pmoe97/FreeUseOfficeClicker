# 🎮 TOMORROW'S CODING CHECKLIST
*Your step-by-step guide to conquering CODING HELL* 😈🔥

---

## ☕ BEFORE YOU START
- [ ] Make a coffee/tea
- [ ] Git commit current state: `git commit -am "Pre-expansion baseline"`
- [ ] Open CODE_SNIPPETS.js in another tab for easy copy-paste
- [ ] Open TOMORROW_PLAN.md for reference
- [ ] Test current game works: open index.html in browser
- [ ] Open browser console (F12) - keep it open for debugging

---

## 🎯 SESSION 1: ECONOMY REBALANCING (Est. 2 hours)

### Step 1: Add Game Balance Object
- [ ] Find `gameState` initialization (around line 2300)
- [ ] Add `gameBalance` object from CODE_SNIPPETS.js
- [ ] Save file

### Step 2: Update Product Income Calculation
- [ ] Find function that calculates product income per second
- [ ] Replace with `calculateProductIncome()` from CODE_SNIPPETS.js
- [ ] Test: Buy a product, verify income increases reasonably

### Step 3: Update Product Cost Calculation
- [ ] Find function that calculates product purchase cost
- [ ] Replace with `calculateProductCost()` from CODE_SNIPPETS.js
- [ ] Test: Buy multiple levels, verify cost scales properly

### Step 4: Adjust Starting Values
- [ ] Reduce initial product costs (divide by 5-10)
- [ ] Increase base income multipliers (multiply by 2-3)
- [ ] Test: Can you buy first product in ~10 seconds?

### Step 5: Play Testing
- [ ] Start fresh game
- [ ] Time to first product: Should be ~10 seconds ✓
- [ ] Time to second product: Should be ~30 seconds ✓
- [ ] Time to first employee: Should be ~2 minutes ✓
- [ ] Does progression feel good? If not, adjust multipliers

### Step 6: Commit Progress
- [ ] Git commit: `git commit -am "Rebalanced economy for better progression"`

**⏸️ BREAK TIME: 5-10 minutes**

---

## 🏢 SESSION 2: NEW LOCATIONS & PRODUCTS (Est. 2 hours)

### Step 1: Add Location Data Structure
- [ ] Find where locations are defined (search for "Office Space" or first location)
- [ ] Add `newLocations` array from CODE_SNIPPETS.js
- [ ] Verify locations object structure matches existing

### Step 2: Add Product Data for New Locations
- [ ] Add `newProducts` object from CODE_SNIPPETS.js
- [ ] Merge new products with existing products array
- [ ] Verify product structure matches existing products

### Step 3: Update Location Rendering
- [ ] Find function that renders location tabs/buttons
- [ ] Ensure it handles locked locations (show lock icon + unlock cost)
- [ ] Add "Challenge" button for boss-locked locations

### Step 4: Update Product Filtering
- [ ] Find function that filters products by location
- [ ] Verify it works with new location IDs
- [ ] Test: Switch between locations, see correct products

### Step 5: Visual Polish
- [ ] Ensure new location emojis display correctly
- [ ] Add visual indicator for locked locations
- [ ] Add hover tooltips for locked locations

### Step 6: Test Everything
- [ ] All new locations show up ✓
- [ ] Products appear in correct locations ✓
- [ ] Can purchase new location products ✓
- [ ] Income calculates correctly ✓
- [ ] No console errors ✓

### Step 7: Commit Progress
- [ ] Git commit: `git commit -am "Added Marketing, R&D, and Executive locations with products"`

**⏸️ BREAK TIME: 10-15 minutes**

---

## ⚔️ SESSION 3: BOSS FIGHT SYSTEM - PART 1 (Est. 2 hours)

### Step 1: Add Boss Fight Modal HTML
- [ ] Copy `bossFightHTML` from CODE_SNIPPETS.js
- [ ] Paste after the chat modal in HTML (around line 600)
- [ ] Save and verify modal doesn't show on page load

### Step 2: Add CSS Animations
- [ ] Copy `cssAnimations` from CODE_SNIPPETS.js
- [ ] Paste in `<style>` section at top of file
- [ ] Save

### Step 3: Initialize Boss Fight State
- [ ] Find `gameState` object initialization
- [ ] Add `bossFights` property from CODE_SNIPPETS.js
- [ ] Add `playerUpgrades` property

### Step 4: Add Boss Fight Functions
- [ ] Copy `startBossFight()` from CODE_SNIPPETS.js
- [ ] Copy `runBossFight()` function
- [ ] Copy `bossClick()` function
- [ ] Copy `calculatePlayerDamage()` function
- [ ] Copy `calculateNpcDps()` function
- [ ] Copy `updateBossUI()` function
- [ ] Paste all in JavaScript section (around line 5000+)

### Step 5: Wire Up Click Handler
- [ ] Find boss fight modal initialization
- [ ] Add click event to `#bossClickBtn`: `document.getElementById('bossClickBtn').addEventListener('click', bossClick);`
- [ ] Add click event to close button

### Step 6: Add Challenge Buttons to Locked Locations
- [ ] Find location rendering function
- [ ] For locked locations with `unlockType: 'boss'`, add Challenge button
- [ ] Wire button to call `startBossFight(locationId)`

### Step 7: Test Basic Boss Fight
- [ ] Start a boss fight ✓
- [ ] Modal appears ✓
- [ ] Click button damages boss ✓
- [ ] Health bar updates ✓
- [ ] Timer counts down ✓
- [ ] Can close modal ✓

### Step 8: Commit Progress
- [ ] Git commit: `git commit -am "Added boss fight system - basic functionality"`

**⏸️ LONG BREAK: 20-30 minutes, you earned it!**

---

## ⚔️ SESSION 4: BOSS FIGHT SYSTEM - PART 2 (Est. 1.5 hours)

### Step 1: Add Victory/Defeat Functions
- [ ] Copy `bossFightVictory()` from CODE_SNIPPETS.js
- [ ] Copy `bossFightDefeat()` function
- [ ] Copy `showDamageNumber()` function
- [ ] Paste all functions

### Step 2: Test Win Condition
- [ ] Start boss fight
- [ ] Click until boss health = 0
- [ ] Victory message shows ✓
- [ ] Location unlocks ✓
- [ ] Reward cash given ✓
- [ ] Modal closes ✓

### Step 3: Test Lose Condition
- [ ] Start boss fight
- [ ] Wait for timer to run out
- [ ] Defeat message shows ✓
- [ ] Location stays locked ✓
- [ ] Modal closes ✓
- [ ] Can retry ✓

### Step 4: Add NPC Passive DPS
- [ ] Verify `calculateNpcDps()` is being called in `runBossFight()`
- [ ] Test with 0 employees: Should be hard/impossible
- [ ] Hire employees
- [ ] Test with 5+ employees: Should see passive damage in UI

### Step 5: Add Damage Number Animations
- [ ] Verify `showDamageNumber()` is called on click
- [ ] Test: Click and see floating damage numbers ✓
- [ ] Verify they disappear after 1 second ✓

### Step 6: Create Player Upgrade Shop UI
- [ ] Add new section in HR tab or new "Upgrades" tab
- [ ] Show three upgrade types:
  - Click Power (increases damage per click)
  - Auto Click (passive clicking)
  - NPC Bonus (NPCs do more boss damage)
- [ ] Show current level and cost for each
- [ ] Add purchase buttons

### Step 7: Wire Up Player Upgrades
- [ ] Add click handlers for upgrade buttons
- [ ] Deduct cash, increase level
- [ ] Update `calculatePlayerDamage()` and `calculateNpcDps()` to use upgrade levels
- [ ] Test upgrades work in boss fights

### Step 8: Balance Boss Fights
- [ ] Adjust boss health values
- [ ] Adjust time limits
- [ ] Adjust reward multipliers
- [ ] Test that early boss is beatable, later bosses need upgrades

### Step 9: Commit Progress
- [ ] Git commit: `git commit -am "Completed boss fight system with upgrades"`

**⏸️ BREAK TIME: 15 minutes**

---

## 💬 SESSION 5: SOCIAL FEED CONTEXT (Est. 2 hours)

### Step 1: Store Posts in Employee Memory
- [ ] Find function where social posts are created
- [ ] After creating post, add: `remember(employee, "I posted: " + content, 'event', 2.0);`
- [ ] Test: Create post, check employee memory includes it

### Step 2: Update buildChatPrompt - Add My Posts
- [ ] Find `buildChatPrompt()` function (line 2033)
- [ ] Add code to retrieve employee's recent posts
- [ ] Copy from CODE_SNIPPETS.js: "Get employee's recent posts" section
- [ ] Add to `contextFacts` array

### Step 3: Update buildChatPrompt - Add Coworker Posts
- [ ] In `buildChatPrompt()`, add code to get posts from other employees
- [ ] Copy from CODE_SNIPPETS.js: "Get posts from other employees" section
- [ ] Only include if player is asking about posts

### Step 4: Test Post Memory
- [ ] Have NPC create social post
- [ ] Open chat with that NPC
- [ ] Ask "What did you post about?"
- [ ] NPC should reference their recent post ✓

### Step 5: Handle Coworker Mentions
- [ ] Copy `handleCoworkerMention()` from CODE_SNIPPETS.js
- [ ] In `buildChatPrompt()`, detect if player mentions another employee name
- [ ] Add coworker context to prompt

### Step 6: Test Coworker Context
- [ ] Have multiple NPCs post things
- [ ] Chat with NPC A
- [ ] Ask about NPC B
- [ ] NPC A should know about NPC B ✓

### Step 7: Add Post References to Conversations
- [ ] Test: "I saw your post about [topic]" - NPC should understand ✓
- [ ] Test: "What did [Name] mean in their post?" - NPC should reference it ✓

### Step 8: Commit Progress
- [ ] Git commit: `git commit -am "Integrated social feed context into conversations"`

**⏸️ BREAK TIME: 10 minutes**

---

## 🤝 SESSION 6: NPC RELATIONSHIPS (Est. 1.5 hours)

### Step 1: Add Relationship Data Structure
- [ ] Copy relationship initialization code from CODE_SNIPPETS.js
- [ ] Add `relationships` property to employee object template

### Step 2: Create Relationship Initialization Function
- [ ] Copy `initializeEmployeeRelationships()` from CODE_SNIPPETS.js
- [ ] Copy `hasSharedInterests()` helper function
- [ ] Call initialization when game loads

### Step 3: Generate Initial Relationships
- [ ] When new employee is hired, create relationships with existing employees
- [ ] Use same location = +20 relationship
- [ ] Use shared interests = +15 relationship

### Step 4: Display Relationships in UI
- [ ] In employee card, add "Relationships" section
- [ ] Show list of known coworkers with relationship type
- [ ] Color code: green = friend, red = dislikes, blue = crush

### Step 5: Update buildChatPrompt with Relationships
- [ ] When player mentions another employee, check if current employee knows them
- [ ] Add relationship context to prompt
- [ ] Copy from CODE_SNIPPETS.js: `handleCoworkerMention()` section

### Step 6: Test Relationship Context
- [ ] Chat with NPC A
- [ ] Mention NPC B
- [ ] NPC A should reference their relationship with B ✓
- [ ] If they're friends: mention positively ✓
- [ ] If they dislike: mention negatively ✓

### Step 7: Auto-Generate Shared Events
- [ ] When company events happen, add to shared events for involved NPCs
- [ ] When NPCs in same location, occasionally generate random interactions
- [ ] Store in `sharedEvents` array

### Step 8: Commit Progress
- [ ] Git commit: `git commit -am "Added NPC relationship system"`

**⏸️ BREAK TIME: 10-15 minutes**

---

## 🎨 SESSION 7: IMAGE-CAPTION COHESION (Est. 1.5 hours)

### Step 1: Add Appearance System to Employees
- [ ] Copy `generateEmployeeAppearance()` from CODE_SNIPPETS.js
- [ ] When creating new employee, call this function
- [ ] Store `appearance` object on employee

### Step 2: Update All Employee Image Generation
- [ ] Find all places where employee images are generated
- [ ] Ensure they use `employee.appearance.toString()` in prompt
- [ ] This ensures consistency

### Step 3: Improve Social Post Image Generation
- [ ] Copy `generateSocialPostWithImage()` from CODE_SNIPPETS.js
- [ ] Replace existing social post image generation
- [ ] This analyzes caption to extract scene details

### Step 4: Test Appearance Consistency
- [ ] Generate employee
- [ ] Request multiple images from them (casual, work, lewd)
- [ ] Verify all images show same person (similar appearance) ✓

### Step 5: Test Caption-Image Matching
- [ ] Create social post with specific caption (e.g., "At the beach!")
- [ ] Verify image shows beach scene ✓
- [ ] Create post: "Working late at my desk"
- [ ] Verify image shows office/desk scene ✓

### Step 6: Add Alt Text to Images
- [ ] When displaying images, show alt text on hover
- [ ] Use image prompt as alt text
- [ ] Helps debug mismatches

### Step 7: Improve Image Prompts with More Details
- [ ] Add lighting conditions (natural light, office lighting, etc.)
- [ ] Add camera angle (selfie angle, professional shot, etc.)
- [ ] Add mood/emotion to match caption tone

### Step 8: Test and Refine
- [ ] Generate 10 test posts with images
- [ ] Rate each caption-image match 1-10
- [ ] If average < 7, adjust prompt engineering
- [ ] Iterate until satisfied

### Step 9: Commit Progress
- [ ] Git commit: `git commit -am "Improved image-caption cohesion with appearance system"`

---

## ✨ FINAL SESSION: POLISH & TESTING (Est. 1 hour)

### Step 1: Full Playthrough Test
- [ ] Reset game (or start new save)
- [ ] Play for 10 minutes straight
- [ ] Note any bugs, frustrations, or confusing parts
- [ ] Fix critical issues

### Step 2: Console Error Check
- [ ] Open browser console
- [ ] Play game for 5 minutes
- [ ] Fix any errors that appear

### Step 3: Balance Final Pass
- [ ] First boss: Can beat in 1-2 attempts? ✓
- [ ] Economy: Feels rewarding? ✓
- [ ] Progression: No long boring waits? ✓

### Step 4: UI Polish
- [ ] All new buttons have hover effects ✓
- [ ] All modals have close buttons ✓
- [ ] All text is readable ✓
- [ ] No overlapping elements ✓

### Step 5: Save/Load Test
- [ ] Play game, make progress
- [ ] Save game
- [ ] Refresh page
- [ ] Load game
- [ ] Verify everything loaded correctly ✓

### Step 6: Final Commit
- [ ] Git commit: `git commit -am "Polish and bug fixes - ready for play testing"`
- [ ] Git push (if using remote)

### Step 7: Create Backup
- [ ] Copy index.html to index_backup.html
- [ ] Export save data
- [ ] Celebrate! 🎉

---

## 🐛 TROUBLESHOOTING GUIDE

### If boss fight modal doesn't appear:
1. Check console for errors
2. Verify modal HTML was added correctly
3. Check z-index isn't being overridden
4. Verify `startBossFight()` is being called

### If NPCs don't reference posts:
1. Verify posts are being saved to gameState.socialFeed
2. Check `remember()` function is being called
3. Verify `buildChatPrompt()` includes post retrieval
4. Check console for errors in memory system

### If images don't match captions:
1. Verify `employee.appearance` exists
2. Check image prompt in console
3. Make sure prompt includes scene analysis
4. Try more specific prompts

### If game is too slow/fast:
1. Adjust `gameBalance.globalIncomeMultiplier`
2. Change product cost multipliers
3. Adjust starting costs
4. Test with fresh game

### If boss fights are too hard/easy:
1. Adjust boss health values
2. Change time limits
3. Adjust player damage calculation
4. Modify NPC DPS calculation

---

## 📈 SUCCESS METRICS

By end of day, you should have:
- [ ] 3-5 new locations with 15+ new products
- [ ] Working boss fight system with upgrades
- [ ] NPCs that reference their own and others' posts
- [ ] NPCs that know and discuss other employees
- [ ] Images that better match their captions
- [ ] More engaging economy with faster progression
- [ ] No critical bugs
- [ ] Smile on your face because you're a coding wizard 🧙‍♂️

---

## 🎯 IF YOU GET STUCK

1. **Take a break** - 10 minutes away helps more than you think
2. **Check console** - 90% of issues show errors there
3. **Comment out new code** - Isolate what broke
4. **Test in stages** - Don't write 500 lines then test
5. **Use console.log()** - Print values to verify logic
6. **Git reset** - If all else fails: `git reset --hard HEAD`

---

## 🔥 MOTIVATIONAL REMINDERS

- "Perfect is the enemy of done" - Ship it even if not perfect
- "Test early, test often" - Saves hours of debugging later
- "One feature at a time" - Don't try to do everything at once
- "Take breaks" - Your brain needs rest to code well
- "Have fun" - This is YOUR game, make it awesome!

---

**You got this! Now go forth and conquer CODING HELL! 😈🔥💻**

*Remember: The only way out is through. The code is your sword, Git is your shield, and coffee is your potion. ONWARD!*
