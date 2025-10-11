// ============================================
// QUICK CODE SNIPPETS FOR TOMORROW
// Copy-paste ready implementations
// ============================================

// ============================================
// 1. ECONOMY REBALANCING
// ============================================

// Add this game balance configuration object near the top of your gameState
const gameBalance = {
  // Click values
  baseClickValue: 1,
  clickValueGrowth: 2, // Per player level
  
  // Product scaling
  productCostMultiplier: 1.5,  // Each level costs 1.5x more
  productIncomeMultiplier: 1.15, // Each level gives 1.15x more income
  
  // Starting costs (much lower for better early game)
  startingProductCost: 10,
  
  // Employee costs
  employeeBaseCost: 100,
  employeeCostMultiplier: 1.8,
  
  // Income boost
  globalIncomeMultiplier: 2.0, // Make everything 2x faster to start
  
  // Boss fights
  bossFightRewardMultiplier: 5.0 // Bosses give 5x the unlock cost
};

// Update product income calculation
function calculateProductIncome(product) {
  const level = product.owned || 0;
  const baseIncome = product.baseIncome || 1;
  
  // Exponential growth feels better than linear
  return Math.floor(
    baseIncome * 
    Math.pow(gameBalance.productIncomeMultiplier, level) * 
    gameBalance.globalIncomeMultiplier
  );
}

// Update product cost calculation  
function calculateProductCost(product) {
  const level = product.owned || 0;
  const baseCost = product.baseCost || 10;
  
  return Math.floor(
    baseCost * 
    Math.pow(gameBalance.productCostMultiplier, level)
  );
}


// ============================================
// 2. NEW LOCATIONS DATA
// ============================================

const newLocations = [
  {
    id: 'marketing',
    name: 'Marketing Department',
    emoji: '📢',
    description: 'Where creativity meets strategy',
    unlockCost: 5000,
    unlockType: 'boss', // or 'cash' for instant unlock
    bossConfig: {
      name: 'The Marketing Director',
      health: 15000,
      timeLimit: 60,
      difficulty: 'medium'
    }
  },
  {
    id: 'rnd',
    name: 'R&D Laboratory',
    emoji: '🔬',
    description: 'Innovation and breakthrough discoveries',
    unlockCost: 25000,
    unlockType: 'boss',
    bossConfig: {
      name: 'The Head Scientist',
      health: 50000,
      timeLimit: 90,
      difficulty: 'hard'
    }
  },
  {
    id: 'executive',
    name: 'Executive Suite',
    emoji: '💼',
    description: 'Where the big decisions happen',
    unlockCost: 100000,
    unlockType: 'boss',
    bossConfig: {
      name: 'The CEO',
      health: 200000,
      timeLimit: 120,
      difficulty: 'extreme'
    }
  }
];

const newProducts = {
  marketing: [
    {
      id: 'mkt_social_campaign',
      name: 'Social Media Campaign',
      emoji: '📱',
      baseCost: 500,
      baseIncome: 8,
      description: 'Viral posts that generate passive buzz',
      locationId: 'marketing'
    },
    {
      id: 'mkt_influencer',
      name: 'Influencer Partnership',
      emoji: '⭐',
      baseCost: 2500,
      baseIncome: 40,
      description: 'Partner with influencers for massive reach',
      locationId: 'marketing'
    },
    {
      id: 'mkt_brand_deal',
      name: 'Brand Partnership',
      emoji: '🤝',
      baseCost: 10000,
      baseIncome: 150,
      description: 'Major brand collaborations',
      locationId: 'marketing'
    },
    {
      id: 'mkt_superbowl',
      name: 'Super Bowl Ad',
      emoji: '🏈',
      baseCost: 50000,
      baseIncome: 800,
      description: 'The ultimate marketing flex',
      locationId: 'marketing'
    }
  ],
  
  rnd: [
    {
      id: 'rnd_prototype',
      name: 'Product Prototype',
      emoji: '🔧',
      baseCost: 3000,
      baseIncome: 50,
      description: 'Testing new product ideas',
      locationId: 'rnd'
    },
    {
      id: 'rnd_patent',
      name: 'Patent Filing',
      emoji: '📜',
      baseCost: 15000,
      baseIncome: 200,
      description: 'Protect your innovations',
      locationId: 'rnd'
    },
    {
      id: 'rnd_lab_upgrade',
      name: 'Lab Equipment Upgrade',
      emoji: '🧪',
      baseCost: 60000,
      baseIncome: 900,
      description: 'State-of-the-art research tools',
      locationId: 'rnd'
    },
    {
      id: 'rnd_breakthrough',
      name: 'Breakthrough Discovery',
      emoji: '💡',
      baseCost: 250000,
      baseIncome: 4000,
      description: 'Game-changing innovation',
      locationId: 'rnd'
    }
  ],
  
  executive: [
    {
      id: 'exec_acquisition',
      name: 'Company Acquisition',
      emoji: '🏢',
      baseCost: 150000,
      baseIncome: 2000,
      description: 'Buy out the competition',
      locationId: 'executive'
    },
    {
      id: 'exec_ipo',
      name: 'IPO Preparation',
      emoji: '📈',
      baseCost: 500000,
      baseIncome: 8000,
      description: 'Go public and rake in billions',
      locationId: 'executive'
    }
  ]
};


