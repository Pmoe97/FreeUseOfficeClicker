// ============================================================================
// 44-boss-fights — Boss fights: fight state, difficulty, startBossFight, combat actions, reaction minigames, victory/defeat, recruitment, rematch, discord promo.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

let bh = null, wh = null, xh = null, kh = null, Sh = {};
const Th = { easy: { reactionWindowMultiplier: 2, damageReceivedMultiplier: 0.5, damageDealtMultiplier: 1.5, showHints: true, timeBonus: 30 }, normal: { reactionWindowMultiplier: 1, damageReceivedMultiplier: 1, damageDealtMultiplier: 1, showHints: false, timeBonus: 0 }, hard: { reactionWindowMultiplier: 0.7, damageReceivedMultiplier: 1.5, damageDealtMultiplier: 0.8, showHints: false, timeBonus: -15 } };
async function $h(e) {
  const t = Object.values(gameState.bossFights?.generatedBosses || {}).find((t2) => t2.id === e);
  if (!t || !t.character || "function" != typeof queuedGenerateImage) return void console.warn("[Boss Images] Cannot queue images - boss not generated or missing character:", e);
  console.log(`[Boss Images] Queueing images for ${t.character.firstName} ${t.character.lastName}`), gameState.bossImages || (gameState.bossImages = {}), gameState.bossImages[e] || (gameState.bossImages[e] = {});
  const n = ["idle", "portrait", "defeated"];
  for (const a of n) gameState.bossImages[e][a]?.url ? console.log(`[Boss Images] ${a} already cached for ${e}`) : queuedGenerateImage(applyImageStyle(je(t, a)), `Boss ${t.character.firstName} - ${a}`).then((n2) => {
    n2 && (gameState.bossImages[e] || (gameState.bossImages[e] = {}), gameState.bossImages[e][a] = { url: n2, generated: true, timestamp: Date.now() }, console.log(`[Boss Images] Generated ${a} for ${t.character.firstName}`));
  }).catch((t2) => {
    console.error(`[Boss Images] Failed to generate ${a} for ${e}:`, t2);
  });
}
function Ch(e, t = "idle") {
  return gameState.bossImages?.[e]?.[t]?.url ? gameState.bossImages[e][t].url : null;
}
function onLocationUnlocked(e) {
  "function" == typeof generateUniqueBoss && generateUniqueBoss(e).then((t2) => {
    t2 && console.log(`[Boss System] Generated boss for newly unlocked ${e}:`, t2.character?.firstName);
  }).catch((t2) => console.warn(`[Boss System] Failed to generate boss for ${e}:`, t2));
  const t = gameState.locations.findIndex((t2) => t2.id === e);
  if (t >= 0 && t < gameState.locations.length - 1) {
    const e2 = gameState.locations[t + 1];
    e2 && !gameState.bossFights?.generatedBosses?.[e2.id] && setTimeout(() => {
      generateUniqueBoss(e2.id).then((t2) => {
        t2 && console.log(`[Boss System] Pre-generated NEXT boss for ${e2.id}:`, t2.character?.firstName);
      }).catch((e3) => console.warn("[Boss System] Failed to pre-generate next boss:", e3));
    }, 5e3);
  }
}
function initializeBossImages() {
  if ("function" != typeof generateUniqueBoss) return void console.warn("[Boss System] generateUniqueBoss not available");
  const e = gameState.locations.filter((e2) => e2.unlocked), t = gameState.locations.findIndex((t2) => t2.id === e[e.length - 1]?.id);
  for (let e2 = 1; e2 <= 2; e2++) {
    const n = t + e2;
    if (n < gameState.locations.length) {
      const t2 = gameState.locations[n];
      t2 && !gameState.bossFights?.generatedBosses?.[t2.id] && (console.log(`[Boss System] Pre-generating boss ${e2} for location: ${t2.id}`), setTimeout(() => {
        generateUniqueBoss(t2.id).then((e3) => {
          e3 && console.log(`[Boss System] Boss ready for ${t2.id}:`, e3.character?.firstName);
        }).catch((e3) => console.warn(`[Boss System] Failed to pre-generate boss for ${t2.id}:`, e3));
      }, 3e3 * (e2 - 1)));
    }
  }
  1 === e.length && "garage" === e[0].id && (gameState.bossFights?.generatedBosses?.home_office || generateUniqueBoss("home_office").then((e2) => {
    e2 && console.log("[Boss System] First boss ready:", e2.character?.firstName);
  }).catch((e2) => console.warn("[Boss System] Failed to generate first boss:", e2)));
}
function Eh(e) {
  const t = Fe[e];
  if (!t) return { canFight: false, reason: "no_boss" };
  if (gameState.bossFights.defeated.includes(t.id)) return { canFight: false, reason: "already_defeated" };
  const n = gameState.bossFights.lastAttempts?.[t.id];
  if (n && "victory" !== n.result) {
    const e2 = 864e5, t2 = n.timestamp + e2, a = gameState.time?.currentTime || Date.now();
    if (a < t2) return { canFight: false, reason: "cooldown", cooldownRemaining: t2 - a, cooldownEnd: t2 };
  }
  return { canFight: true, boss: t };
}
function Ih(e) {
  const t = Math.floor(e / 36e5), n = Math.floor(e % 36e5 / 6e4);
  return t > 0 ? `${t}h ${n}m` : `${n}m`;
}
function Mh() {
  const e = gameState.globalUpgrades?.clickPower || 0, t = parseFloat(calculateCashPerSecond()) || 0, n = gameState.employees || [];
  let a = 0;
  n.forEach((e2) => {
    const t2 = ((e2.stats?.trust || 0) + (e2.stats?.friendship || 0) + (e2.stats?.desire || 0)) / 3;
    a += 2 + 0.03 * t2;
  });
  const o = 50 + 10 * e, i = 0.1 * t, s = 1 + a / 100, r = gameState.influenceUpgrades?.bossWarrior || 0, l = (o + i) * s * (void 0 !== Cb && Cb.bossWarrior ? Cb.bossWarrior.effect(r) : 1);
  return { baseAttack: o, incomeBonus: i, teamPower: a, teamMultiplier: s, totalAttack: Math.max(1, l), employeeCount: n.length };
}
function Ph(e) {
  const t = gameState.prestigeLevel || 0, n = 1 + t + 0.5 * Math.pow(t, 2), a = 1 + 0.3 * t, o = 1 + 0.05 * t;
  return { health: Math.floor(e.combat.baseHealth * n), attackDamage: Math.floor(e.combat.baseAttackDamage * a), speedMultiplier: o, healthMultiplier: n, damageMultiplier: a, prestigeLevel: t };
}
async function startBossFight(e, t = {}) {
  let n = gameState.bossFights?.generatedBosses?.[e];
  if (n || "function" != typeof generateUniqueBoss || (showNotification("Generating unique boss...", "info"), n = await generateUniqueBoss(e)), !n) return void showNotification("No boss configured for this location!");
  if (!(n.character && n.character.firstName || (console.warn("[Boss Fight] Boss missing character data, regenerating..."), n = await generateUniqueBoss(e, true), n && n.character))) return void showNotification("Failed to generate boss character!");
  if (n.combat || (console.warn("[Boss Fight] Boss missing combat data, using defaults"), n.combat = { baseHealth: 1e5, baseAttackDamage: 20, attackInterval: 2500, timeLimit: 120, attacks: [{ id: "basic_attack", name: "Attack", type: "quick", damage: 15, indicator: "yellow", reactionWindow: 1400, correctResponse: ["parry", "block"], animation: "attack_quick", dialogueOptions: ["Take this!"], telegraph: "\u26A1 PARRY or BLOCK!" }, { id: "heavy_strike", name: "Heavy Strike", type: "heavy", damage: 35, indicator: "red", reactionWindow: 2200, correctResponse: ["block", "dodge"], animation: "attack_heavy", dialogueOptions: ["Here it comes!"], telegraph: "\u{1F4A5} BLOCK or DODGE!" }, { id: "grab", name: "Grab", type: "grab", damage: 25, indicator: "purple", reactionWindow: 1800, correctResponse: ["mash"], mashRequired: 8, animation: "attack_grab", dialogueOptions: ["Got you!"], telegraph: "\u{1F517} MASH TO ESCAPE!" }], specialMove: { name: "Special Attack", trigger: { type: "health_percent", value: 50 }, effect: "damage_burst", damage: 20, dialogue: "Feel my power!" }, enrage: { trigger: { type: "health_percent", value: 25 }, speedMultiplier: 1.3, damageMultiplier: 1.5, dialogue: "You've made me angry!" } }), !t.isRematch) {
    const t2 = Eh(e);
    if (!t2.canFight) return void ("cooldown" === t2.reason ? showNotification(`You must wait ${Ih(t2.cooldownRemaining)} before challenging this boss again!`) : "already_defeated" === t2.reason && showNotification("You have already defeated this boss!"));
  }
  const a = Mh(), o = Ph(n), i = gameState.bossFightSettings?.difficulty || "normal", s = Th[i];
  bh = { boss: n, locationId: e, isRematch: t.isRematch || false, bossHealth: o.health, bossMaxHealth: o.health, bossAttackDamage: o.attackDamage, bossSpeedMultiplier: o.speedMultiplier, playerHealth: 100, playerMaxHealth: 100, playerAttack: a.totalAttack * s.damageDealtMultiplier, playerTeamMultiplier: a.teamMultiplier, playerEmployeeCount: a.employeeCount, specialCharge: 0, specialReady: false, timeRemaining: n.combat.timeLimit + s.timeBonus, startTime: Date.now(), perfectParries: 0, totalDamageDealt: 0, totalDamageTaken: 0, attacksBlocked: 0, attacksDodged: 0, attacksMissed: 0, currentAttack: null, isAttackActive: false, reactionStartTime: null, mashCount: 0, mashRequired: 0, currentPhase: 1, hasTriggeredSpecial: false, hasTriggeredEnrage: false, isEnraged: false, currentBossImage: "idle", lastDialogueTime: 0, difficulty: i, difficultyMod: s, isEnding: false };
  const r = document.getElementById("bossFightModal");
  if (r) {
    r.style.display = "flex";
    const e2 = document.getElementById("bossFightContainer");
    gameState.bossFightSettings?.largerButtons && e2.classList.add("larger-buttons"), gameState.bossFightSettings?.highContrastIndicators && e2.classList.add("high-contrast-indicators");
  }
  Qh();
  const l = Ch(n.id, "idle"), c = document.getElementById("bossImage"), d = document.getElementById("bossImagePlaceholder");
  l ? (c.src = l, c.style.display = "block", d.style.display = "none") : (d.style.display = "flex", c.style.display = "none", queuedGenerateImage(applyImageStyle(je(n, "idle")), `Boss ${n.character.firstName} - idle`).then((e2) => {
    e2 && bh && (c.src = e2, c.style.display = "block", d.style.display = "none", gameState.bossImages || (gameState.bossImages = {}), gameState.bossImages[n.id] || (gameState.bossImages[n.id] = {}), gameState.bossImages[n.id].idle = { url: e2, generated: true });
  }));
  const p = n.dialogue.intro[Math.floor(Math.random() * n.dialogue.intro.length)];
  document.getElementById("bossDialogue").textContent = `"${p}"`, document.getElementById("combatLog").innerHTML = '<div style="color:var(--d);">\u2694\uFE0F Combat begins!</div>', o.prestigeLevel > 0 && Xh(`\u2B50 Prestige ${o.prestigeLevel}: Boss +${Math.round(100 * (o.healthMultiplier - 1))}% HP`, "var(--z)"), gy(), Lh(), console.log("[Boss Fight] Started:", { boss: n.character.firstName, playerAttack: bh.playerAttack, bossHealth: bh.bossHealth, difficulty: i });
}
function Lh() {
  wh && clearInterval(wh);
  let e = Date.now();
  const t = bh.boss.combat.attackInterval / bh.bossSpeedMultiplier;
  wh = setInterval(() => {
    if (!bh || bh.isEnding) return void clearInterval(wh);
    if (bh.timeRemaining -= 1, document.getElementById("bossTimeRemaining").textContent = bh.timeRemaining, bh.timeRemaining <= 0) return void Zh("defeat", "Time ran out!");
    const n = Date.now();
    !bh.isAttackActive && n - e >= t && (_h(), e = n), Nh(), Qh();
  }, 1e3);
}
function Nh() {
  if (!bh) return;
  const e = bh.bossHealth / bh.bossMaxHealth * 100, t = bh.boss;
  if (!bh.hasTriggeredSpecial && t.combat.specialMove) {
    const n = t.combat.specialMove.trigger;
    "health_percent" === n.type && e <= n.value && (Yh(), bh.hasTriggeredSpecial = true);
  }
  if (!bh.hasTriggeredEnrage && t.combat.enrage) {
    const n = t.combat.enrage.trigger;
    "health_percent" === n.type && e <= n.value && (Wh(), bh.hasTriggeredEnrage = true);
  }
  if (e <= 50 && e > 25 && 1 === bh.currentPhase) {
    bh.currentPhase = 2;
    const e2 = t.dialogue.midFight[Math.floor(Math.random() * t.dialogue.midFight.length)];
    document.getElementById("bossDialogue").textContent = `"${e2}"`, Kh("damaged_light");
  }
  if (e <= 25 && 2 === bh.currentPhase) {
    bh.currentPhase = 3;
    const e2 = t.dialogue.lowHealth[Math.floor(Math.random() * t.dialogue.lowHealth.length)];
    document.getElementById("bossDialogue").textContent = `"${e2}"`, Kh("damaged_heavy");
  }
}
function _h() {
  if (!bh || bh.isAttackActive || bh.isEnding) return;
  const e = bh.boss, t = e.combat.attacks, n = t[Math.floor(Math.random() * t.length)];
  let a = n.reactionWindow;
  if (bh.isEnraged && (a /= e.combat.enrage.speedMultiplier), a *= bh.difficultyMod.reactionWindowMultiplier, a /= bh.bossSpeedMultiplier, bh.currentAttack = { ...n, adjustedWindow: a }, bh.isAttackActive = true, bh.reactionStartTime = Date.now(), "grab" === n.type && (bh.mashCount = 0, bh.mashRequired = n.mashRequired || 10), Rh(n, a), Kh("attack_" + ("grab" === n.type ? "grab" : "heavy" === n.type ? "heavy" : "quick")), n.dialogueOptions && Math.random() < 0.5) {
    const e2 = n.dialogueOptions[Math.floor(Math.random() * n.dialogueOptions.length)];
    document.getElementById("bossDialogue").textContent = `"${e2}"`;
  }
  Dh(a);
}
function Rh(e, t) {
  const n = document.getElementById("attackIndicatorOverlay"), a = document.getElementById("attackFlash"), o = document.getElementById("attackBorder"), i = document.getElementById("attackTypeIcon"), s = document.getElementById("attackTypeName"), r = document.getElementById("attackTelegraph"), l = document.getElementById("mashEscapeOverlay");
  n.style.display = "block";
  const c = { yellow: { bg: "rgba(241, 196, 15, 0.5)", border: "var(--eo)", icon: "\u26A1", color: "var(--eo)", glow: "0 0 60px rgba(241, 196, 15, 0.8)", telegraph: "\u26A1 PARRY or BLOCK! \u26A1" }, red: { bg: "rgba(233, 69, 96, 0.5)", border: "var(--l)", icon: "\u{1F4A5}", color: "var(--l)", glow: "0 0 60px rgba(233, 69, 96, 0.8)", telegraph: "\u{1F4A5} BLOCK or DODGE! \u{1F4A5}" }, purple: { bg: "rgba(155, 89, 182, 0.5)", border: "var(--ap)", icon: "\u{1F517}", color: "var(--ap)", glow: "0 0 60px rgba(155, 89, 182, 0.8)", telegraph: "\u{1F517} MASH TO ESCAPE! \u{1F517}" } }, d = c[e.indicator] || c.yellow;
  if ("grab" === e.type) l.style.display = "flex", n.style.display = "none", document.getElementById("mashCounter").textContent = `0 / ${bh.mashRequired}`, document.getElementById("bossFightContainer").style.animation = "mashShake 0.15s infinite";
  else {
    l.style.display = "none", a.style.background = d.bg, a.style.opacity = "1", o.style.borderColor = d.border, o.style.boxShadow = d.glow, o.style.animation = "pulseBorder 0.4s ease-in-out infinite", i.textContent = d.icon, i.style.color = d.color, i.style.animation = "iconBounce 0.5s ease-in-out infinite", s.textContent = e.name.toUpperCase(), s.style.color = d.color;
    const t2 = e.telegraph || d.telegraph;
    r.textContent = t2, r.style.borderColor = d.border, r.style.boxShadow = `0 0 20px ${d.border}`;
    const n2 = document.getElementById("bossImageArea");
    n2.classList.remove("attack-yellow", "attack-red", "attack-purple"), n2.classList.add(`attack-${e.indicator}`), document.getElementById("bossFightContainer").style.animation = "none", setTimeout(() => {
      document.getElementById("bossFightContainer").style.animation = "";
    }, 50);
  }
}
function Dh(e) {
  const t = document.getElementById("reactionTimerBar"), n = Date.now();
  kh && clearInterval(kh), t.style.width = "100%", t.style.transition = "none", kh = setInterval(() => {
    if (!bh || !bh.isAttackActive) return void clearInterval(kh);
    const a = Date.now() - n, o = Math.max(0, 1 - a / e);
    t.style.width = 100 * o + "%", o < 0.3 && !t.classList.contains("urgent") ? (t.classList.add("urgent"), t.style.background = "linear-gradient(90deg, var(--l), var(--au))") : o >= 0.3 && t.classList.contains("urgent") && (t.classList.remove("urgent"), t.style.background = "linear-gradient(90deg, var(--n), var(--u))"), a >= e && (clearInterval(kh), t.classList.remove("urgent"), Gh());
  }, 16);
}
function bossCombatAction(e) {
  bh && !bh.isEnding && ("flee" !== e ? "special" !== e ? "grab" === bh.currentAttack?.type && bh.isAttackActive ? Bh() : bh.isAttackActive ? bh.currentAttack.correctResponse.includes(e) ? qh(e) : zh(e) : "attack" === e && Fh() : bh.specialReady && jh() : Vh());
}
function Bh() {
  if (!bh || !bh.isAttackActive) return;
  const e = Date.now();
  bh._lastMashTime || (bh._lastMashTime = 0), e - bh._lastMashTime < 50 || (bh._lastMashTime = e, bh.mashCount++, document.getElementById("mashCounter").textContent = `${bh.mashCount} / ${bh.mashRequired}`, document.getElementById("mashEscapeOverlay").style.background = `rgba(128,0,128,${0.3 + bh.mashCount / bh.mashRequired * 0.3})`, bh.mashCount >= bh.mashRequired && qh("mash"));
}
function Fh() {
  if (!bh) return;
  const e = 0.9 + 0.2 * Math.random(), t = Math.floor(bh.playerAttack * e);
  bh.bossHealth -= t, bh.totalDamageDealt += t, bh.specialCharge = Math.min(100, bh.specialCharge + 5), bh.specialCharge >= 100 && !bh.specialReady && (bh.specialReady = true, document.getElementById("specialBtn").classList.add("ready"), document.getElementById("specialBtn").disabled = false, Xh("\u2728 SPECIAL READY!", "var(--z)")), Jh(t, "var(--l)"), Xh(`\u2694\uFE0F Attack! ${wu(t)} damage`, "var(--l)"), bh.bossHealth <= 0 ? Zh("victory") : Qh();
}
function jh() {
  if (!bh || !bh.specialReady) return;
  const e = Math.floor(3 * bh.playerAttack);
  bh.bossHealth -= e, bh.totalDamageDealt += e, bh.specialCharge = 0, bh.specialReady = false, document.getElementById("specialBtn").classList.remove("ready"), document.getElementById("specialBtn").disabled = true, Jh(e, "var(--z)", true), Xh(`\u2728 SPECIAL ATTACK! ${wu(e)} damage!`, "var(--z)");
  const t = document.getElementById("bossFightContainer");
  t.style.boxShadow = "0 0 50px var(--z)", setTimeout(() => {
    t.style.boxShadow = "0 10px 50px rgba(233,69,96,0.4)";
  }, 300), bh.bossHealth <= 0 ? Zh("victory") : Qh();
}
function qh(e) {
  if (!bh) return;
  const t = bh.currentAttack;
  Hh();
  const n = Date.now() - bh.reactionStartTime < 0.3 * t.adjustedWindow;
  if ("parry" === e || "mash" === e) {
    let t2 = Math.floor(1.5 * bh.playerAttack);
    if (n && "parry" === e) {
      t2 = Math.floor(2.5 * bh.playerAttack), bh.perfectParries++, bh.specialCharge = Math.min(100, bh.specialCharge + 15), Jh(t2, "var(--ap)", true), Xh(`\u26A1 PERFECT PARRY! ${wu(t2)} counter damage!`, "var(--ap)");
      const e2 = bh.boss.dialogue.playerParry[Math.floor(Math.random() * bh.boss.dialogue.playerParry.length)];
      document.getElementById("bossDialogue").textContent = `"${e2}"`;
    } else Jh(t2, "var(--ap)"), Xh(`\u26A1 ${"mash" === e ? "Escaped!" : "Parry!"} ${wu(t2)} counter damage`, "var(--ap)");
    bh.bossHealth -= t2, bh.totalDamageDealt += t2;
  } else if ("block" === e) {
    const e2 = Math.floor(0.3 * t.damage * bh.difficultyMod.damageReceivedMultiplier);
    bh.playerHealth -= e2, bh.totalDamageTaken += e2, bh.attacksBlocked++, bh.specialCharge = Math.min(100, bh.specialCharge + 3), Xh(`\u{1F6E1}\uFE0F Blocked! Only -${e2}% HP`, "var(--bl)");
  } else if ("dodge" === e) {
    bh.attacksDodged++, bh.specialCharge = Math.min(100, bh.specialCharge + 5), Xh("\u{1F4A8} Dodged!", "var(--cp)");
    const e2 = bh.boss.dialogue.playerDodge[Math.floor(Math.random() * bh.boss.dialogue.playerDodge.length)];
    document.getElementById("bossDialogue").textContent = `"${e2}"`;
  }
  if (bh.specialCharge >= 100 && !bh.specialReady && (bh.specialReady = true, document.getElementById("specialBtn").classList.add("ready"), document.getElementById("specialBtn").disabled = false, Xh("\u2728 SPECIAL READY!", "var(--z)")), bh.bossHealth <= 0) return void Zh("victory");
  if (bh.playerHealth <= 0) return void Zh("defeat", "Your health reached zero!");
  const a = document.getElementById("bossFightContainer");
  a.classList.add("correct-response"), setTimeout(() => a.classList.remove("correct-response"), 300), Kh("idle"), Qh();
}
function zh(e) {
  if (!bh) return;
  const t = bh.currentAttack;
  Hh();
  const n = Math.floor(t.damage * bh.difficultyMod.damageReceivedMultiplier), a = bh.isEnraged ? bh.boss.combat.enrage.damageMultiplier : 1, o = Math.floor(n * a);
  bh.playerHealth -= o, bh.totalDamageTaken += o, bh.attacksMissed++, Xh(`\u274C Wrong move! -${o}% HP`, "var(--l)");
  const i = bh.boss.dialogue.playerHit[Math.floor(Math.random() * bh.boss.dialogue.playerHit.length)];
  document.getElementById("bossDialogue").textContent = `"${i}"`;
  const s = document.getElementById("bossFightContainer");
  s.classList.add("wrong-response"), setTimeout(() => s.classList.remove("wrong-response"), 300), bh.playerHealth <= 0 ? Zh("defeat", "Your health reached zero!") : (Kh("confident"), Qh());
}
function Gh() {
  bh && bh.isAttackActive && zh("none");
}
function Hh() {
  kh && (clearInterval(kh), kh = null), bh && (bh.isAttackActive = false, bh.currentAttack = null), document.getElementById("attackIndicatorOverlay").style.display = "none", document.getElementById("mashEscapeOverlay").style.display = "none", document.getElementById("attackFlash").style.opacity = "0";
  const e = document.getElementById("bossImageArea");
  e && e.classList.remove("attack-yellow", "attack-red", "attack-purple");
  const t = document.getElementById("bossFightContainer");
  t && (t.style.animation = "");
  const n = document.getElementById("reactionTimerBar");
  n && (n.classList.remove("urgent"), n.style.background = "linear-gradient(90deg, var(--n), var(--u))");
}
function Yh() {
  if (!bh) return;
  const e = bh.boss.combat.specialMove;
  Xh(`\u26A0\uFE0F ${e.name}!`, "var(--z)"), document.getElementById("bossDialogue").textContent = `"${e.dialogue}"`, Kh("attack_special"), "hide_indicators" === e.effect && (document.getElementById("attackIndicatorOverlay").style.opacity = "0.3", setTimeout(() => {
    bh && (document.getElementById("attackIndicatorOverlay").style.opacity = "1", Xh("Indicators restored!", "var(--n)"));
  }, e.duration));
  const t = document.getElementById("bossFightContainer");
  t.style.border = "2px solid var(--m)", setTimeout(() => {
    t && (t.style.border = "2px solid var(--k)");
  }, 1e3);
}
function Wh() {
  if (!bh) return;
  const e = bh.boss.combat.enrage;
  bh.isEnraged = true, Xh("\u{1F525} BOSS ENRAGED!", "var(--l)"), document.getElementById("bossDialogue").textContent = `"${e.dialogue}"`, document.getElementById("bossFightContainer").style.boxShadow = "0 0 30px rgba(233,69,96,0.8)", Kh("confident");
}
async function Vh() {
  bh && !bh.isEnding && await Ev("Are you sure you want to flee? This counts as a loss and you'll have to wait to try again.", "Flee Battle?", { type: "warning", confirmText: "Flee" }) && Zh("flee", "You fled from battle!");
}
function Kh(e) {
  if (!bh) return;
  const t = Ch(bh.boss.id, e);
  if (t) {
    const n = document.getElementById("bossImage");
    n.src = t, n.style.display = "block", document.getElementById("bossImagePlaceholder").style.display = "none", bh.currentBossImage = e;
  }
}
function Jh(e, t, n = false) {
  const a = document.getElementById("damageNumbersContainer");
  if (!a) return;
  const o = document.createElement("div");
  o.textContent = n ? `\u{1F4A5}${wu(e)}` : wu(e), o.style.cssText = `
      position: absolute;
      top: ${30 + 40 * Math.random()}%;
      left: ${20 + 60 * Math.random()}%;
      color: ${t};
      font-size: ${n ? "2rem" : "1.5rem"};
      font-weight: bold;
      text-shadow: 0 0 10px ${t}, 0 0 20px black;
      pointer-events: none;
      animation: damageFloat 1s ease-out forwards;
      z-index: 20;
    `, a.appendChild(o), setTimeout(() => o.remove(), 1e3);
}
function Qh() {
  if (!bh) return;
  const e = Math.max(0, bh.bossHealth / bh.bossMaxHealth * 100), t = Math.max(0, bh.playerHealth), n = bh.specialCharge;
  document.getElementById("bossHealthBar").style.width = `${e}%`, document.getElementById("bossHealthText").textContent = `${Math.floor(e)}%`, document.getElementById("playerHealthBar").style.width = `${t}%`, document.getElementById("playerHealthText").textContent = `${Math.floor(t)}%`, document.getElementById("specialChargeBar").style.width = `${n}%`, document.getElementById("specialChargeText").textContent = `${Math.floor(n)}%`, document.getElementById("playerAttackDisplay").textContent = wu(Math.floor(bh.playerAttack)), document.getElementById("playerTeamDisplay").textContent = `+${Math.floor(100 * (bh.playerTeamMultiplier - 1))}%`, document.getElementById("bossName").textContent = `${bh.boss.character.firstName} ${bh.boss.character.lastName}`, document.getElementById("bossTitle").textContent = bh.boss.character.title, document.getElementById("bossNameLabel").textContent = bh.boss.character.firstName;
}
function Xh(e, t = "var(--ar)") {
  const n = document.getElementById("combatLog");
  if (!n) return;
  const a = document.createElement("div");
  for (a.style.color = t, a.textContent = e, n.appendChild(a), n.scrollTop = n.scrollHeight; n.children.length > 15; ) n.removeChild(n.firstChild);
}
function Zh(e, t = "") {
  if (!bh || bh.isEnding) return;
  bh.isEnding = true, wh && clearInterval(wh), kh && clearInterval(kh), xh && clearTimeout(xh), Hh(), document.removeEventListener("keydown", py);
  const n = bh.boss, a = Math.floor((Date.now() - bh.startTime) / 1e3), o = { bossId: n.id, result: e, timestamp: gameState.time?.currentTime || Date.now(), duration: a, perfectParries: bh.perfectParries, totalDamageDealt: bh.totalDamageDealt, totalDamageTaken: bh.totalDamageTaken, difficulty: bh.difficulty };
  gameState.bossFights.history.push(o), bh.isRematch || (gameState.bossFights.lastAttempts || (gameState.bossFights.lastAttempts = {}), gameState.bossFights.lastAttempts[n.id] = { timestamp: gameState.time?.currentTime || Date.now(), result: e }), "victory" === e ? ey(a) : ty(t), saveGame();
}
function ey(e) {
  const t = bh.boss, n = ny();
  document.getElementById("bossFightModal").style.display = "none", document.getElementById("bossVictoryModal").style.display = "flex";
  const a = Ch(t.id, "defeated") || Ch(t.id, "damaged_heavy") || Ch(t.id, "idle");
  document.getElementById("victoryBossImage").src = a || "";
  const o = t.dialogue.defeated[Math.floor(Math.random() * t.dialogue.defeated.length)];
  document.getElementById("victoryDialogue").textContent = `"${o}"`, document.getElementById("victoryDuration").textContent = `${e}s`, document.getElementById("victoryParries").textContent = bh.perfectParries, document.getElementById("victoryDamage").textContent = wu(bh.totalDamageDealt), document.getElementById("victoryGrade").textContent = n;
  const i = oy();
  document.getElementById("bountyAmountPreview").textContent = `$${wu(i)} Cash Reward`;
  const s = t.recruitment;
  document.getElementById("recruitBonusPreview").textContent = `${s.passiveBonus.description} | ${s.activeAbility.name}`;
  const r = ay(t), l = document.getElementById("recruitBossBtn");
  if (r.canRecruit ? (l.disabled = false, l.style.opacity = "1") : (l.disabled = true, l.style.opacity = "0.5", l.querySelector("div:last-child").textContent = r.reason), bh.victoryData = { duration: e, grade: n, cashReward: i }, "function" == typeof Xn) try {
    Xn(t.id, false);
  } catch (e2) {
    console.warn("[Story] Boss defeat hook error:", e2);
  }
}
function ty(e) {
  const t = bh.boss;
  document.getElementById("bossFightModal").style.display = "none", document.getElementById("bossDefeatModal").style.display = "flex";
  const n = Ch(t.id, "confident") || Ch(t.id, "idle");
  document.getElementById("defeatBossImage").src = n || "";
  const a = t.dialogue.playerLoss[Math.floor(Math.random() * t.dialogue.playerLoss.length)];
  document.getElementById("defeatDialogue").textContent = `"${a}"`, document.getElementById("defeatCooldownTime").textContent = "24 hours";
  const o = [];
  bh.attacksMissed > bh.attacksBlocked + bh.attacksDodged && o.push("\u2022 Practice timing - watch for attack indicators!"), bh.perfectParries < 3 && o.push("\u2022 Try parrying more - perfect parries deal bonus damage!"), o.push("\u2022 Upgrade Click Power for more damage"), o.push("\u2022 Hire more employees for team bonus"), document.getElementById("defeatTips").innerHTML = o.join("<br>"), showNotification(`Defeated by ${t.character.firstName}! Try again in 24 hours.`);
}
function ny() {
  if (!bh) return "C";
  let e = 0;
  e += Math.min(30, 5 * bh.perfectParries), e += bh.timeRemaining / bh.boss.combat.timeLimit * 30, e += bh.playerHealth / 100 * 20;
  const t = bh.attacksBlocked + bh.attacksDodged + bh.attacksMissed + bh.perfectParries;
  return t > 0 && (e += (t - bh.attacksMissed) / t * 20), e >= 90 ? "S" : e >= 80 ? "A" : e >= 65 ? "B" : e >= 50 ? "C" : "D";
}
function oy() {
  if (!bh) return 0;
  const e = bh.boss, t = gameState.prestigeLevel || 0, n = 1 + 2 * t + 1.5 * Math.pow(t, 2), a = e.rewards?.cashBase || 50 * (e.combat?.baseHealth || 5e3), o = e.rewards?.cashMultiplier || 3, i = 1 + 0.5 * (gameState.locations?.findIndex((e2) => e2.id === bh.locationId) || 0);
  return Math.floor(a * o * n * i);
}
function ay(e) {
  const t = e.recruitment.corporateLadderSlot;
  return gameState.employees.filter((e2) => e2.corporateLadderLevel === t).length >= 3 ? { canRecruit: false, reason: `No Level ${t} slot available` } : { canRecruit: true };
}
async function recruitDefeatedBoss() {
  if (!bh?.victoryData) return;
  const e = bh.boss, t = bh.locationId;
  if (!await Ev(`Recruit ${e.character.firstName} ${e.character.lastName}?

Role: ${e.recruitment.employeeStats.role}
Passive: ${e.recruitment.passiveBonus.description}
Active: ${e.recruitment.activeAbility.description}`, "Recruit Boss?", { confirmText: "Recruit!" })) return;
  gameState.bossFights.recruited || (gameState.bossFights.recruited = []), gameState.bossFights.recruited.includes(e.id) || gameState.bossFights.recruited.push(e.id), gameState.bossFights.defeated.includes(e.id) || gameState.bossFights.defeated.push(e.id), iy();
  const n = sy(e);
  gameState.employees.push(n);
  const a = gameState.products.find((e2) => e2.locationId === t && 0 === e2.unlockCost);
  if (a) {
    a.managerHired = true, a.managerId = n.id, a.managerLevel = 1, a.managerOnboarding = false, n.productManaged = a.name, n.productId = a.id, "function" == typeof Od && Od();
    const t2 = gameState.corporatePyramid?.positions?.[1]?.find((e2) => e2.productId === a.id);
    if (t2) {
      t2.employeeId = n.id, t2.isVacant = false;
      const o = gameState.hierarchyLevels?.[1] || { title: "Staff", baseSalary: 1e5 };
      n.career = { level: 1, xp: 0, role: n.role || e.recruitment.employeeStats.role, title: o.title, salary: o.baseSalary }, n.corporateLadderLevel = 1, n.position = `${o.title} \u2013 ${a.name}`, console.log(`[Boss Recruit] Assigned ${n.name} to ${t2.title} managing ${a.name}`);
    } else console.log(`[Boss Recruit] No staff position found for product ${a.id}, but employee added to roster`);
  }
  if (showNotification(`${e.character.firstName} has joined your company!`), "function" == typeof Xn) try {
    Xn(e.id, true);
  } catch (e2) {
    console.warn("[Story] Boss recruit hook error:", e2);
  }
  closeBossVictoryModal(), saveGame(), updateUI(), "function" == typeof updateBusinessTab && updateBusinessTab(), "function" == typeof updatePeopleTab && updatePeopleTab();
}
function claimBossBounty() {
  if (!bh?.victoryData) return;
  const e = bh.boss, t = bh.victoryData.cashReward;
  gameState.bossFights.defeated.includes(e.id) || gameState.bossFights.defeated.push(e.id), "function" == typeof remember && gameState.employees.forEach((t2) => {
    "active" === t2.employmentStatus && remember(t2, `The boss just defeated ${e.name || "a rival boss"} \u2014 the whole office is buzzing about it`, "event", 1.3);
  });
  const n = "number" != typeof t || isNaN(t) ? 0 : t;
  gameState.cash = (gameState.cash || 0) + n, gameState.rehirePool || (gameState.rehirePool = []);
  const a = { id: `boss_${e.id}_rehire`, originalRehireId: `boss_${e.id}_rehire`, name: `${e.character.firstName} ${e.character.lastName}`, age: e.character.age || 30, gender: e.appearance?.gender || "female", previousLevel: e.recruitment?.corporateLadderSlot || 2, previousTitle: e.recruitment?.employeeStats?.role || "Executive", stats: { productivity: e.recruitment?.employeeStats?.productivity || 80, affection: 40, comfort: 50, trust: 60, friendship: 40 }, skills: e.recruitment?.employeeStats?.skills || {}, personality: { confidence: 70 + Math.floor(25 * Math.random()), outgoing: 40 + Math.floor(40 * Math.random()), flirty: 20 + Math.floor(50 * Math.random()), professional: 50 + Math.floor(40 * Math.random()) }, physical: { bodyType: e.appearance?.body?.type || "athletic", height: e.appearance?.body?.height || "average", hairColor: e.appearance?.hair?.color || "dark", hairStyle: e.appearance?.hair?.style || "styled", eyeColor: e.appearance?.eyes?.color || "brown", skinTone: e.appearance?.skin?.tone || e.appearance?.skin || "fair" }, personalityTraits: e.character?.personality?.traits || ["determined", "strong"], hobbies: e.character?.personality?.likes?.slice(0, 3) || ["competition", "leadership"], kinks: [], profileImage: Ch(e.id, "recruited") || Ch(e.id, "portrait"), bio: e.character.backstory || "A former rival boss who can be recruited to your team.", wasFormerBoss: true, originalBossId: e.id, passiveBonus: e.recruitment?.passiveBonus, activeAbility: e.recruitment?.activeAbility, rehireBonus: 0.15, timesRehired: 0, memory: [], chatHistory: [] };
  gameState.rehirePool.find((t2) => t2.originalBossId === e.id) || (gameState.rehirePool.push(a), console.log(`[Boss Bounty] Added ${a.name} to rehire pool for later recruitment`)), iy(), showNotification(`Claimed $${wu(n)} bounty! ${e.character.firstName} can be hired later from the rehire pool.`, "success", 5e3), closeBossVictoryModal(), saveGame(), updateUI();
}
function iy() {
  if (!bh) return;
  const e = gameState.locations.find((e2) => e2.id === bh.locationId);
  if (e) {
    e.unlocked = true, e.owned = true;
    const t = gameState.products.find((t2) => t2.locationId === e.id && 0 === t2.unlockCost);
    t && (t.unlocked = true);
    const n = gameState.locations.findIndex((t2) => t2.id === e.id) + 2;
    if (n < gameState.locations.length) {
      const t2 = gameState.locations[n];
      if ("function" != typeof generateUniqueBoss || gameState.bossFights?.generatedBosses?.[t2.id]) {
        const e2 = Fe[t2.id];
        e2 && $h(e2.id);
      } else console.log(`[Boss] Pre-generating boss N+2 for ${t2.id} after defeating boss at ${e.id}`), generateUniqueBoss(t2.id).then((e2) => {
        e2 && (console.log(`[Boss] Pre-generated future boss for ${t2.id}:`, e2.character?.firstName), e2.id && $h(e2.id));
      }).catch((e2) => console.warn(`[Boss] Failed to pre-generate future boss for ${t2.id}:`, e2));
    }
    "function" == typeof Od && Od();
  }
  saveGame(), "function" == typeof updateBusinessTab && updateBusinessTab();
}
function ry(e) {
  if (!e) return {};
  const t = {};
  for (const [n, a] of Object.entries(e)) "number" == typeof a ? t[n] = { level: a, xp: 0 } : "object" == typeof a && null !== a && (t[n] = { level: a.level || 0, xp: a.xp || 0 });
  return t;
}
function sy(e) {
  const t = e.character, n = e.recruitment, a = e.appearance, o = a?.gender || "female", i = { bodyType: a?.body?.type || "athletic", height: a?.body?.height || "average", hairColor: a?.hair?.color || "dark", hairStyle: a?.hair?.style || "styled", eyeColor: a?.eyes?.color || "brown", skinTone: a?.skin?.tone || a?.skin || "fair", face: a?.face || "attractive features", distinguishingFeatures: a?.distinguishingFeatures || [] }, s = { confidence: 70 + Math.floor(25 * Math.random()), outgoing: 40 + Math.floor(40 * Math.random()), flirty: 20 + Math.floor(50 * Math.random()), professional: 50 + Math.floor(40 * Math.random()), humor: 30 + Math.floor(40 * Math.random()) }, r = t.personality?.traits || ["determined", "strong"], l = { productivity: n.employeeStats?.productivity || 80, affection: 40 + Math.floor(20 * Math.random()), comfort: 50 + Math.floor(20 * Math.random()), trust: 60, friendship: 40, desire: 30, obedience: 30 + Math.floor(20 * Math.random()), exhibitionism: 20 + Math.floor(30 * Math.random()), submissiveness: 20 + Math.floor(30 * Math.random()) }, c = n.corporateLadderSlot || 1;
  return { id: `boss_${e.id}_${Date.now()}`, name: `${t.firstName} ${t.lastName}`, firstName: t.firstName, lastName: t.lastName, age: t.age || 30, gender: o, race: "human", ethnicity: a?.ethnicity || null, role: n.employeeStats.role, position: n.employeeStats.role, level: c, employmentStatus: "active", career: { level: c, xp: 0, role: n.employeeStats.role, title: n.employeeStats.role }, wasFormerBoss: true, originalBossId: e.id, canRematch: true, hired: true, corporateLadderLevel: c, salary: n.employeeStats.baseSalary, productivity: n.employeeStats.productivity, locationId: e.locationId, trust: 60, friendship: 40, desire: 30, stats: l, personality: s, personalityTraits: r, bossPersonality: t.personality, backstory: t.backstory, bio: t.backstory || `A former boss who joined after a legendary battle. ${r.join(", ")}.`, physical: i, hobbies: t.personality?.likes?.slice(0, 3) || ["competition", "leadership"], kinks: [], trait: r[0] || "Determined", skills: ry(n.employeeStats.skills), passiveBonus: n.passiveBonus, activeAbility: { ...n.activeAbility, lastUsed: 0 }, profileImage: Ch(e.id, "recruited") || Ch(e.id, "portrait"), bossGallery: { ...gameState.bossImages?.[e.id] }, originalFight: { duration: bh.victoryData.duration, perfectParries: bh.perfectParries, damageDealt: bh.totalDamageDealt, grade: bh.victoryData.grade }, hireDate: gameState.time?.currentTime || Date.now(), totalEarned: 0, interactions: 0, memory: [], speechStyle: t.speechStyle || null };
}
function closeBossVictoryModal() {
  document.getElementById("bossVictoryModal").style.display = "none", bh = null, setTimeout(maybeShowDiscordPromo, 600);
}
const ly = 2592e5, dy = "fuoc_discord_promo_optout", uy = "fuoc_discord_promo_last_shown";
function maybeShowDiscordPromo() {
  if ("1" === localStorage.getItem(dy)) return;
  const last = parseInt(localStorage.getItem(uy) || "0", 10);
  if (Date.now() - last < ly) return;
  localStorage.setItem(uy, String(Date.now()));
  const modal = document.getElementById("discordPromoModal");
  modal && (modal.style.display = "flex");
}
function closeDiscordPromoModal() {
  const modal = document.getElementById("discordPromoModal");
  modal && (modal.style.display = "none");
}
function openDiscordPromoLink() {
  window.open("https://discord.com/invite/E6N9WKpGPA", "_blank", "noopener,noreferrer"), closeDiscordPromoModal();
}
function dismissDiscordPromoForever() {
  localStorage.setItem(dy, "1"), closeDiscordPromoModal();
}
function closeBossDefeatModal() {
  document.getElementById("bossDefeatModal").style.display = "none", bh = null;
}
let py = null;
function gy() {
  py && document.removeEventListener("keydown", py), py = (e) => {
    if (bh && !bh.isEnding) switch (e.key.toLowerCase()) {
      case "q":
        e.preventDefault(), bossCombatAction("attack");
        break;
      case "w":
        e.preventDefault(), bossCombatAction("block");
        break;
      case "e":
        e.preventDefault(), bossCombatAction("parry");
        break;
      case "r":
        e.preventDefault(), bossCombatAction("dodge");
        break;
      case " ":
        e.preventDefault(), bossCombatAction("special");
        break;
      case "escape":
        e.preventDefault(), bossCombatAction("flee");
    }
  }, document.addEventListener("keydown", py);
}
async function startBossRematch(e) {
  const t = gameState.employees.find((t2) => t2.id === e);
  if (!t?.wasFormerBoss || !t.canRematch) return void showNotification("This employee cannot be rematched.");
  const n = Object.keys(Fe).find((e2) => Fe[e2].id === t.originalBossId);
  n ? await Ev(`Challenge ${t.firstName} to a friendly rematch?

This is just for fun - no rewards or penalties.

"${Fe[n].dialogue.rematch.intro[0]}"`, "Friendly Rematch", { confirmText: "Fight!" }) && startBossFight(n, { isRematch: true }) : showNotification("Boss data not found for rematch.");
}
function closeBossFight() {
  document.getElementById("bossFightModal").style.display = "none", wh && clearInterval(wh), kh && clearInterval(kh), py && document.removeEventListener("keydown", py), bh = null, updateUI();
}
function bossFightAttack() {
  bossCombatAction("attack");
}
async function bossFightRetreat() {
  bossCombatAction("flee");
}
function checkBossFightRequirements(e) {
  return Eh(e);
}
function hy(e) {
  const t = Fe[e];
  t && $h(t.id);
}
function yy(e) {
  hy(e);
}
