# Custom Comment Image Prompt Generation - Implementation Plan

## 🎯 Objective
Upgrade comment image generation to use extended conversation context and AI-powered prompt building, matching the sophistication of chat/meeting image requests.

---

## 📋 Current State vs. Desired State

### Current Flow (Template-Based)
```
Comment: "Here's a selfie! 😊"
  ↓
detectAndGenerateCommentImage()
  ↓
Regex pattern matching:
  - /\bselfie\b/ → Generic selfie template
  - No conversation context
  - No relationship awareness
  ↓
Simple prompt: "Selfie of [NPC name], [physical desc]"
  ↓
generateImage()
```

### Desired Flow (AI-Powered + Context-Aware)
```
Comment: "Here's that pic you asked for 😏"
  ↓
detectAndGenerateCommentImage()
  ↓
buildCommentImagePrompt():
  - Pull recent conversation (last 2 hours)
  - Check relationship stats (intimacy, affection, desire)
  - Analyze post content
  - Consider NPC personality
  - Use AI to interpret context
  ↓
AI generates: "Explicit nude selfie of [NPC], seductive pose,
               bedroom setting, responding to boss's request,
               [full physical description], intimate lighting..."
  ↓
generateImage()
```

---

## 🔧 Implementation Steps

### Step 1: Create `buildCommentImagePrompt()` Function

**Location**: Add after `buildImagePrompt()` function (~line 35400)

**Function Signature**:
```javascript
async function buildCommentImagePrompt(npc, post, commentText)
```

**Key Features**:
1. Use `getPhysicalDescriptionForPrompt(npc)` for consistency
2. Check for chat history with this NPC
3. Pull post content and caption
4. Analyze comment text for claimed image type
5. Use AI to build contextual prompt
6. Fall back to template system if AI fails

**Pseudocode**:
```javascript
async function buildCommentImagePrompt(npc, post, commentText) {
  // 1. Get physical description
  const physicalDesc = getPhysicalDescriptionForPrompt(npc);
  
  // 2. Get conversation context (if exists)
  const chatHistory = gameState.chatHistory[npc.id] || [];
  const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
  const recentChats = chatHistory
    .filter(msg => (msg.timestamp || 0) > twoHoursAgo)
    .slice(-5);
  
  let conversationContext = '';
  if (recentChats.length >= 2) {
    const messages = recentChats.map(m => `${m.sender}: "${m.content}"`).join('\n');
    conversationContext = `\n\nRECENT CONVERSATION:\n${messages}\n(The image may be related to this conversation)`;
  }
  
  // 3. Get relationship context
  const affection = npc.stats?.affection || 0;
  const desire = npc.stats?.desire || 0;
  const intimacyLevel = npc.memory?.intimacyLevel || 0;
  const isFlirty = npc.personality?.flirty > 65;
  
  let relationshipContext = '';
  if (intimacyLevel > 60 || desire > 70) {
    relationshipContext = '\n(High intimacy - comfortable with explicit content)';
  } else if (intimacyLevel > 30) {
    relationshipContext = '\n(Moderate intimacy - open to suggestive content)';
  }
  
  // 4. Build AI prompt
  const aiPromptText = `You are generating a detailed image prompt for a social media comment image.

NPC DETAILS:
- Name: ${npc.name}
- Position: ${npc.position || 'Employee'}
- Appearance: ${physicalDesc}
- Personality: ${isFlirty ? 'Flirty and confident' : 'Professional'}
${relationshipContext}

POST CONTEXT:
Original Post: "${post.content || post.caption}"
NPC's Comment: "${commentText}"
${conversationContext}

TASK:
The NPC claims to be uploading/sharing an image in their comment. Analyze:
1. What does the POST discuss? (Is it asking for nudes, selfies, cat pics, etc.?)
2. What does the COMMENT claim to show? ("Here's mine", "Posted!", "Proof", etc.)
3. What TYPE of image is this? (Casual selfie, work photo, nude, explicit, pet, food, etc.)
4. Does conversation history suggest this is responding to a request?
5. Should this be intimate/explicit based on context?

Generate a DETAILED, TECHNICAL image prompt that:
- Exactly matches what they're claiming to share
- Includes specific pose, expression, clothing (or lack thereof)
- Specifies setting, lighting, camera angle
- For explicit content: uses anatomical descriptions
- Considers their personality and relationship
- References conversation if relevant

CRITICAL RULES:
- If post asks for nudes → explicit nude description
- If comment is flirty on explicit post → match that energy
- If casual context → appropriate casual image
- "Here's proof" → match what needs proving
- "Cat/pussy" → could be misunderstood if NPC is flirty
- Be HIGHLY specific about all visual elements