// ============================================
// 3. BOSS FIGHT SYSTEM
// ============================================

// Add to gameState
gameState.bossFights = {
  active: null,
  history: {},
  playerUpgrades: {
    clickPower: { level: 0, cost: 1000 },
    autoClick: { level: 0, cost: 2000 },
    npcBonus: { level: 0, cost: 1500 }
  }
};

// Boss Fight UI (add to HTML)
const bossFightHTML = `
<div id="bossFightModal" class="modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:10000; justify-content:center; align-items:center;">
  <div style="background:#16213e; border-radius:15px; padding:30px; max-width:600px; width:90%; position:relative;">
    <!-- Boss Name -->
    <h2 id="bossName" style="text-align:center; color:#e94560; margin:0 0 20px 0;"></h2>
    
    <!-- Boss Health Bar -->
    <div style="background:#0f3460; height:40px; border-radius:20px; overflow:hidden; margin-bottom:20px; position:relative;">
      <div id="bossHealthBar" style="background:linear-gradient(90deg, #e94560, #ff6b9d); height:100%; width:100%; transition:width 0.3s;"></div>
      <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-weight:bold; color:white;">
        <span id="bossHealthText">10000 / 10000</span>
      </div>
    </div>
    
    <!-- Timer -->
    <div style="text-align:center; font-size:2rem; margin-bottom:20px; color:#00d4ff;">
      <span id="bossTimer">60</span>s
    </div>
    
    <!-- Click Area -->
    <div style="text-align:center; margin:30px 0;">
      <button id="bossClickBtn" style="width:200px; height:200px; border-radius:50%; background:linear-gradient(135deg, #e94560, #8b2e6f); border:5px solid #00d4ff; color:white; font-size:3rem; cursor:pointer; box-shadow:0 10px 30px rgba(233,69,96,0.5); transition:transform 0.1s;">
        CLICK!
      </button>
    </div>
    
    <!-- Damage Numbers Container -->
    <div id="bossDamageNumbers" style="position:absolute; top:50%; left:50%; width:0; height:0;"></div>
    
    <!-- Stats -->
    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; text-align:center; margin-top:20px;">
      <div>
        <div style="color:#aaa; font-size:0.9rem;">Your Damage</div>
        <div style="color:#00d4ff; font-size:1.3rem; font-weight:bold;" id="playerDamage">10</div>
      </div>
      <div>
        <div style="color:#aaa; font-size:0.9rem;">NPC DPS</div>
        <div style="color:#4ecca3; font-size:1.3rem; font-weight:bold;" id="npcDps">5</div>
      </div>
      <div>
        <div style="color:#aaa; font-size:0.9rem;">Total Damage</div>
        <div style="color:#e94560; font-size:1.3rem; font-weight:bold;" id="totalDamage">0</div>
      </div>
    </div>
    
    <!-- Close Button -->
    <button id="closeBossFight" style="position:absolute; top:10px; right:10px; background:transparent; border:none; color:white; font-size:1.5rem; cursor:pointer;">✕</button>
  </div>
</div>
`;

// Boss Fight Logic
function startBossFight(locationId) {
  const location = gameState.locations.find(l => l.id === locationId);
  if (!location || !location.bossConfig) return;
  
  const boss = location.bossConfig;
  const bossData = {
    locationId: locationId,
    name: boss.name,
    maxHealth: boss.health,
    currentHealth: boss.health,
    timeLimit: boss.timeLimit,
    timeRemaining: boss.timeLimit,
    startTime: Date.now()
  };
  
  gameState.bossFights.active = bossData;
  
  // Show modal
  const modal = document.getElementById('bossFightModal');
  document.getElementById('bossName').textContent = boss.name;
  document.getElementById('bossHealthText').textContent = `${boss.health} / ${boss.health}`;
  modal.style.display = 'flex';
  
  // Start fight loop
  runBossFight();
}

