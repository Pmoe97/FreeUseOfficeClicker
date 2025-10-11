# 🎮 Quick Testing Guide

## How to Test Your New Features

### 🚀 Before You Start
1. Open `index.html` in your browser
2. Make sure you have at least 2-3 employees hired
3. Have employees generate some social posts (wait a few minutes or trigger manually)

---

## 💬 Testing Social Feed Context

### Test 1: NPC References Own Posts
1. Wait for an employee to create a social post (or manually trigger one)
2. Open chat with that employee
3. Ask: **"What did you post about?"** or **"Tell me about your recent post"**
4. ✅ **Expected:** NPC should reference their actual post content

### Test 2: NPC Knows About Coworker Posts
1. Have multiple employees create posts
2. Open chat with Employee A
3. Ask: **"What has [Employee B's name] been posting?"**
4. ✅ **Expected:** Employee A should mention Employee B's recent posts

### Test 3: Post Context in General Chat
1. After several posts exist in the feed
2. Chat with an employee
3. Mention something like: **"I saw the posts about [topic]"**
4. ✅ **Expected:** NPC should understand and reference relevant posts

---

## 🤝 Testing Relationship System

### Test 1: Visual Relationship Display
1. Go to **HR Tab**
2. Look at employee cards
3. ✅ **Expected:** See "🤝 Relationships" section showing:
   - Top 3 coworker relationships
   - Relationship types (Friend, Crush, Rival, etc.)
   - Strength percentages
   - Emoji indicators

### Test 2: Relationship Context in Chat
1. Note which employees are friends/crushes (from HR tab)
2. Open chat with Employee A
3. Ask: **"What do you think of [Employee B]?"**
4. ✅ **Expected:** Employee A should mention:
   - Their relationship type with B
   - Positive/negative tone based on relationship
   - Specific relationship details

### Test 3: Relationship Color Coding
1. Check HR tab relationships
2. ✅ **Expected Color Coding:**
   - 💚 Friends = Green text
   - 💖 Crush = Pink text
   - ⚔️ Rival = Orange text
   - 💢 Dislikes/Enemy = Red text
   - 👥 Neutral = Gray text

---

## 🎨 Testing Appearance Consistency

### Test 1: Multiple Images Same Employee
1. Chat with an employee
2. Request different image types:
   - Click "Request Image" → "Casual"
   - Request "Work" image
   - Request custom image
3. ✅ **Expected:** All images should show:
   - Same hair color and style
   - Same face features
   - Same body type
   - Consistent person across all images

### Test 2: Profile vs Chat Images
1. Note employee's profile image (HR tab)
2. Request image in chat
3. Compare appearance details
4. ✅ **Expected:** Should be recognizably the same person

### Test 3: Social Post Image Consistency
1. Check employee's posts in Social tab
2. Compare to their profile and chat images
3. ✅ **Expected:** Consistent appearance across:
   - Profile picture
   - Chat images
   - Social media posts

---

## 🐛 Troubleshooting

### "NPC doesn't mention their posts"
- **Check:** Did the employee actually create posts? (Social tab)
- **Wait:** Try asking more directly: "What have you been posting?"
- **Verify:** Check browser console (F12) for errors

### "No relationships showing"
- **Check:** Do you have 2+ employees?
- **Wait:** Relationships generate when employees are hired
- **Refresh:** Try refreshing employee list (switch tabs)

### "Images look different"
- **Note:** Some variation is normal (clothing, lighting, angles)
- **Check:** Core features should match (hair, face, body type)
- **System:** New appearance system only affects new generations

### "Console errors"
- Press **F12** to open console
- Screenshot any errors
- Usually safe to continue playing

---

## 📊 Success Checklist

Mark off as you test:

### Social Feed Context
- [ ] NPC references their own posts ✓
- [ ] NPC mentions coworker posts ✓
- [ ] Social context in general chat ✓
- [ ] Player posts remembered by NPCs ✓

### Relationship System
- [ ] Relationships visible on cards ✓
- [ ] Color-coded properly ✓
- [ ] NPCs discuss relationships ✓
- [ ] Relationship tone affects chat ✓

### Appearance System
- [ ] Same person across images ✓
- [ ] Profile matches chat images ✓
- [ ] Social posts match appearance ✓
- [ ] Physical details consistent ✓

---

## 🎉 All Tests Pass?

**Congratulations!** Your game now has:
- ✅ Contextually aware NPCs
- ✅ Visible relationship dynamics
- ✅ Consistent character appearances
- ✅ More immersive conversations

### Ready to Commit?

```bash
git add .
git commit -m "feat: Social context, relationships, and appearance system"
git push
```

---

## 💡 Optional: Advanced Testing

### Deep Conversation Test
1. Have a long conversation with an NPC (10+ messages)
2. Reference multiple topics:
   - Their posts
   - Other employees
   - Social feed events
3. See how naturally they integrate all context

### Relationship Evolution
1. Note relationship strengths now
2. Play for 30+ minutes
3. Check if relationships have changed
4. See if chat tone reflects changes

### Image Stress Test
1. Request 10+ images from one employee
2. Look for any inconsistencies
3. Test different scenarios (casual, work, intimate)
4. Verify caption matches image content

---

**Happy Testing!** 🚀

Remember: Some variations are normal and add character. We're aiming for **consistency** not **identical** images.
