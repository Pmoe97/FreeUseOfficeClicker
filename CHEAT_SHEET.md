# ⚡ QUICK REFERENCE CHEAT SHEET
*Print this or keep it on second monitor*

---

## 🎯 TODAY'S GOALS
- [ ] Rebalance economy (2h)
- [ ] Add new locations (2h)  
- [ ] Build boss fights (3.5h)
- [ ] Social feed integration (2h)
- [ ] NPC relationships (1.5h)
- [ ] Image improvements (1.5h)
- [ ] Test & polish (1h)

**Total: ~13.5 hours**

---

## 📂 FILE GUIDE

| File | Purpose | When to Use |
|------|---------|-------------|
| `START_HERE.md` | Overview & motivation | First thing to read |
| `TOMORROW_CHECKLIST.md` | Step-by-step guide | While coding |
| `CODE_SNIPPETS.js` | Copy-paste code | When implementing |
| `DEBUG_REFERENCE.md` | Fix broken stuff | When stuck |
| `TOMORROW_PLAN.md` | Detailed strategy | Understanding why |
| `ARCHITECTURE.md` | System design | Big picture view |
| `index.html` | Your game code | Edit this! |

---

## ⌨️ ESSENTIAL CONSOLE COMMANDS

```javascript
// Quick cash
gameState.cash += 100000

// See game state
console.log(gameState)

// List employees
gameState.employees.forEach(e => console.log(e.name))

// Unlock all locations
gameState.locations.forEach(l => l.unlocked = true)

// Clear errors
console.clear()

// Force save
localStorage.setItem('gameState', JSON.stringify(gameState))

// Emergency backup
let backup = JSON.stringify(gameState)
localStorage.setItem('emergency_backup', backup)

// Restore backup
gameState = JSON.parse(localStorage.getItem('emergency_backup'))
```

---

## 🔧 KEY FUNCTIONS TO FIND

| Function | Line | What It Does |
|----------|------|--------------|
| `buildChatPrompt()` | 2033 | Builds NPC conversation context |
| `sanitizeNpcResponse()` | 1977 | Cleans up NPC responses |
| `sendChatMessage()` | 5213 | Handles player messages |
| `generateEmployee()` | ~2500 | Creates new employee |
| `initGame()` | ~2300 | Starts the game |

**Search Tip:** Press `Ctrl+F` and type function name

---

## 🎮 BOSS FIGHT CHECKLIST

```
Step 1: Add HTML Modal       [CODE_SNIPPETS.js line 100]
Step 2: Add CSS              [CODE_SNIPPETS.js line 200]
Step 3: Add to gameState     [CODE_SNIPPETS.js line 50]
Step 4: Copy functions       [CODE_SNIPPETS.js line 250+]
Step 5: Wire up click        [Add event listener]
Step 6: Test                 [Click should damage boss]
Step 7: Add victory/defeat   [CODE_SNIPPETS.js line 400]
Step 8: Test win/lose        [Play through]
```

---

## 💬 CHAT CONTEXT CHECKLIST

```
Step 1: Store posts in memory     [When post created]
Step 2: Retrieve NPC's posts       [buildChatPrompt]
Step 3: Retrieve coworker posts    [buildChatPrompt]
Step 4: Add to context             [contextFacts array]
Step 5: Test                       [Ask NPC about post]
```

---

## 🐛 COMMON ERRORS & FIXES

| Error | Fix |
|-------|-----|
| "X is not defined" | Add `let X = ...` or `const X = ...` |
| "Cannot read property of undefined" | Add `if (obj && obj.prop)` check |
| Modal won't show | Check `display: flex` and `z-index` |
| Boss health not updating | Check `updateBossUI()` is called |
| NPCs don't reference posts | Check posts are in `gameState.socialFeed` |
| Images not consistent | Check `employee.appearance` exists |

---

## 📏 BALANCE VALUES

### Economy (Adjust these in `gameBalance`):
```javascript
globalIncomeMultiplier: 2.0    // Make game faster
productCostMultiplier: 1.5     // Cost scaling
productIncomeMultiplier: 1.15  // Income scaling
startingProductCost: 10        // First product cost
```

### Boss Fights:
```javascript
Marketing Boss: 15,000 HP, 60s
R&D Boss: 50,000 HP, 90s
Executive Boss: 200,000 HP, 120s
```

### Player Upgrades:
```javascript
Click Power: Base 10, +5 per level
NPC Bonus: Base 1x, +0.5x per level
Auto Click: +2 clicks/sec per level
```

---

## 🎨 NEW DATA TO ADD

### Locations:
```javascript
marketing, rnd, executive, warehouse, coffeeshop
```

### Products Per Location:
```javascript
4-6 products each, scaling costs
Base: 500, 2500, 10000, 50000...
Income: 8, 40, 150, 800...
```

---

## ⏱️ TIME ESTIMATES

