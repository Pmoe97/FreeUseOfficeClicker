# Testing Guide - Caption-Image Coherence Fix

## How to Test the Fix

### Test 1: Travel Posts with Specific Cities
**Goal**: Verify specific cities generate appropriate regional images

1. Load the game and wait for social feed to populate
2. Look for travel posts mentioning specific cities:
   - "Tokyo" or "Kyoto" → Should show Japanese aesthetic
   - "Paris" → Should show French aesthetic
   - "Bali" → Should show tropical Asian aesthetic
   - "Iceland" → Should show nordic/cold aesthetic
   
3. **Expected**: Image matches the city's vibe (not just generic location)

### Test 2: Bamboo Forest Specific Test
**Goal**: This was your specific example - must work!

1. Wait for or manually trigger a travel post
2. If caption mentions "bamboo" or "Kyoto bamboo":
   - ✅ **Should show**: Tall green bamboo trees lining a path, Asian aesthetic
   - ❌ **Should NOT show**: Generic forest with regular trees

### Test 3: Life Update Activities
**Goal**: Verify specific activities generate matching images

1. Look for life update posts with these captions:
   - **"dance party"** → Should show people dancing with party lights
   - **"coding session"** → Should show desk with laptop and code
   - **"midnight coding"** → Should show dark room with screen glow
   - **"karaoke night"** → Should show person with microphone
   - **"game night"** → Should show board games or gaming setup

2. **Expected**: Image directly shows that specific activity

### Test 4: Travel Features
**Goal**: Verify unique landmarks/features are detected

1. Look for travel posts mentioning:
   - **"cherry blossoms"** → Pink sakura trees
   - **"waterfall"** → Actual waterfall scene
   - **"northern lights"** → Aurora in night sky
   - **"castle"** → Medieval castle architecture
   - **"lighthouse"** → Coastal lighthouse

2. **Expected**: Image shows that specific feature

### Test 5: Combined Details
**Goal**: Verify multiple details work together

1. Look for posts with multiple specifics:
   - "Kyoto bamboo forest at sunset" → Bamboo + Japanese + golden hour lighting
   - "Paris Eiffel Tower at night" → Eiffel Tower + nighttime lights
   - "Dance party in Miami" → Dance party + beach/tropical vibes

2. **Expected**: Image combines all mentioned details

### Test 6: Regression Test (Generic Posts)
**Goal**: Ensure old generic posts still work

1. Look for simple generic captions:
   - "At the beach!" → Generic beach (still works)
   - "Working out at the gym!" → Gym mirror selfie (still works)
   - "Coffee time ☕" → Coffee cup (still works)

2. **Expected**: Generic images still generate correctly (no breaking)

## Quick Console Test

If you want to manually test the analysis, open browser console and run:

```javascript
// Test the caption analyzer
function testAnalysis(caption) {
  // This would need to call the actual analyzeCaption function
  // But you can inspect posts in the social feed to see results
  console.log('Testing caption:', caption);
}

// Check what's in a specific post
const post = gameState.socialNetwork.posts[0];
console.log('Caption:', post.content);
console.log('Image prompt:', post.imagePrompt); // If we log this
```

## Success Criteria

### ✅ Fix is Working If:
1. "Kyoto bamboo forest" shows bamboo trees (not regular forest)
2. "Midnight dance party" shows party scene (not beach)
3. Specific cities show regional aesthetics
4. Specific activities show matching visuals
5. Generic posts still work normally

### ❌ Fix is NOT Working If:
1. Still seeing beach images for indoor activities
2. Bamboo forests showing regular trees
3. All images are generic regardless of caption
4. Breaking existing generic posts

## Debugging Tips

If images still don't match:

1. **Check browser console** for errors
2. **Verify analyzeCaption() is running**: Add console.log to see what it detects
3. **Check specificDetails array**: Should contain matched keywords
4. **Verify generateImagePrompt() receives details**: Should use them in priority order

## Expected Behavior

### Before Fix:
- Caption: "Kyoto bamboo forest"
- Analysis: `{ location: 'forest' }`
- Image: Generic forest with random trees

### After Fix:
- Caption: "Kyoto bamboo forest"
- Analysis: `{ location: 'forest', specificDetails: ['kyoto', 'bamboo'] }`
- Image: "Bamboo forest in Kyoto, tall green bamboo trees lining path, serene peaceful atmosphere, asian travel aesthetic"

## Common Test Cases

| Caption Example | Should Detect | Image Should Show |
|----------------|---------------|-------------------|
| "Just landed in Tokyo!" | ['tokyo'] | Japanese city aesthetic |
| "Exploring bamboo forests" | ['bamboo'] | Tall green bamboo trees |
| "Midnight coding session" | ['midnight', 'coding session'] | Dark room, laptop glow |
| "Dance party turned wild 💃" | ['dance party'] | People dancing, party lights |
| "Eiffel Tower selfie!" | ['eiffel tower', 'paris'] | Eiffel Tower landmark |
| "Cherry blossoms in Kyoto" | ['kyoto', 'cherry blossom'] | Pink sakura + Japanese aesthetic |
| "At the beach" | (none) | Generic beach (fallback) |

## Time to Test!
Load the game, check the social feed, and verify those captions finally match their images! 🎉