Write ONLY the image prompt - no explanations:`;

  try {
    // 5. Generate AI prompt
    let generatedPrompt = await generateText(aiPromptText, {
      temperature: 0.85,
      max_tokens: 200,
      stopSequences: ['\n\n\n', 'Note:', 'Remember:', 'Example:', 'IMAGE PROMPT:', '---']
    });
    
    // 6. Clean up response
    generatedPrompt = generatedPrompt.trim();
    // Remove any meta-commentary
    generatedPrompt = generatedPrompt.replace(/^\*\*[^*]+\*\*\s*/g, '');
    generatedPrompt = generatedPrompt.split(/\n\s*\n/)[0]; // Take first paragraph only
    generatedPrompt = generatedPrompt.split(/\(Note:/i)[0]; // Remove notes
    
    // 7. Validate
    if (generatedPrompt.length > 30 && !generatedPrompt.includes('I cannot')) {
      console.log(`[Comment Image] AI prompt generated: ${generatedPrompt.substring(0, 80)}...`);
      return generatedPrompt;
    } else {
      console.warn('[Comment Image] AI prompt too short or refused, using fallback');
    }
  } catch (error) {
    console.error('[Comment Image] AI generation failed:', error);
  }
  
  // 8. Fallback to template system
  return buildTemplateCommentImagePrompt(npc, post, commentText);
}
```

### Step 2: Extract Template Logic into Helper Function

**Function**: `buildTemplateCommentImagePrompt(npc, post, commentText)`

This will contain all the existing regex pattern matching from the current `detectAndGenerateCommentImage()` function. It serves as a fallback when AI fails.

**Pseudocode**:
```javascript
function buildTemplateCommentImagePrompt(npc, post, commentText) {
  const postContent = post.content || post.caption || '';
  const physicalDesc = npc.physicalDescription || 'attractive person';
  
  // All the existing regex checks:
  // - mentionsPussy, mentionsCats, mentionsDogs
  // - mentionsBush, contextSuggestsIntimate
  // - requestsNude, requestsSelfie, requestsSexy
  // - food/drinks, nature, activities, etc.
  
  // Return appropriate template prompt based on pattern matching
  
  // (Keep all existing template logic here)
}
```

### Step 3: Update `detectAndGenerateCommentImage()`

**Changes**:
- Keep image detection logic (unchanged)
- Replace prompt building section with call to new function
- Add logging for which method was used (AI vs template)

**Modified Section**:
```javascript
async function detectAndGenerateCommentImage(commentText, npc, post) {
  // ... existing detection logic ...
  
  if (!claimsImageUpload) {
    return { imageUrl: null, imageAlt: null };
  }
  
  if (typeof generateImage !== 'function') {
    console.warn('[Social Image Detection] generateImage not available');
    return { imageUrl: null, imageAlt: null };
  }
  
  try {
    // NEW: Use AI-powered prompt builder with context
    const imagePrompt = await buildCommentImagePrompt(npc, post, commentText);
    
    console.log(`[Social] ${npc.name} uploading image with prompt: "${imagePrompt.substring(0, 80)}..."`);
    
    // Generate the image
    const imageUrl = await generateImage(applyImageStyle(imagePrompt));
    console.log(`[Social] Image generated successfully!`);
    
    return { imageUrl, imageAlt: imagePrompt };
    
  } catch (error) {
    console.error('[Social] Failed to generate comment image:', error);
    return { imageUrl: null, imageAlt: null };
  }
}
```

---

## 🧪 Testing Plan

### Test Case 1: Simple Selfie Comment
**Setup**:
- Post: "Happy Monday everyone! ☕"
- Comment: "Here's my coffee setup! ☕"
- Context: No chat history

**Expected**:
- AI generates coffee/workspace image
- Includes NPC's appearance casually
- Morning vibe

### Test Case 2: Explicit Request Response
**Setup**:
- Post: "Send me your best pic 🔥"
- Comment: "Posted! 😈"
- Context: Recent chat history with flirting

**Expected**:
- AI detects explicit context
- Generates detailed explicit/nude prompt
- References relationship and conversation

### Test Case 3: Cat Picture (Literal)
**Setup**:
- Post: "Show me your pets! 🐱"
- Comment: "Here's my kitty!"
- Context: Conservative NPC (flirty < 50)

**Expected**:
- AI generates actual cat picture
- Not misunderstood as intimate

### Test Case 4: Cat Picture (Misunderstood)
**Setup**:
- Post: "Show me your pussy 😏"
- Comment: "Here you go boss 😉"
- Context: Flirty NPC (flirty > 70, desire > 60)