| Task | Time | Breaks |
|------|------|--------|
| Economy | 2h | 15min |
| Locations | 2h | 15min |
| Boss P1 | 2h | 15min |
| Boss P2 | 1.5h | 20min |
| Social | 2h | 15min |
| Relations | 1.5h | 15min |
| Images | 1.5h | 15min |
| Polish | 1h | - |

**Include breaks or you'll burn out!**

---

## 🎯 TESTING CHECKLIST

After Each Session:
- [ ] Console has no errors
- [ ] New feature works
- [ ] Old features still work
- [ ] Game saves/loads
- [ ] Git commit made

Before Done:
- [ ] Full playthrough (15 min)
- [ ] All features tested
- [ ] Balance feels good
- [ ] No obvious bugs
- [ ] Save/load works
- [ ] Final git commit

---

## 💾 GIT WORKFLOW

```bash
# Before starting
git status
git commit -am "Pre-expansion baseline"

# After each session
git add .
git commit -m "Session X: [what you did]"

# If you break something
git log --oneline
git reset --hard [commit-hash]

# End of day
git commit -am "Day complete: [summary]"
```

---

## 🎵 CODING PLAYLIST SUGGESTIONS
- Lo-fi beats
- Video game OSTs
- Epic orchestral
- Synthwave
- Whatever pumps you up! 🎧

---

## ☕ BREAK SCHEDULE

```
Every 1 hour: 5-10 min break
Every 2 hours: 15 min break
Every 4 hours: 30 min break (lunch/dinner)

During breaks:
✓ Stand up
✓ Stretch
✓ Walk around
✓ Hydrate
✓ Snack
✓ Rest eyes
```

---

## 🎉 CELEBRATION MILESTONES

- [ ] First session done → Stand & stretch
- [ ] Boss fight works → Victory lap
- [ ] Chat context works → High five yourself
- [ ] All 7 sessions done → DANCE PARTY 💃
- [ ] Bug-free playthrough → Order pizza 🍕

---

## 🆘 WHEN STUCK (30 min+)

1. **Take a 10 min break** (seriously)
2. **Read error message** carefully
3. **Console.log everything**
4. **Comment out new code**
5. **Check DEBUG_REFERENCE.md**
6. **Try different approach**
7. **Git reset if needed**
8. **Ask for help** (me, internet, etc)

**REMEMBER: Being stuck is normal! Every dev googles stuff!**

---

## 💪 MOTIVATIONAL MANTRAS

- "One function at a time"
- "Test often, commit frequently"  
- "Progress > Perfection"
- "Breaks make me faster"
- "I got this! 🔥"

---

## 📊 SUCCESS = ?

```
✓ Code works
✓ No console errors
✓ Features are fun
✓ Game is playable
✓ You learned stuff
✓ You had fun
-----------------
= SUCCESS! 🎉
```

Don't need:
✗ Perfect code
✗ Zero bugs
✗ Pro-level polish
✗ 100% complete

**Done is better than perfect!**

---

## 🎯 THE ULTIMATE RULE

```
┌─────────────────────────────────────┐
│                                     │
│   IF IT WORKS, SHIP IT.            │
│   IF IT'S FUN, KEEP IT.            │
│   IF IT'S BROKEN, FIX IT.          │
│   IF YOU'RE STUCK, BREAK IT.       │
│   IF YOU'RE TIRED, REST.           │
│                                     │
│   BUT MOST IMPORTANTLY:             │
│   HAVE FUN CODING! 🚀              │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 PASTE THIS IN YOUR PHONE

```
FreeUseOfficeClicker TODO
------------------------
1. START_HERE.md first
2. TOMORROW_CHECKLIST.md = guide
3. CODE_SNIPPETS.js = copy-paste
4. DEBUG_REFERENCE.md = fixes
5. Test after every change
6. Git commit every hour
7. Take breaks!
8. You got this! 💪
```

---

## 🎮 FINAL PREFLIGHT

Before you start:
- [ ] Coffee/tea ready
- [ ] Snacks available
- [ ] Water bottle full
- [ ] Playlist queued
- [ ] Files open in VS Code
- [ ] Browser console open (F12)
- [ ] This cheat sheet visible
- [ ] Phone on silent
- [ ] Distraction-free space
- [ ] EXCITED TO CODE!

---

**NOW GO MAKE SOMETHING AWESOME! 🔥💻🎮**

*You're gonna crush it! - Your AI Buddy 🤖*

---

## 🔖 BOOKMARK THESE LINES

| What | Where | Line |
|------|-------|------|
| Game balance | CODE_SNIPPETS.js | 15 |
| Boss fight HTML | CODE_SNIPPETS.js | 90 |
| Boss functions | CODE_SNIPPETS.js | 250 |
| Social integration | CODE_SNIPPETS.js | 500 |
| Relationships | CODE_SNIPPETS.js | 650 |
| Image improvements | CODE_SNIPPETS.js | 750 |

**Ctrl+G in VS Code to jump to line!**

---

*End of cheat sheet. You're ready! Go code! 🚀*
