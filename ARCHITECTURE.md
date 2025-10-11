# 🏗️ SYSTEM ARCHITECTURE OVERVIEW

## 📊 Current Game Structure

```
┌─────────────────────────────────────────────────────────────┐
│                        GAME STATE                           │
│  (Central data store - all game data lives here)           │
├─────────────────────────────────────────────────────────────┤
│  • cash                    • employees                      │
│  • products                • locations                      │
│  • socialFeed              • chatHistory                    │
│  • settings                • playerBio                      │
└─────────────────────────────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   CLICKER    │    │   SOCIAL     │    │     CHAT     │
│   SYSTEM     │    │    FEED      │    │   SYSTEM     │
├──────────────┤    ├──────────────┤    ├──────────────┤
│ • Products   │    │ • Posts      │    │ • Messages   │
│ • Income     │    │ • Comments   │    │ • AI Gen     │
│ • Purchases  │    │ • Images     │    │ • Memory     │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## 🎯 NEW ARCHITECTURE (After Tomorrow)

```
┌─────────────────────────────────────────────────────────────┐
│                    ENHANCED GAME STATE                      │
├─────────────────────────────────────────────────────────────┤
│  • cash                    • employees (+relationships)     │
│  • products (+15 new)      • locations (+5 new)            │
│  • socialFeed              • chatHistory                    │
│  • settings                • playerBio                      │
│  • bossFights ⭐NEW        • playerUpgrades ⭐NEW           │
│  • gameBalance ⭐NEW       • companyEvents ⭐NEW            │
└─────────────────────────────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   CLICKER    │    │   SOCIAL     │    │     CHAT     │
│   SYSTEM     │    │    FEED      │    │   SYSTEM     │
├──────────────┤    ├──────────────┤    ├──────────────┤
│ • Products   │    │ • Posts      │    │ • Messages   │
│ • Income     │    │ • Images     │◄───┤ • AI Gen     │
│ • Purchases  │    │ • Reactions  │    │ • Memory     │
│ • Balance⭐  │    └──────┬───────┘    │ • Context⭐  │
└──────┬───────┘           │            └──────┬───────┘
       │                   │                   │
       │         ┌─────────┴─────────┐        │
       │         │                   │        │
       ▼         ▼                   ▼        ▼
┌──────────────────┐        ┌─────────────────────┐
│   BOSS FIGHTS    │        │   NPC RELATIONSHIPS │
│      ⭐NEW        │        │       ⭐NEW          │
├──────────────────┤        ├─────────────────────┤
│ • Click Combat   │        │ • Friendship Graph  │
│ • Health/Timer   │        │ • Shared Events     │
│ • Victory/Defeat │        │ • Conversation Data │
│ • Unlock System  │        │ • Social Context    │
└──────────────────┘        └─────────────────────┘
```

---

## 🔄 DATA FLOW DIAGRAMS

### 1. Boss Fight Flow

```
Player Clicks Location
        │
        ▼
Is Location Locked?
        │
    ┌───┴───┐
    │       │
   YES     NO
    │       │
    ▼       ▼
Show Boss  Access
Challenge  Location
    │
    ▼
Player Accepts
    │
    ▼
Initialize Boss Fight
├─ Set health, timer
├─ Calculate player damage
└─ Calculate NPC DPS
    │
    ▼
Fight Loop (Every 1 sec)
├─ Decrease timer
├─ Apply NPC DPS
├─ Update UI
└─ Check win/lose
    │
    ├─ Win? → Unlock Location + Rewards
    └─ Lose? → Try Again
```

### 2. Conversation Context Flow

```
Player Sends Message
        │
        ▼
Analyze Message
├─ Extract keywords
├─ Check for names
└─ Detect question type
        │
        ▼