function runBossFight() {
  const boss = gameState.bossFights.active;
  if (!boss) return;
  
  const interval = setInterval(() => {
    // Update timer
    boss.timeRemaining--;
    document.getElementById('bossTimer').textContent = boss.timeRemaining;
    
    // Apply NPC DPS
    const npcDps = calculateNpcDps();
    boss.currentHealth = Math.max(0, boss.currentHealth - npcDps);
    
    // Update UI
    updateBossUI();
    
    // Check win/lose
    if (boss.currentHealth <= 0) {
      clearInterval(interval);
      bossFightVictory();
    } else if (boss.timeRemaining <= 0) {
      clearInterval(interval);
      bossFightDefeat();
    }
  }, 1000);
  
  // Store interval for cleanup
  boss.interval = interval;
}

function bossClick() {
  const boss = gameState.bossFights.active;
  if (!boss) return;
  
  const damage = calculatePlayerDamage();
  boss.currentHealth = Math.max(0, boss.currentHealth - damage);
  
  // Show damage number
  showDamageNumber(damage);
  
  // Update UI
  updateBossUI();
  
  // Check win
  if (boss.currentHealth <= 0) {
    clearInterval(boss.interval);
    bossFightVictory();
  }
}

function calculatePlayerDamage() {
  const baseClickPower = 10;
  const upgradeLevel = gameState.bossFights.playerUpgrades.clickPower.level;
  return baseClickPower + (upgradeLevel * 5);
}

function calculateNpcDps() {
  const employeeCount = gameState.employees.length;
  const baseNpcDps = employeeCount * 2;
  const upgradeLevel = gameState.bossFights.playerUpgrades.npcBonus.level;
  const multiplier = 1 + (upgradeLevel * 0.5);
  return Math.floor(baseNpcDps * multiplier);
}

function updateBossUI() {
  const boss = gameState.bossFights.active;
  const healthPercent = (boss.currentHealth / boss.maxHealth) * 100;
  
  document.getElementById('bossHealthBar').style.width = `${healthPercent}%`;
  document.getElementById('bossHealthText').textContent = 
    `${Math.floor(boss.currentHealth)} / ${boss.maxHealth}`;
  
  document.getElementById('playerDamage').textContent = calculatePlayerDamage();
  document.getElementById('npcDps').textContent = calculateNpcDps();
}

function showDamageNumber(damage) {
  const container = document.getElementById('bossDamageNumbers');
  const dmgEl = document.createElement('div');
  dmgEl.textContent = `-${damage}`;
  dmgEl.style.cssText = `
    position:absolute;
    color:#e94560;
    font-size:2rem;
    font-weight:bold;
    pointer-events:none;
    animation:floatUp 1s ease-out;
    left:${Math.random() * 100 - 50}px;
  `;
  container.appendChild(dmgEl);
  
  setTimeout(() => dmgEl.remove(), 1000);
}

function bossFightVictory() {
  const boss = gameState.bossFights.active;
  const location = gameState.locations.find(l => l.id === boss.locationId);
  
  // Unlock location
  location.unlocked = true;
  
  // Give rewards
  const rewardCash = location.unlockCost * gameBalance.bossFightRewardMultiplier;
  gameState.cash += rewardCash;
  
  // Record victory
  gameState.bossFights.history[boss.locationId] = {
    defeated: true,
    time: Date.now(),
    timeRemaining: boss.timeRemaining
  };
  
  // Clear active boss
  gameState.bossFights.active = null;
  
  // Show victory message
  showNotification(`🎉 Victory! ${location.name} unlocked! +$${rewardCash}`);
  
  // Close modal
  document.getElementById('bossFightModal').style.display = 'none';
  
  // Refresh locations UI
  renderLocations();
}

function bossFightDefeat() {
  const boss = gameState.bossFights.active;
  
  // Clear active boss
  gameState.bossFights.active = null;
  
  // Show defeat message
  showNotification(`💀 Defeat! Train harder and try again.`);
  
  // Close modal
  document.getElementById('bossFightModal').style.display = 'none';
}


