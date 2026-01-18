# Bug Investigation Report
**Date:** November 5, 2025
**Version:** v2511051245

## Reported Issues

### 1. ❌ **Chat Messages Disappearing**
**Reporter:** 0XXY  
**Symptoms:**
- Chats lost about 2 weeks of content
- New messages are immediately deleted when leaving chat
- "This page has errors" banner appearing constantly
- Messages disappear once user leaves the chat

**Root Cause Analysis:**
After investigating the code, I found several potential causes:

#### A. **No Auto-Save on Chat Close** ⚠️ CRITICAL
- **Location:** Line 17943 - `closeChatBtn` event listener
- **Issue:** When user closes chat modal, it only sets `gameState.activeChat = null` but **does NOT call `saveGame()`**
- **Impact:** Any new messages added to `gameState.chatHistory[employeeId]` in memory are lost if the page is refreshed or closed before the next auto-save

```javascript
// CURRENT CODE (Line 17943)
closeChatBtn.addEventListener('click', () => {
  if (chatModal) {
    chatModal.hidden = true;
    chatModal.style.display = 'none';
    chatModal.style.pointerEvents = 'none';
    gameState.activeChat = null; // Sets to null but NO SAVE!
  }
});
```

#### B. **Chat History Accidentally Being Cleared**
Found 14 locations where `gameState.chatHistory[id] = []` clears chat history. Key locations:
- Line 17988: Clear chat button (intentional, with archive)
- Line 32000, 35602, 36309: Various employee actions
- Line 45410-45437: Meeting cleanup removing invalid employee messages

The meeting cleanup code (added in recent update) may be too aggressive and clearing chats for employees who are still valid.

#### C. **Potential Race Condition with Auto-Save**
- Auto-save happens every 30 seconds (typical interval)
- If user sends messages and immediately closes chat within 30 seconds, changes may not be persisted
- Browser refresh or crash before save = data loss

---

### 2. ⚠️ **Post Refresh Context Problem**
**Reporter:** X3QF  
**Issue:** "refresh post works but the context is random, it should rewrite the older post in a different way instead it just change it completely"

**Root Cause Analysis:**
- **Location:** Line 26479 - `regeneratePost()` function
- **Issue:** Function creates a NEW prompt from scratch without referencing the **original post content**
- **Current Behavior:** Generates completely new post based only on character traits, mood, and explicitness level
- **Expected Behavior:** Should rewrite the SAME idea/topic with different words

```javascript
// CURRENT PROMPT (Line 26500)
const prompt = `You are ${employee.name}, a ${employee.position} at ${getCompanyName()}.

Character: ${employee.traits?.join(', ') || 'professional'}
Mood: ${post.mood || 'neutral'}
Post Type: ${post.type || 'social media update'}
Tone: ${explicitLevelText}

Generate a social media post (2-4 sentences). Be authentic and ${post.explicitLevel >= 1 ? 'flirty/suggestive' : 'casual'}. ${post.imageUrl ? 'The post includes an image.' : ''}`;
// ❌ NO REFERENCE TO ORIGINAL CONTENT!
```

---

### 3. ⚠️ **Meeting Selfie Failure**
**Reporter:** X3QF  
**Issue:** "meeting selfie is failing not sure if is intentional i believe in patch notes it says it should work"

**Investigation:**
- **Location:** Line 17192 - `requestGroupSelfie()` function
- **Code Review:** Function looks correct and well-implemented
- **Likely Causes:**
  1. AI image generation rate limits being hit
  2. Physical description functions (`getPlayerPhysicalDescription()` or `buildPhysicalDescription()`) returning undefined/empty
  3. No error logging visible to user - fails silently
  4. Meeting participants array might be empty or contain invalid IDs

```javascript
// Function exists and looks correct (Line 17192)
async function requestGroupSelfie(meeting) {
  showNotification('📷 Requesting group selfie...', 'info');
  // ... builds prompt, generates image, adds messages ...
  // ⚠️ May fail silently if image generation fails
}
```

---

### 4. ℹ️ **Comment Refresh Requested**
**Reporter:** X3QF  
**Feature Request:** "i would like a refresh of comments too"
- Currently only posts can be refreshed/regenerated
- Comments have no regenerate button

---

## 🔧 Proposed Fixes

