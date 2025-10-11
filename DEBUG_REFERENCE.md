# 🚨 QUICK DEBUG REFERENCE CARD
*Keep this open in a tab - you'll thank yourself later*

---

## ⚡ INSTANT FIXES

### Game Won't Load
```javascript
// In browser console:
localStorage.clear()
location.reload()
```

### Need Money Fast (Debug)
```javascript
// In browser console:
gameState.cash += 100000
```

### See All Game State
```javascript
// In browser console:
console.log(gameState)
```

### Force Save Game
```javascript
// In browser console:
localStorage.setItem('gameState', JSON.stringify(gameState))
```

---

## 🔍 COMMON ERROR MESSAGES & FIXES

### Error: "Cannot read property 'X' of undefined"
**Cause:** Trying to access property on null/undefined object  
**Fix:** Add check: `if (object && object.property) { ... }`

### Error: "X is not a function"
**Cause:** Function doesn't exist or wrong scope  
**Fix:** Check function is defined before calling it

### Error: "Maximum call stack size exceeded"
**Cause:** Infinite loop or recursion  
**Fix:** Check your loop conditions, add break statements

### Warning: "Too many active WebGL contexts"
**Cause:** Too many images loading at once  
**Fix:** Limit concurrent image generations to 3-5 max

---

## 🎯 SPECIFIC FEATURE DEBUG

### Boss Fight Not Working?
```javascript
// Check if boss data exists:
console.log(gameState.bossFights.active)

// Manually start fight:
startBossFight('marketing')

// Check damage calculation:
console.log('Player Damage:', calculatePlayerDamage())
console.log('NPC DPS:', calculateNpcDps())
```

### Chat Not Responding?
```javascript
// Check active chat:
console.log(gameState.activeChat)

// Check chat history:
console.log(gameState.chatHistory)

// Test AI function:
generateText("Hello test").then(r => console.log(r))
```

### Products Not Showing?
```javascript
// List all products:
console.log(gameState.products)

// Check products for location:
console.log(gameState.products.filter(p => p.locationId === 'marketing'))

// Check location unlock status:
console.log(gameState.locations)
```

### Social Feed Empty?
```javascript
// Check feed:
console.log(gameState.socialFeed)

// Manually create test post:
gameState.socialFeed.push({
  id: 'test_' + Date.now(),
  authorId: gameState.employees[0].id,
  content: 'Test post!',
  timestamp: Date.now()
})

// Refresh feed display:
renderSocialFeed()
```

### Images Not Generating?
```javascript
// Test image generation:
generateImage({ 
  prompt: "test image of a person" 
}).then(url => console.log('Image URL:', url))

// Check if function exists:
console.log(typeof generateImage)

// Check Perchance plugin loaded:
console.log(typeof window.generateImage)
```

---

## 📊 USEFUL CONSOLE COMMANDS

### List All Employees
```javascript
gameState.employees.forEach(e => console.log(e.name, e.position))
```

### Give All Employees Max Stats
```javascript
gameState.employees.forEach(e => {
  e.stats.affection = 100
  e.stats.trust = 100
  e.stats.desire = 100
  e.stats.comfort = 100
})
```

### Unlock All Locations
```javascript
gameState.locations.forEach(l => l.unlocked = true)
```

### Set All Upgrade Levels to 10
```javascript
Object.keys(gameState.bossFights.playerUpgrades).forEach(key => {
  gameState.bossFights.playerUpgrades[key].level = 10
})
```

### Clear All Social Posts
```javascript
gameState.socialFeed = []
```

### Get Employee by Name
```javascript
let emp = gameState.employees.find(e => e.name.includes("Sarah"))
console.log(emp)
```

---

## 🎨 CSS QUICK FIXES

### Element Not Visible?
```css
/* Add inline style: */
style="display: block !important; visibility: visible !important; opacity: 1 !important;"
```

### Z-Index Issues?
```css
/* Force to top: */
style="z-index: 999999 !important; position: fixed !important;"
```

### Element Overlapping?
```css
/* Add pointer events: */
style="pointer-events: auto !important;"
```

---

## 🔧 PERFORMANCE ISSUES