Build Context
├─ Get NPC memories
├─ Get recent posts (NPC's own)
├─ Get coworker posts (if relevant)
├─ Get relationship data (if name mentioned)
└─ Get conversation history
        │
        ▼
Generate AI Response
├─ Use enhanced prompt
├─ Include all context
└─ Apply style guidelines
        │
        ▼
Process Response
├─ Sanitize text
├─ Extract new memories
└─ Update relationship stats
        │
        ▼
Display to Player
```

### 3. Social Post + Chat Integration

```
NPC Creates Post
        │
        ▼
Generate Post Content
├─ Based on personality
├─ Based on recent events
└─ Include image (if applicable)
        │
        ▼
Store Post in Feed
        │
        ├─ Add to socialFeed array
        └─ Add to NPC memory: "I posted about X"
        │
        ▼
Post is Visible
        │
        ├─ Shows in Social Feed
        └─ Other NPCs "see" it (via context)
        │
        ▼
Player Chats with NPC
        │
        ▼
Build Chat Context
        │
        ├─ Include: "I recently posted: [content]"
        └─ Include: "[OtherNPC] posted: [content]"
        │
        ▼
NPC Can Reference Posts
├─ "Like I mentioned in my post..."
├─ "Did you see what Sarah posted?"
└─ "Yeah, I was at the beach yesterday"
```

### 4. Image Generation Flow (Improved)

```
Need Image for Post
        │
        ▼
Get Employee Appearance
├─ Check if exists
├─ Generate if needed (consistent)
└─ Store for future use
        │
        ▼
Analyze Caption
├─ Extract activity
├─ Extract location
├─ Extract mood
└─ Extract details
        │
        ▼
Build Detailed Prompt
├─ Include: Appearance
├─ Include: Scene details
├─ Include: Photography style
└─ Include: Specific elements
        │
        ▼
Generate Image
        │
        ▼
Validate (Optional)
├─ Check if matches caption
└─ Regenerate if mismatch
        │
        ▼
Display Image + Caption
```

---

## 🗄️ KEY DATA STRUCTURES

### Employee Object (Enhanced)

```javascript
{
  id: "emp_123",
  name: "Sarah Chen",
  position: "Marketing Manager",
  locationId: "marketing",
  
  // NEW: Consistent appearance
  appearance: {
    age: 28,
    gender: "female",
    ethnicity: "Asian",
    hair: "long black hair",
    build: "athletic",
    style: "professional casual",
    toString() { return "28 year old Asian female..." }
  },
  
  // Stats (existing)
  stats: {
    affection: 45,
    trust: 60,
    desire: 30,
    comfort: 55
  },
  
  // NEW: Relationships with other NPCs
  relationships: {
    "emp_456": {
      knows: true,
      relationship: "friend",
      relationshipLevel: 70,
      sharedEvents: [
        "Worked on project together",
        "Had lunch yesterday"
      ]
    }
  },
  
  // Enhanced memory
  memory: {
    entries: [
      { text: "Player gave me coffee", type: "event", importance: 1.5 },
      { text: "I posted about the beach trip", type: "event", importance: 2.0 }
    ],
    conversationPhase: "familiar",
    intimacyLevel: 45
  }
}
```

### Boss Fight Object

```javascript
{
  active: {
    locationId: "marketing",
    name: "The Marketing Director",
    maxHealth: 15000,
    currentHealth: 8500,
    timeLimit: 60,
    timeRemaining: 42,
    interval: <intervalId>
  },
  
  history: {
    "marketing": {
      defeated: true,
      time: 1696950000000,
      timeRemaining: 12
    }
  },
  
  playerUpgrades: {
    clickPower: { level: 3, cost: 8000 },
    autoClick: { level: 1, cost: 4000 },
    npcBonus: { level: 2, cost: 6000 }
  }
}
```

### Social Post Object (Enhanced)

```javascript
{
  id: "post_123",
  authorId: "emp_123",
  authorName: "Sarah Chen",
  content: "Just finished an amazing beach day! 🏖️",
  timestamp: 1696950000000,
  
  // Image data
  imageUrl: "https://...",
  imagePrompt: "28 year old Asian female at beach, sunset...",
  imageType: "selfie",
  
  // Engagement
  likes: 12,
  comments: [],
  
  // NEW: Context for AI
  category: "personal",
  mood: "happy",
  mentioned: [] // Other NPCs mentioned
}
```

---

## 🔌 INTEGRATION POINTS

### Where Systems Connect

```
┌─────────────┐
│   CLICKER   │
└──────┬──────┘
       │ Income affects...
       ▼
┌─────────────┐      Unlock via...      ┌─────────────┐
│   BOSS      │◄───────────────────────│  LOCATIONS  │
│   FIGHTS    │                         └─────────────┘
└──────┬──────┘
       │ Victory unlocks...
       ▼
┌─────────────┐
│  LOCATIONS  │
└──────┬──────┘
       │ Location has...
       ▼
┌─────────────┐      Work here...       ┌─────────────┐
│  PRODUCTS   │                         │  EMPLOYEES  │
└─────────────┘                         └──────┬──────┘
                                               │ Create...
                                               ▼
                                        ┌─────────────┐
                                        │   POSTS     │
                                        └──────┬──────┘
                                               │ Reference in...
                                               ▼
                                        ┌─────────────┐
                                        │    CHAT     │
                                        └─────────────┘
```

### Chat System Context Sources

```
                     ┌──────────────┐
                     │     CHAT     │
                     │   CONTEXT    │
                     └───────┬──────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  NPC Memory  │    │ Social Posts │    │Relationships │
│              │    │              │    │              │
│ • Events     │    │ • My posts   │    │ • Who knows  │
│ • Facts      │    │ • Their posts│    │ • Friend/foe │
│ • Prefs      │    │ • Comments   │    │ • Shared     │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## 🎮 GAME LOOP

### Main Update Loop

```javascript
// Every frame
function gameLoop() {
  // Update income
  let totalIncome = 0;
  for (let product of gameState.products) {
    totalIncome += calculateProductIncome(product);
  }
  gameState.cash += totalIncome / 60; // Per frame
  
  // Update UI
  updateCashDisplay();
  
  // Check auto-events
  if (shouldGenerateSocialPost()) {
    generateRandomSocialPost();
  }
  
  if (shouldTriggerCompanyEvent()) {
    generateCompanyEvent();
  }
  
  // Continue loop
  requestAnimationFrame(gameLoop);
}

// Every second
setInterval(() => {
  // Save game
  if (autosaveEnabled) {
    saveGame();
  }
  
  // Update timers
  updateTimers();
  
  // Boss fight tick
  if (gameState.bossFights.active) {
    updateBossFight();
  }
}, 1000);
```

---

## 🎯 KEY ALGORITHMS

### Economy Balancing Formula

```javascript
// Product income grows exponentially
income = baseIncome * (1.15 ^ level) * globalMultiplier

// Product cost grows exponentially
cost = baseCost * (1.5 ^ level)

// Each level:
// - Costs 1.5x more (manageable scaling)
// - Gives 1.15x more income (compound growth)
// Result: Satisfying progression curve
```

### Boss Difficulty Scaling

```javascript
// Boss health scales with unlock cost
bossHealth = locationUnlockCost * 2

// Boss should be beatable with:
// - ~50 clicks (player damage * 50 = ~50% health)
// - ~30 seconds of NPC DPS (NPC DPS * 30 = ~50% health)
// = Total time: ~45-60 seconds with active clicking
```

### NPC Relationship Scoring

```javascript
// Base relationship (0-100)
relationship = 30 (default)

// Modifiers:
+ 20 if same location
+ 15 if shared interests
+ 5 per shared event
+ 10 if player introduces them
- 10 if personality clash

// Categories:
0-25  = "dislikes"
26-50 = "neutral"
51-75 = "friend"
76-90 = "close friend"
91+   = "crush" or "best friend"
```

---

## 📈 PERFORMANCE CONSIDERATIONS

### Optimization Points

```
┌─────────────────────────────────────────┐
│         PERFORMANCE HOTSPOTS            │
├─────────────────────────────────────────┤
│                                         │
│  1. Image Generation (SLOW)            │
│     → Limit concurrent: 3-5 max        │
│     → Cache generated images           │
│     → Use lower resolution             │
│                                         │
│  2. Chat AI Generation (SLOW)          │
│     → Show "typing" indicator          │
│     → Limit context size               │
│     → Cache common responses           │
│                                         │
│  3. Many Employees (30+) (SLOW)        │
│     → Limit max employees              │
│     → Only update visible ones         │
│     → Throttle social post generation  │
│                                         │
│  4. Large Save Files (5MB+) (SLOW)     │
│     → Compress before saving           │
│     → Limit history retention          │
│     → Clean old memories               │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔐 STATE MANAGEMENT

### Save/Load Strategy

```
On Save:
1. Serialize gameState to JSON
2. Compress if > 1MB
3. Store in localStorage
4. Keep backup of previous save
5. Log save time

On Load:
1. Get from localStorage
2. Decompress if needed
3. Validate structure
4. Migrate old versions
5. Initialize new properties
6. Verify integrity
```

---

## 🎨 UI HIERARCHY

```
┌────────────────────────────────────────────┐
│            Top Bar (z-index: 1000)         │ ← Always visible
├────────────────────────────────────────────┤
│        News Ticker (z-index: 999)          │ ← Below top bar
├────────────────────────────────────────────┤
│         Tabs (z-index: 998)                │ ← Below ticker
├────────────────────────────────────────────┤
│         Main Content (z-index: 1)          │ ← Base layer
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │     Tab Content (varies)             │ │
│  └──────────────────────────────────────┘ │
└────────────────────────────────────────────┘

Modals (float above everything):
┌────────────────────────────────────────────┐
│     Chat Modal (z-index: 999999)           │ ← Highest for chat
└────────────────────────────────────────────┘
┌────────────────────────────────────────────┐
│   Boss Fight Modal (z-index: 10000)        │ ← Lower than chat
└────────────────────────────────────────────┘
```

---

## 🔍 DEBUGGING FLOW

```
Problem Occurs
      │
      ▼
Check Console for Errors
      │
   ┌──┴──┐
   │     │
  YES   NO
   │     │
   ▼     ▼
Read    Check
Error   Network
Msg     Tab
   │     │
   └──┬──┘
      ▼
Identify Problem Area
      │
   ┌──┴──┬──────┬──────┐
   │     │      │      │
   ▼     ▼      ▼      ▼
 Data   UI    Logic  API
 Issue  Bug   Error  Fail
   │     │      │      │
   └──┬──┴──┬───┴──┬───┘
      ▼     ▼      ▼
  Console.log    Isolate
  Variables      Problem
      │            │
      └─────┬──────┘
            ▼
       Find Solution
            │
         ┌──┴──┐
         │     │
      Found  Still
      It!   Stuck
         │     │
         ▼     ▼
        Fix   Check
       Code   Docs
         │     │
         └──┬──┘
            ▼
         Test Fix
            │
         ┌──┴──┐
         │     │
       Works  Broke
         │     │
         ▼     ▼
      Commit  Revert
       Code   & Try
              Again
```

---

## 🎯 TOMORROW'S FOCUS AREAS

### Priority 1: Core Gameplay
- Economy balance ⚡
- Boss fights ⚡
- New locations ⚡

### Priority 2: AI Improvements
- Conversation context ⭐
- NPC relationships ⭐

### Priority 3: Polish
- Image quality ✨
- UI improvements ✨
- Bug fixes ✨

---

This architecture will make your game **robust**, **scalable**, and **maintainable**! 🚀