// ============================================
// 4. SOCIAL FEED CONTEXT INTEGRATION
// ============================================

// Modify buildChatPrompt to include social context
function buildChatPrompt(emp, conversationHistory, lastMessage) {
  // ... existing code ...
  
  // Get employee's recent posts
  const myRecentPosts = (gameState.socialFeed || [])
    .filter(p => p.authorId === emp.id)
    .slice(-5) // Last 5 posts
    .map(p => {
      const imageNote = p.imageUrl ? ' [with image]' : '';
      return `I recently posted${imageNote}: "${p.content}"`;
    });
  
  // Get posts from other employees that this employee might know about
  const coworkerPosts = (gameState.socialFeed || [])
    .filter(p => p.authorId !== emp.id)
    .slice(-10) // Last 10 posts from others
    .map(p => {
      const author = gameState.employees.find(e => e.id === p.authorId);
      if (!author) return null;
      
      const imageNote = p.imageUrl ? ' with photo' : '';
      return `${author.name} posted${imageNote}: "${p.content}"`;
    })
    .filter(Boolean);
  
  // Check if player is asking about a post
  const askingAboutPost = /post|posted|saw|photo|picture|image/i.test(lastMessage);
  
  const contextFacts = [
    `You are ${emp.name}, ${emp.position} at the company.`,
    `Current relationship stats: ${mood}`,
    
    // Add social context
    ...(myRecentPosts.length > 0 ? ['', '=== MY RECENT POSTS ===', ...myRecentPosts] : []),
    ...(askingAboutPost && coworkerPosts.length > 0 ? ['', '=== RECENT OFFICE POSTS ===', ...coworkerPosts.slice(-5)] : []),
    
    // Relevant memories
    ...relevant.slice(0, 20).map(i => `Remember: ${i.text}`)
  ].join('\n');
  
  // ... rest of function ...
}


// ============================================
// 5. IMPROVED IMAGE-CAPTION COHESION
// ============================================

// Store consistent appearance for each employee
function generateEmployeeAppearance(employee) {
  const ages = [22, 24, 25, 26, 28, 29, 30, 32, 35];
  const age = ages[Math.floor(Math.random() * ages.length)];
  
  const ethnicities = ['Caucasian', 'Asian', 'African American', 'Hispanic', 'Middle Eastern'];
  const ethnicity = ethnicities[Math.floor(Math.random() * ethnicities.length)];
  
  const hairColors = ['blonde', 'brown', 'black', 'red', 'dark brown'];
  const hairStyles = ['long', 'short', 'medium-length', 'shoulder-length'];
  
  const builds = ['slim', 'athletic', 'curvy', 'average', 'fit'];
  const styles = ['professional', 'casual chic', 'trendy', 'business casual'];
  
  employee.appearance = {
    age: age,
    gender: employee.gender || 'female',
    ethnicity: ethnicity[Math.floor(Math.random() * ethnicity.length)],
    hair: `${hairStyles[Math.floor(Math.random() * hairStyles.length)]} ${hairColors[Math.floor(Math.random() * hairColors.length)]} hair`,
    build: builds[Math.floor(Math.random() * builds.length)],
    style: styles[Math.floor(Math.random() * styles.length)],
    
    // Generate full description string
    toString() {
      return `${this.age} year old ${this.ethnicity} ${this.gender}, ${this.hair}, ${this.build} build, ${this.style} style`;
    }
  };
  
  return employee.appearance;
}

// Improved image generation for social posts
async function generateSocialPostWithImage(employee, caption, postType) {
  // Ensure employee has appearance
  if (!employee.appearance) {
    generateEmployeeAppearance(employee);
  }
  
  // Build detailed image prompt
  const baseAppearance = employee.appearance.toString();
  
  // Extract scene from caption
  const sceneAnalysis = await generateText(`
    Extract the main visual scene from this caption for image generation.
    Focus on: location, activity, mood, specific visual details.
    
    Caption: "${caption}"
    
    Respond with just a brief scene description (1-2 sentences):
  `);
  
  // Combine for final prompt
  const imagePrompt = `
    High quality photo of ${baseAppearance}.
    Scene: ${sceneAnalysis.trim()}
    Photography style: ${postType === 'selfie' ? 'casual selfie angle' : 'social media photo'}
    Make sure the image clearly depicts: ${sceneAnalysis.trim()}
  `.trim();
  
  // Generate image
  const imageUrl = await generateImage({ prompt: imagePrompt });
  
  return {
    imageUrl: imageUrl,
    imagePrompt: imagePrompt,
    appearance: baseAppearance
  };
}


