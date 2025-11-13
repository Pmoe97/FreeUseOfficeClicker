# Save Manager Implementation Plan for FUOC

## Overview
Upgrade the current save system from individual buttons to a comprehensive modal-based save manager interface.

## Current State Analysis

### Existing Functions:
- `saveGame(showToast = true)` - Saves to kv-plugin
- `loadGame()` - Loads from kv-plugin  
- `exportSave()` - Exports to JSON file
- `importSave()` - Imports from JSON file
- `setupAutosave()` - 5-second autosave interval
- Uses `kv.gameSave.set("gameState", gameState)` for storage

### Current UI (Settings Panel):
```
Data Management section with buttons:
- 💾 Save Now
- 📂 Load Save  
- 📤 Export to File
- 📥 Import from File
- 🗑️ Reset Game
```

## New System Architecture

### Key Changes:
1. **Replace** all save/load buttons with single **"💾 Save/Load Manager"** button
2. **Add** modal interface with save slot management
3. **Keep** autosave functionality exactly as is
4. **Keep** reset game button separate (dangerous operation)
5. **Add** keyboard shortcuts (F5 = Quick Save, F9 = Quick Load)

### Storage Structure:
Instead of single `gameState` key, use:
- `fuoc_save_autosave` - Automatic saves (overwritten)
- `fuoc_save_quick_[timestamp]` - Quick saves (F5)
- `fuoc_save_manual_[timestamp]` - Manual saves (user-created)
- `fuoc_save_[custom_name]` - User-named saves

### Data Format:
```json
{
  "version": "250116200000",
  "meta": {
    "saveDate": "2025-11-12T10:30:00.000Z",
    "saveName": "manual_1731408600000",
    "saveType": "manual",  // "manual", "auto", "quick"
    "playTime": 3600,
    "gameDay": 5
  },
  "gameState": { /* existing gameState object */ }
}
```

## Implementation Steps

### Phase 1: Core Save/Load Functions (Adapt existing)
- [x] Analyze current saveGame() and loadGame()
- [ ] Create `saveGameToSlot(slotName, saveType)` wrapper
- [ ] Create `loadGameFromSlot(slotName)` wrapper
- [ ] Create `listAllSaves()` - scan kv-plugin for all save keys
- [ ] Create `deleteSaveSlot(slotName)` function
- [ ] Create `renameSaveSlot(oldName, newName)` function

### Phase 2: Save Manager UI (Build modal)
- [ ] Create modal HTML structure
- [ ] Add CSS styling (match FUOC theme #16213e, #00d4ff)
- [ ] Create SaveManagerClass for UI logic
- [ ] Implement save list rendering
- [ ] Add inline name editing
- [ ] Add sort/filter functionality

### Phase 3: User Actions
- [ ] Quick Save (F5) - creates timestamped quick save
- [ ] Quick Load (F9) - loads most recent quick save
- [ ] Continue - loads most recent save (any type)
- [ ] Create New Save - creates manual save with timestamp
- [ ] Load Save - loads selected save
- [ ] Rename Save - inline editing
- [ ] Delete Save - with confirmation
- [ ] Export Save - download individual slot
- [ ] Import Save - upload and validate

### Phase 4: UI Integration
- [ ] Replace save/load buttons in settings with single button
- [ ] Add "Save/Load Manager" button
- [ ] Connect keyboard shortcuts
- [ ] Update autosave to use new structure
- [ ] Add notifications for operations

### Phase 5: Testing & Polish
- [ ] Test save/load across slots
- [ ] Test autosave integration
- [ ] Test import/export
- [ ] Test keyboard shortcuts
- [ ] Verify backward compatibility with existing saves
- [ ] Add error handling for corrupted saves

## Detailed Function Specifications

### saveGameToSlot(slotName, saveType = 'manual')
```javascript
async function saveGameToSlot(slotName, saveType = 'manual') {
  const saveData = {
    version: '250116200000',
    meta: {
      saveDate: new Date().toISOString(),
      saveName: slotName,
      saveType: saveType,
      playTime: gameState.totalPlayTime || 0,
      gameDay: gameState.time?.day || 0,
      money: gameState.money,
      employees: gameState.employees.length
    },
    gameState: gameState
  };
  
  await kv.gameSave.set(`fuoc_save_${slotName}`, saveData);
  return saveData;
}
```

### listAllSaves()
```javascript
async function listAllSaves() {
  const saves = [];
  const allKeys = await kv.gameSave.keys();
  
  for (const key of allKeys) {
    if (key.startsWith('fuoc_save_')) {
      const slotName = key.replace('fuoc_save_', '');
      const data = await kv.gameSave.get(key);
      
      saves.push({
        slotName,
        ...data.meta,
        hasGameState: !!data.gameState
      });
    }
  }
  
  return saves.sort((a, b) => 
    new Date(b.saveDate) - new Date(a.saveDate)
  );
}
```

### Auto-Migration Strategy
For existing saves stored as plain `"gameState"`:
1. On first load, detect old format
2. Create `fuoc_save_migrated_legacy` with old save
3. Continue using new format going forward
4. Show user notification about migration

## UI Mockup Structure

```
┌─────────────────────────────────────────┐
│ 💾 Save Manager          [F5] [F9] [×] │
├─────────────────────────────────────────┤
│ [▶ Continue] [⏺ Quick Save] [⏮ Quick  │
│ Load] [📤 Export] [📥 Import]         │
├─────────────────────────────────────────┤
│ 🔍 Search: [______________]             │
│ [ Manual Saves ] [ Autosaves ]          │
├─────────────────────────────────────────┤
│ Name ▾  Day  Saved At  $  Actions      │
├─────────────────────────────────────────┤
│ My Save   5   Nov 12  $1M  [Load][Del] │
│ Before    3   Nov 11  $500 [Load][Del] │
│ autosave  2   Nov 10  $200 [Load]      │
├─────────────────────────────────────────┤
│ [+ Create New Save]                     │
└─────────────────────────────────────────┘
```

## Backward Compatibility

### Migration Path:
1. Check if `gameState` key exists (old format)
2. If yes:
   - Load it as legacy save
   - Save to `fuoc_save_migrated_[timestamp]`
   - Show notification: "Save migrated to new system"
3. Remove old `gameState` key
4. Going forward, use new slot-based system

## Benefits Over Current System
- ✅ Multiple save slots (not just one save)
- ✅ Quick save/load with keyboard
- ✅ Named saves for different playthroughs
- ✅ Can't accidentally overwrite important saves
- ✅ Better organization (manual vs auto)
- ✅ Individual save export/import
- ✅ Visual feedback (timestamps, money, day)
- ✅ Maintains existing autosave functionality
- ✅ No breaking changes to game code

## Risk Mitigation
- Keep backup of player's save before migration
- Validate save data structure before applying
- Add version checking for future updates
- Provide manual export before any risky operations
