# Save System Documentation
## Hedonism Island - Complete Save/Load Implementation

**Version:** 4.0.0  
**Last Updated:** November 12, 2025  
**Architecture:** LocalStorage-based with JSON serialization

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [UI Components](#ui-components)
4. [Data Structure](#data-structure)
5. [Core Features](#core-features)
6. [Implementation Details](#implementation-details)
7. [HTML Structure](#html-structure)
8. [CSS Styling](#css-styling)
9. [JavaScript API](#javascript-api)
10. [Porting Guide](#porting-guide)

---

## Overview

The save system is a comprehensive, modal-based UI that provides:
- **Multiple save slots** (manual + autosave)
- **In-place editing** of save names (no popups)
- **Sorting & filtering** capabilities
- **Import/Export** to JSON files
- **Quick save/load** functionality
- **Keyboard shortcuts** support
- **Responsive design** for mobile/desktop

### Key Design Principles
- **No dialog boxes** - All interactions happen inline
- **Visual clarity** - Color-coded save types (manual, auto, quick)
- **Data safety** - Confirmation for destructive actions
- **Performance** - Efficient localStorage usage
- **Portability** - Clean separation of concerns

---

## Architecture

### Component Hierarchy
```
SaveManager (UI Controller)
  ↓
GameState (Data Manager)
  ↓
LocalStorage (Persistence Layer)
```

### File Structure
```
src/
  ui/
    saveManager.js        # UI Controller class
  styles/
    saveManager.css       # Complete styling
  modules/
    gameState.js          # Save/load logic + data serialization
```

---

## UI Components

### Main Modal
- **Full-screen overlay** with blur backdrop
- **Centered container** (max-width: 1200px)
- **Tabbed interface** (Manual Saves / Autosaves)
- **Search bar** for filtering
- **Action toolbar** at top

### Table Structure
- **Sortable columns** (Name, Day, Date, Playtime)
- **Inline name editing** (click to edit)
- **Row actions** (Load, Export, Delete)
- **Selection highlight**
- **Create new save** row

### Visual Elements
- **Color-coded tags** for save types
- **Gradient buttons** with hover effects
- **Empty state** messaging
- **Toast notifications** for feedback
- **Keyboard shortcut hints**

---

## Data Structure

### Save File Format (JSON)
```json
{
  "version": "4.0.0",
  "meta": {
    "saveDate": "2025-11-12T10:30:00.000Z",
    "saveName": "save_1234567890",
    "playTime": 3600
  },
  "player": {
    "name": "Tori",
    "position": { "q": -15, "r": 18 },
    "stats": {
      "health": { "current": 100, "max": 100 },
      "hunger": { "current": 80, "max": 100 },
      "thirst": { "current": 90, "max": 100 },
      "energy": { "current": 100, "max": 100 }
    },
    "inventory": {
      "slots": [],
      "maxSlots": 12
    },
    "skills": {}
  },
  "resourceManager": {
    "nodes": []
  },
  "npcManager": [],
  "travelSystem": {
    "currentPosition": { "q": -15, "r": 18 }
  },
  "state": {
    "island": { "seed": "abc123" },
    "time": { "day": 1, "hour": 8 },
    "flags": {},
    "characters": []
  }
}
```

### LocalStorage Keys
- **Format:** `hedonism_save_${slotName}`
- **Examples:**
  - `hedonism_save_autosave` - Automatic saves
  - `hedonism_save_quick_1234567890` - Quick saves
  - `hedonism_save_save_1234567890` - Manual saves
  - `hedonism_save_My_Adventure` - User-named saves

---

## Core Features

### 1. Save Operations

#### Quick Save (F5)
```javascript
// Creates timestamped quick save
const slotName = `quick_${Date.now()}`;
gameState.save(slotName);
```

#### Manual Save
```javascript
// User-triggered save with custom name
const slotName = `save_${Date.now()}`;
gameState.save(slotName);
```

#### Autosave
```javascript
// Automatic background saves
gameState.save('autosave');
```

### 2. Load Operations

#### Quick Load (F9)
```javascript
// Loads most recent quick save
const quickSaves = saves.filter(s => s.slotName.startsWith('quick_'));
const latest = quickSaves.sort((a, b) => 
  new Date(b.saveDate) - new Date(a.saveDate)
)[0];
gameState.load(latest.slotName);
```

#### Manual Load
```javascript
// Loads specific save by slot name
gameState.load(slotName);
```

#### Continue
```javascript
// Loads most recent save (any type)
const allSaves = [...manual, ...auto];
const latest = allSaves.sort((a, b) => 
  new Date(b.saveDate) - new Date(a.saveDate)
)[0];
gameState.load(latest.slotName);
```

### 3. Management Operations

#### Rename Save
```javascript
// Load old save, save with new name, delete old
gameState.load(oldSlot);
gameState.save(newName);
gameState.deleteSave(oldSlot);
```

#### Delete Save
```javascript
gameState.deleteSave(slotName);
```

#### Export Save
```javascript
const savedData = localStorage.getItem(`hedonism_save_${slotName}`);
const blob = new Blob([savedData], { type: 'application/json' });
const url = URL.createObjectURL(blob);
// Trigger download...
```

#### Import Save
```javascript
const reader = new FileReader();
reader.onload = (e) => {
  const content = e.target.result;
  gameState.importSave(content);
};
reader.readAsText(file);
```

### 4. Filtering & Sorting

#### Filter by Search Query
```javascript
filtered = saves.filter(s => {
  const searchStr = `${s.slotName} ${playerName}`.toLowerCase();
  return searchStr.includes(query);
});
```

#### Sort by Column
```javascript
filtered.sort((a, b) => {
  let aVal, bVal;
  switch (sortKey) {
    case 'name': aVal = a.slotName.toLowerCase(); break;
    case 'day': aVal = a.day || 0; break;
    case 'savedAt': aVal = new Date(a.saveDate).getTime(); break;
    case 'playTime': aVal = a.playTime || 0; break;
  }
  const dir = sortDir === 'asc' ? 1 : -1;
  return aVal > bVal ? dir : aVal < bVal ? -dir : 0;
});
```

---

## Implementation Details

### GameState Class Methods

#### Save Method
```javascript
save(slotName = 'autosave') {
  const saveData = {
    version: this.version,
    meta: { saveDate: new Date().toISOString(), saveName: slotName },
    player: this.player ? this.player.toJSON() : null,
    resourceManager: this.resourceManager ? this.resourceManager.toJSON() : null,
    npcManager: this.npcManager ? this.npcManager.saveNPCs() : [],
    travelSystem: window.game?.travelSystem ? window.game.travelSystem.toJSON() : null,
    state: { ...this.state, meta: undefined }
  };
  
  localStorage.setItem(`hedonism_save_${slotName}`, JSON.stringify(saveData));
  this.emit('gameSaved', { slotName, saveData });
  return true;
}
```

#### Load Method
```javascript
load(slotName = 'autosave') {
  const savedData = localStorage.getItem(`hedonism_save_${slotName}`);
  if (!savedData) return false;
  
  const data = JSON.parse(savedData);
  
  // Handle version compatibility
  if (!data.version || data.version === '1.0.0') {
    this.migrateLegacySave(data);
  } else {
    this.loadState(data);
  }
  
  this.emit('gameLoaded', { slotName, data });
  return true;
}
```

#### List Saves Method
```javascript
listSaves() {
  const saves = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('hedonism_save_')) {
      const slotName = key.replace('hedonism_save_', '');
      const data = JSON.parse(localStorage.getItem(key));
      
      saves.push({
        slotName,
        version: data.version || '1.0.0',
        saveDate: data.meta?.saveDate || 'Unknown',
        playerName: data.player?.name || 'Survivor',
        day: data.state?.time?.day || 0,
        playTime: data.meta?.playTime || 0,
        health: data.player?.stats?.health?.current || 100
      });
    }
  }
  return saves.sort((a, b) => new Date(b.saveDate) - new Date(a.saveDate));
}
```

### SaveManager Class Structure

```javascript
class SaveManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.view = {
      tab: 'manual',        // 'manual' or 'auto'
      sortKey: 'savedAt',   // Column to sort by
      sortDir: 'desc',      // 'asc' or 'desc'
      query: '',            // Search filter
      selectedId: null      // Currently selected save
    };
    this.modal = null;
    this.editingNameId = null;
  }

  show() { /* Create and display modal */ }
  hide() { /* Remove modal from DOM */ }
  render() { /* Update save list */ }
  
  // Event handlers
  handleQuickSave() { /* F5 quick save */ }
  handleQuickLoad() { /* F9 quick load */ }
  handleContinue() { /* Load most recent */ }
  handleLoad(slotName) { /* Load specific save */ }
  handleDelete(slotName) { /* Delete save */ }
  handleRename(event) { /* Rename save inline */ }
  handleExport() { /* Export to JSON */ }
  handleImport(event) { /* Import from JSON */ }
}
```

---

## HTML Structure

### Complete Modal HTML
```html
<div class="save-manager-modal">
  <div class="save-manager-container">
    
    <!-- Header -->
    <div class="save-manager-header">
      <div class="save-manager-title">
        <div class="save-manager-logo">💾</div>
        <div>
          <h2>Save Manager</h2>
          <div class="save-manager-subtitle">Continue • Save/Load • Import/Export</div>
        </div>
      </div>
      <button class="save-manager-close" id="sm-close">✕</button>
    </div>

    <!-- Actions -->
    <div class="save-manager-actions">
      <button class="sm-btn accent" id="sm-continue">▶ Continue</button>
      <button class="sm-btn success" id="sm-quick-save">⏺ Quick Save</button>
      <button class="sm-btn primary" id="sm-quick-load">⏮ Quick Load</button>
      <button class="sm-btn" id="sm-export">⬇ Export</button>
      <button class="sm-btn" id="sm-import">⬆ Import</button>
      <input type="file" id="sm-import-file" accept=".json" style="display: none;">
    </div>

    <!-- Toolbar -->
    <div class="save-manager-toolbar">
      <div class="save-tab-group">
        <button class="save-tab active" id="sm-tab-manual">Manual Saves</button>
        <button class="save-tab" id="sm-tab-auto">Autosaves</button>
      </div>
      <div class="save-search-box">
        <span class="save-search-icon">🔍</span>
        <input type="text" id="sm-search" placeholder="Search by name, location, character..." />
      </div>
    </div>

    <!-- Save List -->
    <div class="save-list-container">
      <table class="save-table">
        <thead>
          <tr>
            <th class="sortable" data-sort="name">Name <span class="sort-arrow">▾</span></th>
            <th class="sortable" data-sort="day">Day/Time</th>
            <th class="sortable" data-sort="savedAt">Saved At</th>
            <th>Character</th>
            <th>Location</th>
            <th class="sortable" data-sort="playTime">Playtime</th>
            <th style="width: 200px;">Actions</th>
          </tr>
        </thead>
        <tbody id="sm-tbody">
          <!-- Row Example -->
          <tr data-slot="save_1234567890">
            <td>
              <div class="save-name-cell">
                <input 
                  type="text" 
                  class="save-name-input" 
                  value="My Adventure" 
                  data-slot="save_1234567890"
                  data-original="save_1234567890"
                />
                <span class="save-tag">manual</span>
              </div>
            </td>
            <td class="meta">Day 5</td>
            <td class="meta">Nov 12, 2025, 10:30 AM</td>
            <td>Tori</td>
            <td>Exploring</td>
            <td class="meta">2h 15m</td>
            <td>
              <div class="save-row-actions">
                <button class="save-action-btn load" data-action="load" data-slot="save_1234567890">Load</button>
                <button class="save-action-btn export" data-action="export" data-slot="save_1234567890">Export</button>
                <button class="save-action-btn delete" data-action="delete" data-slot="save_1234567890">✕</button>
              </div>
            </td>
          </tr>
          
          <!-- Create New Row (Manual Tab Only) -->
          <tr class="create-row" id="sm-create-row">
            <td colspan="7">
              <span class="create-save-link">
                <span>+</span>
                <span>Create New Save</span>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div class="save-manager-footer">
      <div class="save-footer-hint">
        <span>Tip:</span>
        <span><span class="kbd">F5</span> Quick Save</span>
        <span><span class="kbd">F9</span> Quick Load</span>
        <span><span class="kbd">Esc</span> Close</span>
      </div>
      <div class="save-count" id="sm-count">
        5 manual • 3 autosaves • showing 8
      </div>
    </div>
    
  </div>
</div>
```

---

## CSS Styling

### Key Style Components

#### Modal & Container
```css
.save-manager-modal {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-manager-container {
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  background: rgba(11, 15, 20, 0.95);
  border: 1px solid #1c2738;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
}
```

#### Button Styles
```css
.sm-btn {
  padding: 10px 16px;
  border: 1px solid #1c2738;
  background: linear-gradient(180deg, #142035, #0e1623);
  color: #e8f0f7;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.sm-btn.accent {
  background: linear-gradient(180deg, #0bbbd1, #0aa1b5);
  color: #001318;
  font-weight: 700;
}

.sm-btn.success {
  background: linear-gradient(180deg, #20d2a0, #10b37f);
  color: #05231b;
  font-weight: 700;
}
```

#### Table Styles
```css
.save-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.save-table thead {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #0e1522;
}

.save-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.save-table tbody tr:hover {
  background: rgba(61, 214, 237, 0.05);
}

.save-table tbody tr.selected {
  outline: 2px solid #3dd6ed;
  background: rgba(61, 214, 237, 0.08);
}
```

#### Tag Styles
```css
.save-tag {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  border: 1px solid #1c2738;
  background: #101a2a;
  color: #bcd2e6;
}

.save-tag.auto {
  background: #0e1c2e;
  border-color: #1f2b46;
  color: #b9c9ff;
}

.save-tag.quick {
  background: #0e2e1c;
  border-color: #1f462b;
  color: #b9ffc9;
}
```

---

## JavaScript API

### Public Methods

#### Initialize Save Manager
```javascript
import { SaveManager } from './ui/saveManager.js';

const saveManager = new SaveManager(gameState);
```

#### Show Save Manager
```javascript
saveManager.show();
```

#### Hide Save Manager
```javascript
saveManager.hide();
```

### GameState Integration

#### Setup Event Listeners
```javascript
gameState.on('gameSaved', ({ slotName }) => {
  console.log(`Saved to ${slotName}`);
});

gameState.on('gameLoaded', ({ slotName, data }) => {
  console.log(`Loaded from ${slotName}`);
});

gameState.on('saveDeleted', ({ slotName }) => {
  console.log(`Deleted ${slotName}`);
});
```

#### Keyboard Shortcuts (Optional)
```javascript
document.addEventListener('keydown', (e) => {
  if (e.key === 'F5') {
    e.preventDefault();
    gameState.save(`quick_${Date.now()}`);
  }
  if (e.key === 'F9') {
    e.preventDefault();
    const saves = gameState.listSaves();
    const quickSaves = saves.filter(s => s.slotName.startsWith('quick_'));
    if (quickSaves.length > 0) {
      gameState.load(quickSaves[0].slotName);
    }
  }
});
```

---

## Porting Guide

### Step 1: Adapt Data Structure

Modify the save/load methods to match your game's data:

```javascript
// Example: Your game might have different properties
const saveData = {
  version: "1.0.0",
  timestamp: Date.now(),
  playerData: {
    name: player.name,
    level: player.level,
    position: player.position,
    inventory: player.inventory
  },
  worldState: {
    seed: world.seed,
    entities: world.entities
  },
  gameProgress: {
    questsCompleted: quests.completed,
    achievements: achievements.unlocked
  }
};
```

### Step 2: Copy HTML & CSS

1. Copy the entire HTML structure from `buildHTML()` method
2. Copy the complete CSS from `saveManager.css`
3. Adjust colors/fonts to match your game's theme

### Step 3: Implement Core Methods

Required methods for your GameState class:

```javascript
class GameState {
  save(slotName) {
    // Serialize game state to JSON
    // Store in localStorage with key: `yourgame_save_${slotName}`
  }
  
  load(slotName) {
    // Retrieve from localStorage
    // Deserialize and restore game state
  }
  
  listSaves() {
    // Scan localStorage for save keys
    // Return array of save metadata
  }
  
  deleteSave(slotName) {
    // Remove from localStorage
  }
  
  importSave(jsonString) {
    // Parse JSON and call load()
  }
}
```

### Step 4: Customize UI

Modify these sections to fit your game:

```javascript
// Table columns - add/remove as needed
<th class="sortable" data-sort="name">Name</th>
<th class="sortable" data-sort="level">Level</th>  // Your custom column
<th class="sortable" data-sort="location">Location</th>

// Row data - show your game's info
<td>${save.playerLevel}</td>
<td>${save.currentLocation}</td>
```

### Step 5: Event Integration

Connect to your game's event system:

```javascript
// When player completes action that should trigger autosave:
gameState.save('autosave');

// When entering save manager:
saveManager.show();

// When loading a save:
gameState.load(slotName);
// Then refresh your game UI:
updateGameView();
renderPlayer();
```

---

## Best Practices

### 1. Data Validation
```javascript
// Validate before loading
load(slotName) {
  const data = JSON.parse(localStorage.getItem(key));
  
  // Check version
  if (!this.isCompatibleVersion(data.version)) {
    return this.migrateSave(data);
  }
  
  // Validate required fields
  if (!data.player || !data.state) {
    throw new Error('Invalid save file');
  }
  
  this.loadState(data);
}
```

### 2. Error Handling
```javascript
try {
  gameState.save(slotName);
  showNotification('Game saved!', 'success');
} catch (e) {
  console.error('Save failed:', e);
  showNotification('Failed to save: ' + e.message, 'error');
}
```

### 3. Performance
```javascript
// Debounce autosaves
let autosaveTimeout;
function scheduleAutosave() {
  clearTimeout(autosaveTimeout);
  autosaveTimeout = setTimeout(() => {
    gameState.save('autosave');
  }, 5000); // Save 5 seconds after last action
}
```

### 4. Storage Limits
```javascript
// Check localStorage quota
function checkStorageQuota() {
  try {
    const test = 'x'.repeat(1024 * 1024); // 1MB test
    localStorage.setItem('__test__', test);
    localStorage.removeItem('__test__');
    return true;
  } catch (e) {
    console.warn('localStorage quota exceeded');
    return false;
  }
}
```

### 5. Save Corruption Protection
```javascript
// Keep backup of last good save
save(slotName) {
  const newData = this.serializeState();
  
  // Backup current save (if exists)
  const existing = localStorage.getItem(`game_save_${slotName}`);
  if (existing) {
    localStorage.setItem(`game_save_${slotName}_backup`, existing);
  }
  
  // Write new save
  localStorage.setItem(`game_save_${slotName}`, JSON.stringify(newData));
}

load(slotName) {
  try {
    // Try main save
    const data = localStorage.getItem(`game_save_${slotName}`);
    return this.loadState(JSON.parse(data));
  } catch (e) {
    // Try backup if main save corrupted
    const backup = localStorage.getItem(`game_save_${slotName}_backup`);
    if (backup) {
      console.warn('Main save corrupted, loading backup');
      return this.loadState(JSON.parse(backup));
    }
    throw e;
  }
}
```

---

## Advanced Features

### Cloud Save Integration
```javascript
class CloudSaveManager extends SaveManager {
  async uploadSave(slotName) {
    const saveData = localStorage.getItem(`game_save_${slotName}`);
    
    const response = await fetch('https://api.yourgame.com/saves', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        slotName,
        data: saveData,
        timestamp: Date.now()
      })
    });
    
    return response.json();
  }
  
  async downloadSave(slotName) {
    const response = await fetch(`https://api.yourgame.com/saves/${slotName}`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    const { data } = await response.json();
    localStorage.setItem(`game_save_${slotName}`, data);
    return true;
  }
}
```

### Save Screenshots
```javascript
function captureSaveScreenshot() {
  const canvas = document.querySelector('#game-canvas');
  return canvas.toDataURL('image/jpeg', 0.7);
}

save(slotName) {
  const saveData = {
    ...this.serializeState(),
    screenshot: captureSaveScreenshot()
  };
  // Save as usual...
}

// Display in UI
buildRowHTML(save) {
  return `
    <tr>
      <td>
        <img src="${save.screenshot}" class="save-thumbnail" />
        ${save.slotName}
      </td>
      ...
    </tr>
  `;
}
```

### Compression
```javascript
// Using LZ-string library for compression
import LZString from 'lz-string';

save(slotName) {
  const saveData = this.serializeState();
  const jsonString = JSON.stringify(saveData);
  const compressed = LZString.compressToUTF16(jsonString);
  
  localStorage.setItem(`game_save_${slotName}`, compressed);
  console.log(`Saved ${jsonString.length} bytes as ${compressed.length} bytes`);
}

load(slotName) {
  const compressed = localStorage.getItem(`game_save_${slotName}`);
  const jsonString = LZString.decompressFromUTF16(compressed);
  const data = JSON.parse(jsonString);
  
  this.loadState(data);
}
```

---

## Troubleshooting

### Issue: "QuotaExceededError"
**Solution:** Implement save slot limits or compression
```javascript
const MAX_SAVES = 20;

save(slotName) {
  const saves = this.listSaves();
  if (saves.length >= MAX_SAVES) {
    // Delete oldest save (excluding autosave)
    const oldest = saves
      .filter(s => s.slotName !== 'autosave')
      .sort((a, b) => new Date(a.saveDate) - new Date(b.saveDate))[0];
    this.deleteSave(oldest.slotName);
  }
  // Continue with save...
}
```

### Issue: Save Corruption
**Solution:** Add validation and checksums
```javascript
function calculateChecksum(data) {
  // Simple checksum (use crypto library for production)
  return JSON.stringify(data).split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
}

save(slotName) {
  const data = this.serializeState();
  const saveObject = {
    checksum: calculateChecksum(data),
    data: data
  };
  localStorage.setItem(key, JSON.stringify(saveObject));
}

load(slotName) {
  const saveObject = JSON.parse(localStorage.getItem(key));
  
  if (calculateChecksum(saveObject.data) !== saveObject.checksum) {
    throw new Error('Save file corrupted');
  }
  
  this.loadState(saveObject.data);
}
```

### Issue: Cross-Browser Compatibility
**Solution:** Feature detection
```javascript
function isLocalStorageAvailable() {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

class SaveManager {
  constructor(gameState) {
    if (!isLocalStorageAvailable()) {
      throw new Error('localStorage not available');
    }
    // Continue initialization...
  }
}
```

---

## License & Credits

This save system implementation is part of **Hedonism Island** game project.

**Features:**
- ✅ Complete UI/UX implementation
- ✅ LocalStorage persistence
- ✅ Import/Export functionality
- ✅ Version migration support
- ✅ Responsive design
- ✅ Keyboard shortcuts
- ✅ No external dependencies (vanilla JS)

**Tech Stack:**
- Vanilla JavaScript (ES6+)
- CSS3 (Flexbox, Grid, Animations)
- HTML5 LocalStorage API
- File API (for import/export)

---

## Contact & Support

For questions about porting this system to your game, refer to the implementation in:
- `src/ui/saveManager.js`
- `src/styles/saveManager.css`
- `src/modules/gameState.js`

**Key Points for Porting:**
1. The HTML/CSS is **fully portable** - just copy it
2. The JavaScript requires **minimal adaptation** - mainly the data structure
3. All UI interactions are **self-contained** in SaveManager class
4. GameState class handles all **persistence logic**

Good luck with your implementation! 🎮💾
