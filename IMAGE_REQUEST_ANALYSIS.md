# Image Request Analysis & Custom Comment Image Plan

## Current State Analysis

### ✅ ALREADY USING EXTENDED CONTEXT (Working Correctly)

#### 1. **Explicit Image Requests** (Conversations & Meetings)
- **Location**: `generateAndSendRequestedImage()` function (line ~35809)
- **Status**: ✅ **ALREADY USES EXTENDED CONTEXT**
- **How it works**:
  - Calls `buildImagePrompt()` which creates comprehensive prompt
  - Includes conversation history, relationship stats, intimacy level
  - Uses AI to accompany image with contextual message
  - Considers employee's personality and relationship dynamics

#### 2. **Social Post Image Generation** (Self-posted by NPCs)
- **Location**: `generateImagePrompt()` function (line ~39805)
- **Status**: ✅ **ALREADY USES EXTENDED CONTEXT + AI**
- **How it works**:
  - Uses **AI-POWERED IMAGE PROMPT GENERATION**
  - Pulls recent chat history (last 2 hours, last 5 messages)
  - Includes boss request context if applicable
  - Considers post caption and conversation context
  - Falls back to template-based system if AI fails
  - Has explicit instructions for nude/explicit content matching

### ⚠️ NEEDS IMPROVEMENT

#### 3. **Request Image Modal Presets** (Conversations & Meetings)
- **Location**: Request Image Modal UI + `requestImageFromNPC()` function
- **Current State**: Uses simple presets (casual, work, lewd, nude, explicit)
- **Status**: ⚠️ **BASIC CONTEXT** - Uses `buildImagePrompt()` which is good, but presets are simplistic
- **What happens**:
  - Preset buttons trigger `requestImageFromNPC(preset)`
  - Calls `generateAndSendRequestedImage()` 
  - Which calls `buildImagePrompt(emp, requestType, customPrompt)`
  - **This actually DOES use context** (intimacy level, conversation history)
  - The issue is just that the **preset names** are generic

#### 4. **Comment Image Detection** (Social Feed Comments)
- **Location**: `detectAndGenerateCommentImage()` function (line ~26190)
- **Status**: ⚠️ **PARTIAL CONTEXT** - Uses template matching
- **How it works**:
  - Detects when NPC comment claims to include image
  - Uses regex pattern matching for context (cats, food, selfies, nude, etc.)
  - Includes some personality-based decisions (flirty misunderstandings)
  - **Does NOT use AI** - purely template-based
  - **Does NOT pull conversation history** - only uses current post content

## Summary of Findings

| Feature | Context Level | Uses AI? | Conversation History? | Notes |
|---------|--------------|----------|---------------------|-------|
| **Explicit requests** (Chat/Meeting) | ✅ Full | ❌ No | ✅ Yes | Uses `buildImagePrompt()` with relationships |
| **Request Image Modal** | ✅ Good | ✅ Yes (custom) | ✅ Yes | Actually uses full context via `buildImagePrompt()` |
| **Social Post Images** (NPC posts) | ✅ Full | ✅ Yes | ✅ Yes | AI-powered with fallback templates |
| **Comment Images** | ⚠️ Partial | ❌ No | ❌ No | Template matching only |

## Key Insight

**Most image requests ALREADY use extended conversation context!** The main gap is:

1. **Comment image generation** - This uses template matching instead of AI
2. **Preset button labeling** - The UI shows "Casual Selfie" etc. but the actual generation IS contextual

---

## 🎯 Action Plan

### Phase 1: Verify & Document (COMPLETE)
✅ Analyzed all image request types
✅ Confirmed which use extended context
✅ Identified the one area needing improvement

### Phase 2: Upgrade Comment Image Generation

#### Goal
Make comment images use the same AI-powered context-aware system as social posts and chat requests.

#### Current Flow
```
Player posts → NPC comments → detectAndGenerateCommentImage()
  → Template matching based on keywords
  → generateImage(simple prompt)
```

#### Proposed New Flow
```
Player posts → NPC comments → detectAndGenerateCommentImage()
  → Check if image claimed
  → Build AI prompt with:
     • NPC personality & appearance
     • Post content & caption
     • Recent conversation context (if any chat history exists)
     • Relationship stats
     • Type of request (selfie, nude, casual, etc.)
  → Generate contextual image prompt via AI
  → generateImage(detailed AI prompt)
```

#### Implementation Strategy

**Option A: Use existing `buildImagePrompt()` function**
- Pro: Reuses proven code
- Pro: Consistent with chat image requests
- Con: Requires employee object with full stats
- Con: May be overkill for simple comments