// ============================================
// 6. NPC RELATIONSHIP TRACKING
// ============================================

// Initialize relationships for all employees
function initializeEmployeeRelationships() {
  for (const emp of gameState.employees) {
    if (!emp.relationships) emp.relationships = {};
    
    // Create relationships with other employees
    for (const other of gameState.employees) {
      if (emp.id === other.id) continue;
      if (emp.relationships[other.id]) continue;
      
      // Determine initial relationship
      const sameLocation = emp.locationId === other.locationId;
      const similarInterests = hasSharedInterests(emp, other);
      
      let relationshipType = 'neutral';
      let relationshipLevel = 30;
      
      if (sameLocation) relationshipLevel += 20;
      if (similarInterests) relationshipLevel += 15;
      
      // Random relationship type
      const rand = Math.random();
      if (relationshipLevel > 60) {
        relationshipType = rand < 0.7 ? 'friend' : (rand < 0.9 ? 'crush' : 'close_friend');
      } else if (relationshipLevel < 40) {
        relationshipType = rand < 0.8 ? 'neutral' : 'dislikes';
      } else {
        relationshipType = 'neutral';
      }
      
      emp.relationships[other.id] = {
        knows: sameLocation || Math.random() < 0.5,
        relationship: relationshipType,
        sharedEvents: [],
        relationshipLevel: relationshipLevel,
        lastInteraction: Date.now()
      };
    }
  }
}

function hasSharedInterests(emp1, emp2) {
  if (!emp1.hobbies || !emp2.hobbies) return false;
  return emp1.hobbies.some(h => emp2.hobbies.includes(h));
}

// When player mentions another employee in chat
function handleCoworkerMention(currentEmp, mentionedEmpName, lastMessage) {
  const mentionedEmp = gameState.employees.find(e => 
    e.name.toLowerCase().includes(mentionedEmpName.toLowerCase())
  );
  
  if (!mentionedEmp) return [];
  
  const rel = currentEmp.relationships?.[mentionedEmp.id];
  if (!rel || !rel.knows) {
    return [`I don't really know ${mentionedEmp.name} that well.`];
  }
  
  // Build context about the mentioned employee
  const context = [
    `About ${mentionedEmp.name} (${mentionedEmp.position}):`,
    `Our relationship: ${rel.relationship} (${rel.relationshipLevel}%)`,
  ];
  
  if (rel.sharedEvents.length > 0) {
    context.push(`Shared memories: ${rel.sharedEvents.slice(-3).join(', ')}`);
  }
  
  // Add recent posts from mentioned employee
  const theirPosts = gameState.socialFeed
    .filter(p => p.authorId === mentionedEmp.id)
    .slice(-3)
    .map(p => `${mentionedEmp.name} recently posted: "${p.content}"`);
  
  if (theirPosts.length > 0) {
    context.push(...theirPosts);
  }
  
  return context;
}


// ============================================
// CSS ANIMATIONS TO ADD
// ============================================

const cssAnimations = `
<style>
@keyframes floatUp {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-100px);
  }
}

#bossClickBtn:active {
  transform: scale(0.95);
}

.boss-hit {
  animation: bossShake 0.3s;
}

@keyframes bossShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
</style>
`;


// ============================================
// UTILITY FUNCTIONS
// ============================================

// Better notification system
function showNotification(message, duration = 3000, type = 'info') {
  const notif = document.createElement('div');
  const colors = {
    info: '#00d4ff',
    success: '#4ecca3',
    error: '#e94560',
    warning: '#ffa500'
  };
  
  notif.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: ${colors[type]};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    z-index: 999999;
    animation: slideIn 0.3s ease-out;
    max-width: 300px;
  `;
  notif.textContent = message;
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notif.remove(), 300);
  }, duration);
}

// Save game with timestamp
function saveGameWithBackup() {
  const timestamp = new Date().toISOString();
  const saveData = JSON.stringify(gameState);
  
  // Save current
  localStorage.setItem('gameState', saveData);
  
  // Keep a backup
  localStorage.setItem('gameState_backup', saveData);
  localStorage.setItem('gameState_backup_time', timestamp);
  
  showNotification('Game saved!', 2000, 'success');
}

// Generate unique IDs
function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