### Fix #1: Chat Message Persistence (CRITICAL - Priority 1)

#### Solution A: Save on Chat Close
```javascript
closeChatBtn.addEventListener('click', () => {
  if (chatModal) {
    chatModal.hidden = true;
    chatModal.style.display = 'none';
    chatModal.style.pointerEvents = 'none';
    
    // ✅ SAVE BEFORE CLOSING
    if (gameState.activeChat) {
      saveGame(false); // false = no toast notification
    }
    
    gameState.activeChat = null;
  }
});
```

#### Solution B: Save After Every Message
Add `saveGame(false)` after messages are added to chat history:
- Line 12179: After `gameState.chatHistory[employeeId] = chatHistory;`
- Line 18749: After employee message push
- After any chat modification

#### Solution C: Debounced Save on Chat Activity
Implement a debounced save that triggers 2-3 seconds after last chat activity.

**Recommendation:** Implement **Solution A + B** - Save on close AND after messages for maximum data safety.

---

### Fix #2: Post Refresh Context Preservation (Priority 2)

```javascript
async function regeneratePost(postId) {
  const post = gameState.socialNetwork.posts.find(p => p.id === postId);
  if (!post || post.isPlayerPost) {
    console.error('[RegeneratePost] Post not found or is player post');
    return;
  }
  
  const employee = gameState.employees.find(e => e.id === post.authorId);
  if (!employee) {
    console.error('[RegeneratePost] Employee not found');
    return;
  }
  
  showNotification('🔄 Regenerating post...', 'info');
  
  try {
    const explicitLevelText = post.explicitLevel >= 3 ? 'extremely explicit and sexual' : 
                              post.explicitLevel >= 2 ? 'very suggestive and lewd' :
                              post.explicitLevel >= 1 ? 'mildly suggestive' : 'safe for work';
    
    // ✅ NEW: Include original content in prompt for context
    const prompt = `You are ${employee.name}, a ${employee.position} at ${getCompanyName()}.

Character: ${employee.traits?.join(', ') || 'professional'}
Mood: ${post.mood || 'neutral'}
Post Type: ${post.type || 'social media update'}
Tone: ${explicitLevelText}

ORIGINAL POST: "${post.content}"

Your task: Rewrite the above post with different wording while keeping the same core idea, topic, and sentiment. ${post.explicitLevel >= 1 ? 'Keep it flirty/suggestive.' : 'Keep it casual and professional.'} ${post.imageUrl ? 'The post includes an image - reference it naturally if relevant.' : ''}

Write 2-4 sentences in your authentic voice:`;

    const response = await generateText(prompt, {
      temperature: 0.9,
      max_tokens: 150,
      stop: ['\n\n', 'User:', 'Assistant:']
    });
    
    if (response && response.trim()) {
      post.content = response.trim();
      post.regeneratedAt = Date.now();
      
      showNotification('✅ Post regenerated', 'success');
      
      if (postModalState.activePostId === postId) {
        openPostModal(postId);
      }
      
      if (gameState.activeTab === 'social') {
        renderSocialFeed(true);
      }
    } else {
      throw new Error('Empty response from AI');
    }
  } catch (error) {
    console.error('[RegeneratePost] Error:', error);
    showNotification('❌ Failed to regenerate post', 'error');
  }
}
```

---

### Fix #3: Meeting Selfie Debugging (Priority 2)