**Option B: Create new AI-powered comment image function**
- Pro: Optimized for comment context specifically
- Pro: Lighter weight than full `buildImagePrompt()`
- Pro: Can focus on post content vs conversation history
- Con: Code duplication
- Con: Need to maintain two systems

**Option C: Hybrid approach** ⭐ **RECOMMENDED**
- Create `buildCommentImagePrompt(npc, post, comment)`
- Use AI like social post generation does
- Include conversation context IF chat history exists with this NPC
- Fall back to templates only if AI fails
- Reuse physical description system

### Phase 3: Implementation Details

#### New Function: `buildCommentImagePrompt(npc, post, comment)`

```javascript
async function buildCommentImagePrompt(npc, post, comment) {
  const physicalDesc = getPhysicalDescriptionForPrompt(npc);
  
  // Get conversation context if exists
  const chatHistory = gameState.chatHistory[npc.id] || [];
  const recentChats = chatHistory
    .filter(msg => (msg.timestamp || 0) > (Date.now() - 2*60*60*1000))
    .slice(-5);
  
  let conversationContext = '';
  if (recentChats.length >= 2) {
    conversationContext = `\n\nRECENT CONVERSATION WITH BOSS:\n${
      recentChats.map(msg => `${msg.sender}: "${msg.content}"`).join('\n')
    }`;
  }
  
  // Build AI prompt
  const aiPrompt = `You are generating an image description for a social media comment.

CONTEXT:
- NPC: ${npc.name} (${npc.position || 'Employee'})
- Appearance: ${physicalDesc}
- Post: "${post.content || post.caption}"
- Comment: "${comment}"
${conversationContext}

TASK:
The NPC is uploading/sharing an image as part of their comment. Based on:
1. What the post is about
2. What their comment claims to show
3. Their personality and relationship with the boss
4. Any recent conversations

Generate a DETAILED image prompt that matches what they're sharing.

RULES:
- If claiming "selfie" → detailed selfie description
- If claiming "nude" → explicit nude description
- If claiming "cat pic" → either actual cat OR flirty misunderstanding
- If claiming "proof" → match what needs proving
- Include specific pose, expression, setting, lighting
- Use anatomical descriptions for explicit content

IMAGE PROMPT (detailed, technical):`;

  try {
    let prompt = await generateText(aiPrompt, {
      temperature: 0.8,
      max_tokens: 150,
      stopSequences: ['\n\n', 'Note:', 'Camera:']
    });
    
    // Clean up
    prompt = prompt.trim().split('\n')[0];
    
    if (prompt.length > 20) {
      return prompt;
    }
  } catch (error) {
    console.error('AI comment image prompt failed:', error);
  }
  
  // Fallback to existing template system
  return buildTemplateCommentImagePrompt(npc, post, comment);
}
```

#### Modified `detectAndGenerateCommentImage()`:

```javascript
async function detectAndGenerateCommentImage(commentText, npc, post) {
  // ... existing detection logic ...
  
  if (!claimsImageUpload) {
    return { imageUrl: null, imageAlt: null };
  }
  
  try {
    // NEW: Use AI-powered prompt builder
    const imagePrompt = await buildCommentImagePrompt(npc, post, commentText);
    
    console.log(`[Social] ${npc.name} uploading image: "${imagePrompt}"`);
    const imageUrl = await generateImage(applyImageStyle(imagePrompt));
    
    return { imageUrl, imageAlt: imagePrompt };
  } catch (error) {
    console.error('[Social] Failed to generate comment image:', error);
    return { imageUrl: null, imageAlt: null };
  }
}
```

### Phase 4: Testing Strategy

#### Test Cases:
1. **Simple context**: "Here's a selfie!" on casual post
2. **Explicit context**: "Posted! 🔥" on nude request post
3. **With chat history**: Comment on post after sexting conversation
4. **Without chat history**: Comment from NPC never chatted with
5. **Playful misunderstanding**: "Here's my pussy! 🐱" context
6. **Food/object photos**: "Here's my lunch!" etc.

---

## 📊 Summary

### What's Already Great ✅
- ✅ Chat image requests use full context
- ✅ Meeting image requests use full context  
- ✅ Social post self-images use AI + context
- ✅ Custom prompts use AI analysis

### What Needs Improvement ⚠️
- ⚠️ Comment images use template matching
- ⚠️ No conversation history in comment images
- ⚠️ Less personality-aware than other systems

### The Fix 🔧
Upgrade `detectAndGenerateCommentImage()` to use AI-powered prompt building with conversation context, matching the sophistication of the social post image system.

### Expected Impact 🎯
- Comment images will match conversation tone
- NPCs will reference recent chats in their shared photos
- Explicit comments will generate appropriate explicit images
- Consistency across all image generation systems