### Game Running Slow?
1. Check how many employees: `console.log(gameState.employees.length)`
2. If > 30, that's your problem
3. Limit to 20-25 max for performance

### Too Many Images Loading?
1. Limit concurrent generations
2. Add loading queue
3. Cache generated images

### Memory Leak?
1. Clear old chat history: `gameState.chatHistory = {}`
2. Limit social feed: `gameState.socialFeed = gameState.socialFeed.slice(-100)`
3. Clear employee memories: `emp.memory.entries = []`

---

## 💾 SAVE FILE ISSUES

### Save File Too Large?
```javascript
// Check size:
let size = JSON.stringify(gameState).length
console.log('Save size:', (size / 1024).toFixed(2), 'KB')

// If > 5MB, you need to trim data
```

### Can't Load Old Save?
```javascript
// Backup old save:
let oldSave = localStorage.getItem('gameState')
console.log('Old save:', oldSave)

// Try manual load:
try {
  gameState = JSON.parse(oldSave)
} catch(e) {
  console.error('Save corrupted:', e)
}
```

### Reset Specific Part of Save?
```javascript
// Keep money and employees, reset everything else:
let money = gameState.cash
let emps = gameState.employees
initGame() // Reset
gameState.cash = money
gameState.employees = emps
```

---

## 🎯 TESTING SHORTCUTS

### Fast Money Mode
```javascript
// Add to top of file for testing:
let DEV_MODE = true
if (DEV_MODE) {
  gameState.cash = 999999
  gameBalance.globalIncomeMultiplier = 10
}
```

### Skip Time
```javascript
// Simulate time passing:
let seconds = 60
for(let i = 0; i < seconds; i++) {
  gameLoop() // Your main game loop function
}
```

### Auto-Win Boss Fight
```javascript
// In boss fight:
gameState.bossFights.active.currentHealth = 0
bossFightVictory()
```

---

## 📝 FUNCTION LOCATION REFERENCE

| Function | Approx Line | Purpose |
|----------|-------------|---------|
| `initGame()` | 2300 | Initialize game state |
| `buildChatPrompt()` | 2033 | Build NPC chat context |
| `sendChatMessage()` | 5213 | Handle player messages |
| `generateEmployee()` | 2500 | Create new employee |
| `addProduct()` | 3500 | Add product to game |
| `purchaseProduct()` | 3800 | Handle product purchase |
| `renderSocialFeed()` | 6500 | Display social posts |
| `generateImage()` | 2400 | Create AI images |

---

## 🆘 EMERGENCY RESET

### If Everything Breaks:
```javascript
// 1. Backup current state (just in case):
let backup = JSON.stringify(gameState)
localStorage.setItem('emergency_backup', backup)

// 2. Clear everything:
localStorage.clear()

// 3. Reload page:
location.reload()

// 4. If you want to restore:
gameState = JSON.parse(localStorage.getItem('emergency_backup'))
```

### Git Reset to Last Working Version:
```bash
# See recent commits:
git log --oneline -5

# Reset to specific commit:
git reset --hard <commit-hash>

# Or just undo last commit:
git reset --hard HEAD~1
```

---

## 🎓 BEST PRACTICES REMINDER

1. **Console.log is your friend** - Use it everywhere
2. **Test one thing at a time** - Don't change 10 things then test
3. **Commit often** - Every working feature = commit
4. **Use browser dev tools** - Network tab, Console, Elements
5. **Take breaks** - Seriously, every hour, 5-10 minutes
6. **Read error messages** - They usually tell you exactly what's wrong
7. **Google error messages** - Someone else had this problem
8. **Check MDN docs** - For JavaScript functions
9. **Backup before major changes** - Copy file or git commit
10. **Keep this file open** - You'll need it!

---

## 🎉 CELEBRATE WINS

After each major milestone:
1. Git commit with descriptive message
2. Take a 5 minute break
3. Grab a snack/drink
4. Do a little victory dance 💃
5. Get back to it! 💪

---

**Remember: You're building something awesome! Every bug fixed is progress! 🚀**

*"It's not a bug, it's an undocumented feature!"* 😄