**Expected**:
- AI detects suggestive context
- Generates intimate/explicit image
- Playful misunderstanding

### Test Case 5: Proof of Activity
**Setup**:
- Post: "Who actually worked out today?"
- Comment: "Proof! 💪"
- Context: No chat history

**Expected**:
- AI generates gym/workout selfie
- Shows post-workout appearance
- Athletic setting

### Test Case 6: Response to Prior Chat
**Setup**:
- Recent chat: Player: "Can't wait to see you later"
         NPC: "I'll make it worth your while 😘"
- Post: (Player posts something generic)
- Comment: "For you 💋"

**Expected**:
- AI pulls conversation context
- Generates intimate/suggestive image
- References the chat history

---

## 📊 Success Metrics

### Qualitative Metrics:
- ✅ Comment images match conversation tone
- ✅ Explicit contexts generate appropriate explicit images
- ✅ Casual contexts remain casual
- ✅ NPCs "remember" recent conversations in image choices
- ✅ Personality influences image type (flirty NPCs more playful)

### Technical Metrics:
- AI success rate > 85% (falls back to template < 15% of time)
- Image generation time < 3 seconds
- No errors in console during normal operation
- Template fallback works correctly when AI fails

### User Experience:
- Images feel "responsive" to player's actions
- Comments + images tell a cohesive story
- Explicit content only appears in appropriate contexts
- System feels "intelligent" and context-aware

---

## 🚀 Rollout Plan

### Phase 1: Implementation (1-2 hours)
1. Add `buildCommentImagePrompt()` function
2. Extract template logic to helper function
3. Modify `detectAndGenerateCommentImage()` to use new system
4. Add comprehensive logging

### Phase 2: Testing (30 minutes)
1. Test all 6 test cases listed above
2. Verify fallback system works
3. Check console logs for AI success rate
4. Test with various NPC personalities

### Phase 3: Refinement (30 minutes)
1. Adjust AI prompt based on test results
2. Fine-tune temperature/max_tokens if needed
3. Add additional stop sequences if AI produces meta-text
4. Update template fallback if gaps found

### Phase 4: Documentation (15 minutes)
1. Add comments to new code
2. Update this document with final implementation
3. Note any discovered edge cases
4. Document AI prompt that worked best

---

## 🔄 Future Enhancements

### Potential Additions:
1. **Group Context**: If comment is part of thread, consider other comments
2. **Time-based Context**: Morning selfies vs late-night selfies
3. **Location Context**: Office hours vs weekend
4. **Mood-based**: Consider NPC's current mood stat
5. **Learning**: Track which prompts generated best images, optimize over time

### Integration Points:
- Could be expanded to handle meeting attachment images
- Could inform future AI image systems
- Could be used for automated post image suggestions

---

## 📝 Notes

### Key Decisions Made:
1. **AI-first approach** with template fallback (not vice versa)
   - Rationale: Better quality when it works, safe fallback when it doesn't
   
2. **2-hour conversation window** for context
   - Rationale: Matches social post system, balances relevance vs context size
   
3. **Separate function instead of extending buildImagePrompt()**
   - Rationale: Comment context is different from chat context, deserves specialized handling

4. **Keep existing template system as fallback**
   - Rationale: Don't break existing functionality, ensure system never fails completely

### Risks & Mitigations:
- **Risk**: AI generates inappropriate content for casual context
  - **Mitigation**: Template fallback + explicit rules in AI prompt
  
- **Risk**: AI is too slow
  - **Mitigation**: Async generation + loading indicators already in place
  
- **Risk**: AI refuses to generate explicit prompts
  - **Mitigation**: Template fallback handles explicit content well

### Dependencies:
- Requires `generateText()` function (already available)
- Requires `getPhysicalDescriptionForPrompt()` (already available)
- Requires `applyImageStyle()` wrapper (already available)
- Requires access to `gameState.chatHistory` (already available)

---

## ✅ Checklist

Before considering this complete:
- [ ] `buildCommentImagePrompt()` implemented
- [ ] `buildTemplateCommentImagePrompt()` extracted
- [ ] `detectAndGenerateCommentImage()` updated
- [ ] All 6 test cases pass
- [ ] AI success rate logged and acceptable
- [ ] Fallback system verified working
- [ ] Console logs clean (no errors)
- [ ] Code commented appropriately
- [ ] Performance acceptable (< 3 sec)
- [ ] Player bio integration tested (if needed)
- [ ] Works for all NPC personality types
- [ ] Works with and without chat history
- [ ] Explicit content handled appropriately