```javascript
async function requestGroupSelfie(meeting) {
  showNotification('📷 Requesting group selfie...', 'info');
  console.log('[Meeting] Group selfie requested for meeting:', meeting.name);
  
  try {
    // ✅ ADD VALIDATION
    if (!meeting.participants || meeting.participants.length === 0) {
      console.error('[Meeting Selfie] No participants in meeting');
      showNotification('⚠️ Cannot take selfie: No participants in meeting', 'error');
      return;
    }
    
    // Get all participants
    const playerDesc = getPlayerPhysicalDescription();
    
    // ✅ ADD VALIDATION
    if (!playerDesc || playerDesc.trim() === '') {
      console.error('[Meeting Selfie] Player physical description is empty');
      showNotification('⚠️ Cannot take selfie: Player profile incomplete. Please set up your profile in settings.', 'error');
      return;
    }
    
    const participants = meeting.participants
      .map(id => gameState.employees.find(e => e.id === id))
      .filter(e => e);
    
    // ✅ ADD VALIDATION
    if (participants.length === 0) {
      console.error('[Meeting Selfie] No valid participants found');
      showNotification('⚠️ Cannot take selfie: No valid participants found', 'error');
      return;
    }
    
    const participantDescs = participants
      .map(emp => {
        const desc = buildPhysicalDescription(emp);
        // ✅ ADD VALIDATION
        if (!desc || desc.trim() === '') {
          console.warn(`[Meeting Selfie] Empty description for ${emp.name}`);
          return `${emp.name} (${emp.position})`;
        }
        return desc;
      })
      .join(', ');
    
    // Build casual, fun selfie prompt
    const prompt = `Group selfie: ${playerDesc}, ${participantDescs}. Everyone looking at camera, smiling, casual friendly pose, close together. Modern office background, bright lighting, smartphone selfie style.`;
    
    console.log('[Meeting Selfie] Generating image with prompt:', prompt);
    
    // Generate image
    const imageUrl = await generateImage(prompt);
    
    // ✅ BETTER ERROR HANDLING
    if (!imageUrl || imageUrl.trim() === '') {
      console.error('[Meeting Selfie] Failed to generate image - empty URL returned');
      showNotification('❌ Failed to generate selfie image. Please try again or check your AI service.', 'error');
      return;
    }
    
    console.log('[Meeting Selfie] Image generated successfully:', imageUrl);
    
    // Add AI-generated reaction message from a random participant
    const randomParticipant = participants[Math.floor(Math.random() * participants.length)];
    const reactions = [
      `"Say cheese everyone!" 📸`,
      `"This is going on the company wall!" 😄`,
      `"Best meeting ever!" 🎉`,
      `"Everyone smile!" 😁`,
      `"Group photo time!" 📷`,
      `"Love it!" 💕`,
      `"This turned out great!" ✨`
    ];
    const reaction = reactions[Math.floor(Math.random() * reactions.length)];
    
    // Add participant's reaction
    addMeetingMessage({
      sender: randomParticipant.id,
      content: reaction,
      timestamp: Date.now()
    });
    
    // Add the selfie image
    addMeetingMessage({
      sender: 'system',
      content: '📷 Group selfie!',
      imageUrl: imageUrl,
      timestamp: Date.now()
    });
    
    // Small relationship boost for all participants
    participants.forEach(emp => {
      if (emp.stats) {
        emp.stats.affection = Math.min(100, (emp.stats.affection || 0) + 2);
      }
    });
    
    showNotification('✅ Group selfie taken!', 'success');
  } catch (error) {
    console.error('[Meeting] Group selfie error:', error);
    // ✅ SHOW ERROR DETAILS
    showNotification(`❌ Failed to take group selfie: ${error.message}`, 'error');
  }
}
```

---

### Fix #4: Comment Regeneration Feature (Priority 3)

Add a regenerate button to comments similar to posts. This would be a new feature requiring:
1. Add regenerate button to comment rendering
2. Create `regenerateComment(postId, commentId)` function
3. Build AI prompt that preserves comment context but rewrites it

---

## Testing Plan

1. **Chat Persistence:**
   - Send messages in chat
   - Close chat modal immediately
   - Refresh page
   - Verify messages are still there

2. **Post Refresh:**
   - Create or find post with specific content (e.g., "Going to the beach today!")
   - Click refresh multiple times
   - Verify each refresh keeps the beach theme but uses different words

3. **Meeting Selfie:**
   - Create meeting with 2-3 employees
   - Ensure player profile has physical description filled out
   - Request group selfie
   - Check console for error messages if it fails

---

## Priority Ranking

1. **🔴 CRITICAL:** Fix #1 (Chat Message Persistence) - Data loss issue
2. **🟡 HIGH:** Fix #2 (Post Refresh Context) - User experience issue
3. **🟡 HIGH:** Fix #3 (Meeting Selfie Debugging) - Feature not working
4. **🟢 MEDIUM:** Fix #4 (Comment Regeneration) - New feature request

---

## Additional Notes

- The "This page has errors" banner suggests there may be JavaScript errors occurring
- Consider adding global error handler to log all errors to console
- May want to add error reporting/logging system for debugging user issues
- Consider adding a "Debug Mode" setting that shows detailed error messages to users
