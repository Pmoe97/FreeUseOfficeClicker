// ============================================================================
// 44-boss-fights — Boss fights: fight state, difficulty, startBossFight, combat actions, reaction minigames, victory/defeat, recruitment, rematch, discord promo.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

let bossFightState = null,
    bossFightInterval = null,
    bossAttackTimeout = null,
    reactionTimerInterval = null,
    bossImageCache = {};
const difficultySettings = {
    easy: {
        reactionWindowMultiplier: 2,
        damageReceivedMultiplier: 0.5,
        damageDealtMultiplier: 1.5,
        showHints: !0,
        timeBonus: 30,
    },
    normal: {
        reactionWindowMultiplier: 1,
        damageReceivedMultiplier: 1,
        damageDealtMultiplier: 1,
        showHints: !1,
        timeBonus: 0,
    },
    hard: {
        reactionWindowMultiplier: 0.7,
        damageReceivedMultiplier: 1.5,
        damageDealtMultiplier: 0.8,
        showHints: !1,
        timeBonus: -15,
    },
};
async function queueBossImagesForGeneration(e) {
    const t = Object.values(gameState.bossFights?.generatedBosses || {}).find((t) => t.id === e);
    if (!t || !t.character || "function" != typeof queuedGenerateImage)
        return void console.warn("[Boss Images] Cannot queue images - boss not generated or missing character:", e);
    console.log(`[Boss Images] Queueing images for ${t.character.firstName} ${t.character.lastName}`),
        gameState.bossImages || (gameState.bossImages = {}),
        gameState.bossImages[e] || (gameState.bossImages[e] = {});
    const n = ["idle", "portrait", "defeated"];
    for (const a of n) {
        if (gameState.bossImages[e][a]?.url) {
            console.log(`[Boss Images] ${a} already cached for ${e}`);
            continue;
        }
        queuedGenerateImage(applyImageStyle(buildBossImagePrompt(t, a)), `Boss ${t.character.firstName} - ${a}`)
            .then((n) => {
                n &&
                    (gameState.bossImages[e] || (gameState.bossImages[e] = {}),
                    (gameState.bossImages[e][a] = { url: n, generated: !0, timestamp: Date.now() }),
                    console.log(`[Boss Images] Generated ${a} for ${t.character.firstName}`));
            })
            .catch((t) => {
                console.error(`[Boss Images] Failed to generate ${a} for ${e}:`, t);
            });
    }
}
function getBossImage(e, t = "idle") {
    return gameState.bossImages?.[e]?.[t]?.url ? gameState.bossImages[e][t].url : null;
}
function onLocationUnlocked(e) {
    "function" == typeof generateUniqueBoss &&
        generateUniqueBoss(e)
            .then((t) => {
                t && console.log(`[Boss System] Generated boss for newly unlocked ${e}:`, t.character?.firstName);
            })
            .catch((t) => console.warn(`[Boss System] Failed to generate boss for ${e}:`, t));
    const t = gameState.locations.findIndex((t) => t.id === e);
    if (t >= 0 && t < gameState.locations.length - 1) {
        const e = gameState.locations[t + 1];
        e &&
            !gameState.bossFights?.generatedBosses?.[e.id] &&
            setTimeout(() => {
                generateUniqueBoss(e.id)
                    .then((t) => {
                        t &&
                            console.log(
                                `[Boss System] Pre-generated NEXT boss for ${e.id}:`,
                                t.character?.firstName
                            );
                    })
                    .catch((e) => console.warn("[Boss System] Failed to pre-generate next boss:", e));
            }, 5e3);
    }
}
function initializeBossImages() {
    if ("function" != typeof generateUniqueBoss)
        return void console.warn("[Boss System] generateUniqueBoss not available");
    const e = gameState.locations.filter((e) => e.unlocked),
        t = gameState.locations.findIndex((t) => t.id === e[e.length - 1]?.id);
    for (let e = 1; e <= 2; e++) {
        const n = t + e;
        if (n < gameState.locations.length) {
            const t = gameState.locations[n];
            t &&
                !gameState.bossFights?.generatedBosses?.[t.id] &&
                (console.log(`[Boss System] Pre-generating boss ${e} for location: ${t.id}`),
                setTimeout(
                    () => {
                        generateUniqueBoss(t.id)
                            .then((e) => {
                                e && console.log(`[Boss System] Boss ready for ${t.id}:`, e.character?.firstName);
                            })
                            .catch((e) =>
                                console.warn(`[Boss System] Failed to pre-generate boss for ${t.id}:`, e)
                            );
                    },
                    3e3 * (e - 1)
                ));
        }
    }
    1 === e.length &&
        "garage" === e[0].id &&
        (gameState.bossFights?.generatedBosses?.home_office ||
            generateUniqueBoss("home_office")
                .then((e) => {
                    e && console.log("[Boss System] First boss ready:", e.character?.firstName);
                })
                .catch((e) => console.warn("[Boss System] Failed to generate first boss:", e)));
}
function canFightBoss(e) {
    const t = bossFightConfig[e];
    if (!t) return { canFight: !1, reason: "no_boss" };
    if (gameState.bossFights.defeated.includes(t.id)) return { canFight: !1, reason: "already_defeated" };
    const n = gameState.bossFights.lastAttempts?.[t.id];
    if (n && "victory" !== n.result) {
        const e = 864e5,
            t = n.timestamp + e,
            a = gameState.time?.currentTime || Date.now();
        if (a < t) {
            return { canFight: !1, reason: "cooldown", cooldownRemaining: t - a, cooldownEnd: t };
        }
    }
    return { canFight: !0, boss: t };
}
function formatCooldownTime(e) {
    const t = Math.floor(e / 36e5),
        n = Math.floor((e % 36e5) / 6e4);
    return t > 0 ? `${t}h ${n}m` : `${n}m`;
}
function calculatePlayerCombatStats() {
    const e = gameState.globalUpgrades?.clickPower || 0,
        t = parseFloat(calculateCashPerSecond()) || 0,
        n = gameState.employees || [];
    let a = 0;
    n.forEach((e) => {
        const t = ((e.stats?.trust || 0) + (e.stats?.friendship || 0) + (e.stats?.desire || 0)) / 3;
        a += 2 + 0.03 * t;
    });
    const o = 50 + 10 * e,
        i = 0.1 * t,
        s = 1 + a / 100,
        r = gameState.influenceUpgrades?.bossWarrior || 0,
        l =
            (o + i) *
            s *
            (void 0 !== influenceUpgrades && influenceUpgrades.bossWarrior
                ? influenceUpgrades.bossWarrior.effect(r)
                : 1);
    return {
        baseAttack: o,
        incomeBonus: i,
        teamPower: a,
        teamMultiplier: s,
        totalAttack: Math.max(1, l),
        employeeCount: n.length,
    };
}
function getScaledBossStats(e) {
    const t = gameState.prestigeLevel || 0,
        n = 1 + t + 0.5 * Math.pow(t, 2),
        a = 1 + 0.3 * t,
        o = 1 + 0.05 * t;
    return {
        health: Math.floor(e.combat.baseHealth * n),
        attackDamage: Math.floor(e.combat.baseAttackDamage * a),
        speedMultiplier: o,
        healthMultiplier: n,
        damageMultiplier: a,
        prestigeLevel: t,
    };
}
async function startBossFight(e, t = {}) {
    let n = gameState.bossFights?.generatedBosses?.[e];
    if (
        (n ||
            "function" != typeof generateUniqueBoss ||
            (showNotification("Generating unique boss...", "info"), (n = await generateUniqueBoss(e))),
        !n)
    )
        return void showNotification("No boss configured for this location!");
    if (
        !(
            (n.character && n.character.firstName) ||
            (console.warn("[Boss Fight] Boss missing character data, regenerating..."),
            (n = await generateUniqueBoss(e, !0)),
            n && n.character)
        )
    )
        return void showNotification("Failed to generate boss character!");
    if (
        (n.combat ||
            (console.warn("[Boss Fight] Boss missing combat data, using defaults"),
            (n.combat = {
                baseHealth: 1e5,
                baseAttackDamage: 20,
                attackInterval: 2500,
                timeLimit: 120,
                attacks: [
                    {
                        id: "basic_attack",
                        name: "Attack",
                        type: "quick",
                        damage: 15,
                        indicator: "yellow",
                        reactionWindow: 1400,
                        correctResponse: ["parry", "block"],
                        animation: "attack_quick",
                        dialogueOptions: ["Take this!"],
                        telegraph: "⚡ PARRY or BLOCK!",
                    },
                    {
                        id: "heavy_strike",
                        name: "Heavy Strike",
                        type: "heavy",
                        damage: 35,
                        indicator: "red",
                        reactionWindow: 2200,
                        correctResponse: ["block", "dodge"],
                        animation: "attack_heavy",
                        dialogueOptions: ["Here it comes!"],
                        telegraph: "💥 BLOCK or DODGE!",
                    },
                    {
                        id: "grab",
                        name: "Grab",
                        type: "grab",
                        damage: 25,
                        indicator: "purple",
                        reactionWindow: 1800,
                        correctResponse: ["mash"],
                        mashRequired: 8,
                        animation: "attack_grab",
                        dialogueOptions: ["Got you!"],
                        telegraph: "🔗 MASH TO ESCAPE!",
                    },
                ],
                specialMove: {
                    name: "Special Attack",
                    trigger: { type: "health_percent", value: 50 },
                    effect: "damage_burst",
                    damage: 20,
                    dialogue: "Feel my power!",
                },
                enrage: {
                    trigger: { type: "health_percent", value: 25 },
                    speedMultiplier: 1.3,
                    damageMultiplier: 1.5,
                    dialogue: "You've made me angry!",
                },
            })),
        !t.isRematch)
    ) {
        const t = canFightBoss(e);
        if (!t.canFight)
            return void ("cooldown" === t.reason
                ? showNotification(
                      `You must wait ${formatCooldownTime(t.cooldownRemaining)} before challenging this boss again!`
                  )
                : "already_defeated" === t.reason && showNotification("You have already defeated this boss!"));
    }
    const a = calculatePlayerCombatStats(),
        o = getScaledBossStats(n),
        i = gameState.bossFightSettings?.difficulty || "normal",
        s = difficultySettings[i];
    bossFightState = {
        boss: n,
        locationId: e,
        isRematch: t.isRematch || !1,
        bossHealth: o.health,
        bossMaxHealth: o.health,
        bossAttackDamage: o.attackDamage,
        bossSpeedMultiplier: o.speedMultiplier,
        playerHealth: 100,
        playerMaxHealth: 100,
        playerAttack: a.totalAttack * s.damageDealtMultiplier,
        playerTeamMultiplier: a.teamMultiplier,
        playerEmployeeCount: a.employeeCount,
        specialCharge: 0,
        specialReady: !1,
        timeRemaining: n.combat.timeLimit + s.timeBonus,
        startTime: Date.now(),
        perfectParries: 0,
        totalDamageDealt: 0,
        totalDamageTaken: 0,
        attacksBlocked: 0,
        attacksDodged: 0,
        attacksMissed: 0,
        currentAttack: null,
        isAttackActive: !1,
        reactionStartTime: null,
        mashCount: 0,
        mashRequired: 0,
        currentPhase: 1,
        hasTriggeredSpecial: !1,
        hasTriggeredEnrage: !1,
        isEnraged: !1,
        currentBossImage: "idle",
        lastDialogueTime: 0,
        difficulty: i,
        difficultyMod: s,
        isEnding: !1,
    };
    const r = document.getElementById("bossFightModal");
    if (r) {
        r.style.display = "flex";
        const e = document.getElementById("bossFightContainer");
        gameState.bossFightSettings?.largerButtons && e.classList.add("larger-buttons"),
            gameState.bossFightSettings?.highContrastIndicators && e.classList.add("high-contrast-indicators");
    }
    updateBossFightUI();
    const l = getBossImage(n.id, "idle"),
        c = document.getElementById("bossImage"),
        d = document.getElementById("bossImagePlaceholder");
    if (l) (c.src = l), (c.style.display = "block"), (d.style.display = "none");
    else {
        (d.style.display = "flex"), (c.style.display = "none");
        queuedGenerateImage(
            applyImageStyle(buildBossImagePrompt(n, "idle")),
            `Boss ${n.character.firstName} - idle`
        ).then((e) => {
            e &&
                bossFightState &&
                ((c.src = e),
                (c.style.display = "block"),
                (d.style.display = "none"),
                gameState.bossImages || (gameState.bossImages = {}),
                gameState.bossImages[n.id] || (gameState.bossImages[n.id] = {}),
                (gameState.bossImages[n.id].idle = { url: e, generated: !0 }));
        });
    }
    const p = n.dialogue.intro[Math.floor(Math.random() * n.dialogue.intro.length)];
    (document.getElementById("bossDialogue").textContent = `"${p}"`),
        (document.getElementById("combatLog").innerHTML = '<div style="color:var(--accent);">⚔️ Combat begins!</div>'),
        o.prestigeLevel > 0 &&
            addToCombatLog(
                `⭐ Prestige ${o.prestigeLevel}: Boss +${Math.round(100 * (o.healthMultiplier - 1))}% HP`,
                "var(--l-gold)"
            ),
        setupBossKeyboardControls(),
        startBossCombatLoop(),
        console.log("[Boss Fight] Started:", {
            boss: n.character.firstName,
            playerAttack: bossFightState.playerAttack,
            bossHealth: bossFightState.bossHealth,
            difficulty: i,
        });
}
function startBossCombatLoop() {
    bossFightInterval && clearInterval(bossFightInterval);
    let e = Date.now();
    const t = bossFightState.boss.combat.attackInterval / bossFightState.bossSpeedMultiplier;
    bossFightInterval = setInterval(() => {
        if (!bossFightState || bossFightState.isEnding) return void clearInterval(bossFightInterval);
        if (
            ((bossFightState.timeRemaining -= 1),
            (document.getElementById("bossTimeRemaining").textContent = bossFightState.timeRemaining),
            bossFightState.timeRemaining <= 0)
        )
            return void endBossFight("defeat", "Time ran out!");
        const n = Date.now();
        !bossFightState.isAttackActive && n - e >= t && (triggerBossAttack(), (e = n)),
            checkPhaseTriggers(),
            updateBossFightUI();
    }, 1e3);
}
function checkPhaseTriggers() {
    if (!bossFightState) return;
    const e = (bossFightState.bossHealth / bossFightState.bossMaxHealth) * 100,
        t = bossFightState.boss;
    if (!bossFightState.hasTriggeredSpecial && t.combat.specialMove) {
        const n = t.combat.specialMove.trigger;
        "health_percent" === n.type &&
            e <= n.value &&
            (triggerBossSpecialMove(), (bossFightState.hasTriggeredSpecial = !0));
    }
    if (!bossFightState.hasTriggeredEnrage && t.combat.enrage) {
        const n = t.combat.enrage.trigger;
        "health_percent" === n.type &&
            e <= n.value &&
            (triggerBossEnrage(), (bossFightState.hasTriggeredEnrage = !0));
    }
    if (e <= 50 && e > 25 && 1 === bossFightState.currentPhase) {
        bossFightState.currentPhase = 2;
        const e = t.dialogue.midFight[Math.floor(Math.random() * t.dialogue.midFight.length)];
        (document.getElementById("bossDialogue").textContent = `"${e}"`), setBossImage("damaged_light");
    }
    if (e <= 25 && 2 === bossFightState.currentPhase) {
        bossFightState.currentPhase = 3;
        const e = t.dialogue.lowHealth[Math.floor(Math.random() * t.dialogue.lowHealth.length)];
        (document.getElementById("bossDialogue").textContent = `"${e}"`), setBossImage("damaged_heavy");
    }
}
function triggerBossAttack() {
    if (!bossFightState || bossFightState.isAttackActive || bossFightState.isEnding) return;
    const e = bossFightState.boss,
        t = e.combat.attacks,
        n = t[Math.floor(Math.random() * t.length)];
    let a = n.reactionWindow;
    if (
        (bossFightState.isEnraged && (a /= e.combat.enrage.speedMultiplier),
        (a *= bossFightState.difficultyMod.reactionWindowMultiplier),
        (a /= bossFightState.bossSpeedMultiplier),
        (bossFightState.currentAttack = { ...n, adjustedWindow: a }),
        (bossFightState.isAttackActive = !0),
        (bossFightState.reactionStartTime = Date.now()),
        "grab" === n.type && ((bossFightState.mashCount = 0), (bossFightState.mashRequired = n.mashRequired || 10)),
        showAttackIndicator(n, a),
        setBossImage("attack_" + ("grab" === n.type ? "grab" : "heavy" === n.type ? "heavy" : "quick")),
        n.dialogueOptions && Math.random() < 0.5)
    ) {
        const e = n.dialogueOptions[Math.floor(Math.random() * n.dialogueOptions.length)];
        document.getElementById("bossDialogue").textContent = `"${e}"`;
    }
    startReactionTimer(a);
}
function showAttackIndicator(e, t) {
    const n = document.getElementById("attackIndicatorOverlay"),
        a = document.getElementById("attackFlash"),
        o = document.getElementById("attackBorder"),
        i = document.getElementById("attackTypeIcon"),
        s = document.getElementById("attackTypeName"),
        r = document.getElementById("attackTelegraph"),
        l = document.getElementById("mashEscapeOverlay");
    n.style.display = "block";
    const c = {
            yellow: {
                bg: "rgba(241, 196, 15, 0.5)",
                border: "var(--l-yellow-2)",
                icon: "⚡",
                color: "var(--l-yellow-2)",
                glow: "0 0 60px rgba(241, 196, 15, 0.8)",
                telegraph: "⚡ PARRY or BLOCK! ⚡",
            },
            red: {
                bg: "rgba(233, 69, 96, 0.5)",
                border: "var(--l-red)",
                icon: "💥",
                color: "var(--l-red)",
                glow: "0 0 60px rgba(233, 69, 96, 0.8)",
                telegraph: "💥 BLOCK or DODGE! 💥",
            },
            purple: {
                bg: "rgba(155, 89, 182, 0.5)",
                border: "var(--l-violet-2)",
                icon: "🔗",
                color: "var(--l-violet-2)",
                glow: "0 0 60px rgba(155, 89, 182, 0.8)",
                telegraph: "🔗 MASH TO ESCAPE! 🔗",
            },
        },
        d = c[e.indicator] || c.yellow;
    if ("grab" === e.type)
        (l.style.display = "flex"),
            (n.style.display = "none"),
            (document.getElementById("mashCounter").textContent = `0 / ${bossFightState.mashRequired}`),
            (document.getElementById("bossFightContainer").style.animation = "mashShake 0.15s infinite");
    else {
        (l.style.display = "none"),
            (a.style.background = d.bg),
            (a.style.opacity = "1"),
            (o.style.borderColor = d.border),
            (o.style.boxShadow = d.glow),
            (o.style.animation = "pulseBorder 0.4s ease-in-out infinite"),
            (i.textContent = d.icon),
            (i.style.color = d.color),
            (i.style.animation = "iconBounce 0.5s ease-in-out infinite"),
            (s.textContent = e.name.toUpperCase()),
            (s.style.color = d.color);
        const t = e.telegraph || d.telegraph;
        (r.textContent = t), (r.style.borderColor = d.border), (r.style.boxShadow = `0 0 20px ${d.border}`);
        const n = document.getElementById("bossImageArea");
        n.classList.remove("attack-yellow", "attack-red", "attack-purple"),
            n.classList.add(`attack-${e.indicator}`),
            (document.getElementById("bossFightContainer").style.animation = "none"),
            setTimeout(() => {
                document.getElementById("bossFightContainer").style.animation = "";
            }, 50);
    }
}
function startReactionTimer(e) {
    const t = document.getElementById("reactionTimerBar"),
        n = Date.now();
    reactionTimerInterval && clearInterval(reactionTimerInterval),
        (t.style.width = "100%"),
        (t.style.transition = "none"),
        (reactionTimerInterval = setInterval(() => {
            if (!bossFightState || !bossFightState.isAttackActive) return void clearInterval(reactionTimerInterval);
            const a = Date.now() - n,
                o = Math.max(0, 1 - a / e);
            (t.style.width = 100 * o + "%"),
                o < 0.3 && !t.classList.contains("urgent")
                    ? (t.classList.add("urgent"), (t.style.background = "linear-gradient(90deg, var(--l-red), var(--l-red-lt))"))
                    : o >= 0.3 &&
                      t.classList.contains("urgent") &&
                      (t.classList.remove("urgent"),
                      (t.style.background = "linear-gradient(90deg, var(--l-green), var(--l-cyan))")),
                a >= e &&
                    (clearInterval(reactionTimerInterval), t.classList.remove("urgent"), handleMissedReaction());
        }, 16));
}
function bossCombatAction(e) {
    if (!bossFightState || bossFightState.isEnding) return;
    if ("flee" === e) return void handleFlee();
    if ("special" === e) return void (bossFightState.specialReady && executeSpecialAttack());
    if ("grab" === bossFightState.currentAttack?.type && bossFightState.isAttackActive)
        return void handleMashInput();
    if (!bossFightState.isAttackActive) return void ("attack" === e && executePlayerAttack());
    bossFightState.currentAttack.correctResponse.includes(e) ? handleCorrectResponse(e) : handleWrongResponse(e);
}
function handleMashInput() {
    if (!bossFightState || !bossFightState.isAttackActive) return;
    const e = Date.now();
    if ((bossFightState._lastMashTime || (bossFightState._lastMashTime = 0), e - bossFightState._lastMashTime < 50))
        return;
    (bossFightState._lastMashTime = e),
        bossFightState.mashCount++,
        (document.getElementById("mashCounter").textContent =
            `${bossFightState.mashCount} / ${bossFightState.mashRequired}`);
    (document.getElementById("mashEscapeOverlay").style.background =
        `rgba(128,0,128,${0.3 + (bossFightState.mashCount / bossFightState.mashRequired) * 0.3})`),
        bossFightState.mashCount >= bossFightState.mashRequired && handleCorrectResponse("mash");
}
function executePlayerAttack() {
    if (!bossFightState) return;
    const e = 0.9 + 0.2 * Math.random(),
        t = Math.floor(bossFightState.playerAttack * e);
    (bossFightState.bossHealth -= t),
        (bossFightState.totalDamageDealt += t),
        (bossFightState.specialCharge = Math.min(100, bossFightState.specialCharge + 5)),
        bossFightState.specialCharge >= 100 &&
            !bossFightState.specialReady &&
            ((bossFightState.specialReady = !0),
            document.getElementById("specialBtn").classList.add("ready"),
            (document.getElementById("specialBtn").disabled = !1),
            addToCombatLog("✨ SPECIAL READY!", "var(--l-gold)")),
        showDamageNumber(t, "var(--l-red)"),
        addToCombatLog(`⚔️ Attack! ${formatNumber(t)} damage`, "var(--l-red)"),
        bossFightState.bossHealth <= 0 ? endBossFight("victory") : updateBossFightUI();
}
function executeSpecialAttack() {
    if (!bossFightState || !bossFightState.specialReady) return;
    const e = Math.floor(3 * bossFightState.playerAttack);
    (bossFightState.bossHealth -= e),
        (bossFightState.totalDamageDealt += e),
        (bossFightState.specialCharge = 0),
        (bossFightState.specialReady = !1),
        document.getElementById("specialBtn").classList.remove("ready"),
        (document.getElementById("specialBtn").disabled = !0),
        showDamageNumber(e, "var(--l-gold)", !0),
        addToCombatLog(`✨ SPECIAL ATTACK! ${formatNumber(e)} damage!`, "var(--l-gold)");
    const t = document.getElementById("bossFightContainer");
    (t.style.boxShadow = "0 0 50px var(--l-gold)"),
        setTimeout(() => {
            t.style.boxShadow = "0 10px 50px rgba(233,69,96,0.4)";
        }, 300),
        bossFightState.bossHealth <= 0 ? endBossFight("victory") : updateBossFightUI();
}
function handleCorrectResponse(e) {
    if (!bossFightState) return;
    const t = bossFightState.currentAttack;
    clearAttackState();
    const n = Date.now() - bossFightState.reactionStartTime < 0.3 * t.adjustedWindow;
    if ("parry" === e || "mash" === e) {
        let t = Math.floor(1.5 * bossFightState.playerAttack);
        if (n && "parry" === e) {
            (t = Math.floor(2.5 * bossFightState.playerAttack)),
                bossFightState.perfectParries++,
                (bossFightState.specialCharge = Math.min(100, bossFightState.specialCharge + 15)),
                showDamageNumber(t, "var(--l-violet-2)", !0),
                addToCombatLog(`⚡ PERFECT PARRY! ${formatNumber(t)} counter damage!`, "var(--l-violet-2)");
            const e =
                bossFightState.boss.dialogue.playerParry[
                    Math.floor(Math.random() * bossFightState.boss.dialogue.playerParry.length)
                ];
            document.getElementById("bossDialogue").textContent = `"${e}"`;
        } else
            showDamageNumber(t, "var(--l-violet-2)"),
                addToCombatLog(
                    `⚡ ${"mash" === e ? "Escaped!" : "Parry!"} ${formatNumber(t)} counter damage`,
                    "var(--l-violet-2)"
                );
        (bossFightState.bossHealth -= t), (bossFightState.totalDamageDealt += t);
    } else if ("block" === e) {
        const e = Math.floor(0.3 * t.damage * bossFightState.difficultyMod.damageReceivedMultiplier);
        (bossFightState.playerHealth -= e),
            (bossFightState.totalDamageTaken += e),
            bossFightState.attacksBlocked++,
            (bossFightState.specialCharge = Math.min(100, bossFightState.specialCharge + 3)),
            addToCombatLog(`🛡️ Blocked! Only -${e}% HP`, "var(--l-blue)");
    } else if ("dodge" === e) {
        bossFightState.attacksDodged++,
            (bossFightState.specialCharge = Math.min(100, bossFightState.specialCharge + 5)),
            addToCombatLog("💨 Dodged!", "var(--l-green-3)");
        const e =
            bossFightState.boss.dialogue.playerDodge[
                Math.floor(Math.random() * bossFightState.boss.dialogue.playerDodge.length)
            ];
        document.getElementById("bossDialogue").textContent = `"${e}"`;
    }
    if (
        (bossFightState.specialCharge >= 100 &&
            !bossFightState.specialReady &&
            ((bossFightState.specialReady = !0),
            document.getElementById("specialBtn").classList.add("ready"),
            (document.getElementById("specialBtn").disabled = !1),
            addToCombatLog("✨ SPECIAL READY!", "var(--l-gold)")),
        bossFightState.bossHealth <= 0)
    )
        return void endBossFight("victory");
    if (bossFightState.playerHealth <= 0) return void endBossFight("defeat", "Your health reached zero!");
    const a = document.getElementById("bossFightContainer");
    a.classList.add("correct-response"),
        setTimeout(() => a.classList.remove("correct-response"), 300),
        setBossImage("idle"),
        updateBossFightUI();
}
function handleWrongResponse(e) {
    if (!bossFightState) return;
    const t = bossFightState.currentAttack;
    clearAttackState();
    const n = Math.floor(t.damage * bossFightState.difficultyMod.damageReceivedMultiplier),
        a = bossFightState.isEnraged ? bossFightState.boss.combat.enrage.damageMultiplier : 1,
        o = Math.floor(n * a);
    (bossFightState.playerHealth -= o),
        (bossFightState.totalDamageTaken += o),
        bossFightState.attacksMissed++,
        addToCombatLog(`❌ Wrong move! -${o}% HP`, "var(--l-red)");
    const i =
        bossFightState.boss.dialogue.playerHit[
            Math.floor(Math.random() * bossFightState.boss.dialogue.playerHit.length)
        ];
    document.getElementById("bossDialogue").textContent = `"${i}"`;
    const s = document.getElementById("bossFightContainer");
    s.classList.add("wrong-response"),
        setTimeout(() => s.classList.remove("wrong-response"), 300),
        bossFightState.playerHealth <= 0
            ? endBossFight("defeat", "Your health reached zero!")
            : (setBossImage("confident"), updateBossFightUI());
}
function handleMissedReaction() {
    bossFightState && bossFightState.isAttackActive && handleWrongResponse("none");
}
function clearAttackState() {
    reactionTimerInterval && (clearInterval(reactionTimerInterval), (reactionTimerInterval = null)),
        bossFightState && ((bossFightState.isAttackActive = !1), (bossFightState.currentAttack = null)),
        (document.getElementById("attackIndicatorOverlay").style.display = "none"),
        (document.getElementById("mashEscapeOverlay").style.display = "none"),
        (document.getElementById("attackFlash").style.opacity = "0");
    const e = document.getElementById("bossImageArea");
    e && e.classList.remove("attack-yellow", "attack-red", "attack-purple");
    const t = document.getElementById("bossFightContainer");
    t && (t.style.animation = "");
    const n = document.getElementById("reactionTimerBar");
    n && (n.classList.remove("urgent"), (n.style.background = "linear-gradient(90deg, var(--l-green), var(--l-cyan))"));
}
function triggerBossSpecialMove() {
    if (!bossFightState) return;
    const e = bossFightState.boss.combat.specialMove;
    addToCombatLog(`⚠️ ${e.name}!`, "var(--l-gold)"),
        (document.getElementById("bossDialogue").textContent = `"${e.dialogue}"`),
        setBossImage("attack_special"),
        "hide_indicators" === e.effect &&
            ((document.getElementById("attackIndicatorOverlay").style.opacity = "0.3"),
            setTimeout(() => {
                bossFightState &&
                    ((document.getElementById("attackIndicatorOverlay").style.opacity = "1"),
                    addToCombatLog("Indicators restored!", "var(--l-green)"));
            }, e.duration));
    const t = document.getElementById("bossFightContainer");
    (t.style.border = "2px solid var(--accent-gold)"),
        setTimeout(() => {
            t && (t.style.border = "2px solid var(--danger)");
        }, 1e3);
}
function triggerBossEnrage() {
    if (!bossFightState) return;
    const e = bossFightState.boss.combat.enrage;
    (bossFightState.isEnraged = !0),
        addToCombatLog("🔥 BOSS ENRAGED!", "var(--l-red)"),
        (document.getElementById("bossDialogue").textContent = `"${e.dialogue}"`);
    (document.getElementById("bossFightContainer").style.boxShadow = "0 0 30px rgba(233,69,96,0.8)"),
        setBossImage("confident");
}
async function handleFlee() {
    if (!bossFightState || bossFightState.isEnding) return;
    (await showConfirm(
        "Are you sure you want to flee? This counts as a loss and you'll have to wait to try again.",
        "Flee Battle?",
        { type: "warning", confirmText: "Flee" }
    )) && endBossFight("flee", "You fled from battle!");
}
function setBossImage(e) {
    if (!bossFightState) return;
    const t = getBossImage(bossFightState.boss.id, e);
    if (t) {
        const n = document.getElementById("bossImage");
        (n.src = t),
            (n.style.display = "block"),
            (document.getElementById("bossImagePlaceholder").style.display = "none"),
            (bossFightState.currentBossImage = e);
    }
}
function showDamageNumber(e, t, n = !1) {
    const a = document.getElementById("damageNumbersContainer");
    if (!a) return;
    const o = document.createElement("div");
    (o.textContent = n ? `💥${formatNumber(e)}` : formatNumber(e)),
        (o.style.cssText = `\n      position: absolute;\n      top: ${30 + 40 * Math.random()}%;\n      left: ${20 + 60 * Math.random()}%;\n      color: ${t};\n      font-size: ${n ? "2rem" : "1.5rem"};\n      font-weight: bold;\n      text-shadow: 0 0 10px ${t}, 0 0 20px black;\n      pointer-events: none;\n      animation: damageFloat 1s ease-out forwards;\n      z-index: 20;\n    `),
        a.appendChild(o),
        setTimeout(() => o.remove(), 1e3);
}
function updateBossFightUI() {
    if (!bossFightState) return;
    const e = Math.max(0, (bossFightState.bossHealth / bossFightState.bossMaxHealth) * 100),
        t = Math.max(0, bossFightState.playerHealth),
        n = bossFightState.specialCharge;
    (document.getElementById("bossHealthBar").style.width = `${e}%`),
        (document.getElementById("bossHealthText").textContent = `${Math.floor(e)}%`),
        (document.getElementById("playerHealthBar").style.width = `${t}%`),
        (document.getElementById("playerHealthText").textContent = `${Math.floor(t)}%`),
        (document.getElementById("specialChargeBar").style.width = `${n}%`),
        (document.getElementById("specialChargeText").textContent = `${Math.floor(n)}%`),
        (document.getElementById("playerAttackDisplay").textContent = formatNumber(
            Math.floor(bossFightState.playerAttack)
        )),
        (document.getElementById("playerTeamDisplay").textContent =
            `+${Math.floor(100 * (bossFightState.playerTeamMultiplier - 1))}%`),
        (document.getElementById("bossName").textContent =
            `${bossFightState.boss.character.firstName} ${bossFightState.boss.character.lastName}`),
        (document.getElementById("bossTitle").textContent = bossFightState.boss.character.title),
        (document.getElementById("bossNameLabel").textContent = bossFightState.boss.character.firstName);
}
function addToCombatLog(e, t = "var(--l-ink-dim-2)") {
    const n = document.getElementById("combatLog");
    if (!n) return;
    const a = document.createElement("div");
    for (
        a.style.color = t, a.textContent = e, n.appendChild(a), n.scrollTop = n.scrollHeight;
        n.children.length > 15;

    )
        n.removeChild(n.firstChild);
}
function endBossFight(e, t = "") {
    if (!bossFightState || bossFightState.isEnding) return;
    (bossFightState.isEnding = !0),
        bossFightInterval && clearInterval(bossFightInterval),
        reactionTimerInterval && clearInterval(reactionTimerInterval),
        bossAttackTimeout && clearTimeout(bossAttackTimeout),
        clearAttackState(),
        document.removeEventListener("keydown", bossKeyboardHandler);
    const n = bossFightState.boss,
        a = Math.floor((Date.now() - bossFightState.startTime) / 1e3),
        o = {
            bossId: n.id,
            result: e,
            timestamp: gameState.time?.currentTime || Date.now(),
            duration: a,
            perfectParries: bossFightState.perfectParries,
            totalDamageDealt: bossFightState.totalDamageDealt,
            totalDamageTaken: bossFightState.totalDamageTaken,
            difficulty: bossFightState.difficulty,
        };
    gameState.bossFights.history.push(o),
        bossFightState.isRematch ||
            (gameState.bossFights.lastAttempts || (gameState.bossFights.lastAttempts = {}),
            (gameState.bossFights.lastAttempts[n.id] = {
                timestamp: gameState.time?.currentTime || Date.now(),
                result: e,
            })),
        "victory" === e ? handleBossVictory(a) : handleBossDefeat(t),
        saveGame();
}
function handleBossVictory(e) {
    const t = bossFightState.boss,
        n = calculateFightGrade();
    document.getElementById("bossFightModal").style.display = "none";
    document.getElementById("bossVictoryModal").style.display = "flex";
    const a = getBossImage(t.id, "defeated") || getBossImage(t.id, "damaged_heavy") || getBossImage(t.id, "idle");
    document.getElementById("victoryBossImage").src = a || "";
    const o = t.dialogue.defeated[Math.floor(Math.random() * t.dialogue.defeated.length)];
    (document.getElementById("victoryDialogue").textContent = `"${o}"`),
        (document.getElementById("victoryDuration").textContent = `${e}s`),
        (document.getElementById("victoryParries").textContent = bossFightState.perfectParries),
        (document.getElementById("victoryDamage").textContent = formatNumber(bossFightState.totalDamageDealt)),
        (document.getElementById("victoryGrade").textContent = n);
    const i = calculateBossReward();
    document.getElementById("bountyAmountPreview").textContent = `$${formatNumber(i)} Cash Reward`;
    const s = t.recruitment;
    document.getElementById("recruitBonusPreview").textContent =
        `${s.passiveBonus.description} | ${s.activeAbility.name}`;
    const r = checkCanRecruitBoss(t),
        l = document.getElementById("recruitBossBtn");
    if (
        (r.canRecruit
            ? ((l.disabled = !1), (l.style.opacity = "1"))
            : ((l.disabled = !0),
              (l.style.opacity = "0.5"),
              (l.querySelector("div:last-child").textContent = r.reason)),
        (bossFightState.victoryData = { duration: e, grade: n, cashReward: i }),
        "function" == typeof onStoryBossDefeated)
    )
        try {
            onStoryBossDefeated(t.id, !1);
        } catch (e) {
            console.warn("[Story] Boss defeat hook error:", e);
        }
}
function handleBossDefeat(e) {
    const t = bossFightState.boss;
    document.getElementById("bossFightModal").style.display = "none";
    document.getElementById("bossDefeatModal").style.display = "flex";
    const n = getBossImage(t.id, "confident") || getBossImage(t.id, "idle");
    document.getElementById("defeatBossImage").src = n || "";
    const a = t.dialogue.playerLoss[Math.floor(Math.random() * t.dialogue.playerLoss.length)];
    (document.getElementById("defeatDialogue").textContent = `"${a}"`),
        (document.getElementById("defeatCooldownTime").textContent = "24 hours");
    const o = [];
    bossFightState.attacksMissed > bossFightState.attacksBlocked + bossFightState.attacksDodged &&
        o.push("• Practice timing - watch for attack indicators!"),
        bossFightState.perfectParries < 3 && o.push("• Try parrying more - perfect parries deal bonus damage!"),
        o.push("• Upgrade Click Power for more damage"),
        o.push("• Hire more employees for team bonus"),
        (document.getElementById("defeatTips").innerHTML = o.join("<br>")),
        showNotification(`Defeated by ${t.character.firstName}! Try again in 24 hours.`);
}
function calculateFightGrade() {
    if (!bossFightState) return "C";
    let e = 0;
    e += Math.min(30, 5 * bossFightState.perfectParries);
    (e += (bossFightState.timeRemaining / bossFightState.boss.combat.timeLimit) * 30),
        (e += (bossFightState.playerHealth / 100) * 20);
    const t =
        bossFightState.attacksBlocked +
        bossFightState.attacksDodged +
        bossFightState.attacksMissed +
        bossFightState.perfectParries;
    if (t > 0) {
        e += 20 * ((t - bossFightState.attacksMissed) / t);
    }
    return e >= 90 ? "S" : e >= 80 ? "A" : e >= 65 ? "B" : e >= 50 ? "C" : "D";
}
function calculateBossReward() {
    if (!bossFightState) return 0;
    const e = bossFightState.boss,
        t = gameState.prestigeLevel || 0,
        n = 1 + 2 * t + 1.5 * Math.pow(t, 2),
        a = e.rewards?.cashBase || 50 * (e.combat?.baseHealth || 5e3),
        o = e.rewards?.cashMultiplier || 3,
        i = 1 + 0.5 * (gameState.locations?.findIndex((e) => e.id === bossFightState.locationId) || 0);
    return Math.floor(a * o * n * i);
}
function checkCanRecruitBoss(e) {
    const t = e.recruitment.corporateLadderSlot;
    return gameState.employees.filter((e) => e.corporateLadderLevel === t).length >= 3
        ? { canRecruit: !1, reason: `No Level ${t} slot available` }
        : { canRecruit: !0 };
}
async function recruitDefeatedBoss() {
    if (!bossFightState?.victoryData) return;
    const e = bossFightState.boss,
        t = bossFightState.locationId;
    if (
        !(await showConfirm(
            `Recruit ${e.character.firstName} ${e.character.lastName}?\n\nRole: ${e.recruitment.employeeStats.role}\nPassive: ${e.recruitment.passiveBonus.description}\nActive: ${e.recruitment.activeAbility.description}`,
            "Recruit Boss?",
            { confirmText: "Recruit!" }
        ))
    )
        return;
    gameState.bossFights.recruited || (gameState.bossFights.recruited = []),
        gameState.bossFights.recruited.includes(e.id) || gameState.bossFights.recruited.push(e.id),
        gameState.bossFights.defeated.includes(e.id) || gameState.bossFights.defeated.push(e.id),
        unlockBossLocation();
    const n = createEmployeeFromBoss(e);
    gameState.employees.push(n);
    const a = gameState.products.find((e) => e.locationId === t && 0 === e.unlockCost);
    if (a) {
        (a.managerHired = !0),
            (a.managerId = n.id),
            (a.managerLevel = 1),
            (a.managerOnboarding = !1),
            (n.productManaged = a.name),
            (n.productId = a.id),
            "function" == typeof initializeHierarchicalPyramid && initializeHierarchicalPyramid();
        const t = gameState.corporatePyramid?.positions?.[1]?.find((e) => e.productId === a.id);
        if (t) {
            (t.employeeId = n.id), (t.isVacant = !1);
            const o = gameState.hierarchyLevels?.[1] || { title: "Staff", baseSalary: 1e5 };
            (n.career = {
                level: 1,
                xp: 0,
                role: n.role || e.recruitment.employeeStats.role,
                title: o.title,
                salary: o.baseSalary,
            }),
                (n.corporateLadderLevel = 1),
                (n.position = `${o.title} – ${a.name}`),
                console.log(`[Boss Recruit] Assigned ${n.name} to ${t.title} managing ${a.name}`);
        } else
            console.log(`[Boss Recruit] No staff position found for product ${a.id}, but employee added to roster`);
    }
    if (
        (showNotification(`${e.character.firstName} has joined your company!`),
        "function" == typeof onStoryBossDefeated)
    )
        try {
            onStoryBossDefeated(e.id, !0);
        } catch (e) {
            console.warn("[Story] Boss recruit hook error:", e);
        }
    closeBossVictoryModal(),
        saveGame(),
        updateUI(),
        "function" == typeof updateBusinessTab && updateBusinessTab(),
        "function" == typeof updatePeopleTab && updatePeopleTab();
}
function claimBossBounty() {
    if (!bossFightState?.victoryData) return;
    const e = bossFightState.boss,
        t = bossFightState.victoryData.cashReward;
    gameState.bossFights.defeated.includes(e.id) || gameState.bossFights.defeated.push(e.id);
    "function" == typeof remember &&
        gameState.employees.forEach((t) => {
            "active" === t.employmentStatus &&
                remember(t, `The boss just defeated ${e.name || "a rival boss"} — the whole office is buzzing about it`, "event", 1.3);
        });
    const n = "number" != typeof t || isNaN(t) ? 0 : t;
    (gameState.cash = (gameState.cash || 0) + n), gameState.rehirePool || (gameState.rehirePool = []);
    const a = {
        id: `boss_${e.id}_rehire`,
        originalRehireId: `boss_${e.id}_rehire`,
        name: `${e.character.firstName} ${e.character.lastName}`,
        age: e.character.age || 30,
        gender: e.appearance?.gender || "female",
        previousLevel: e.recruitment?.corporateLadderSlot || 2,
        previousTitle: e.recruitment?.employeeStats?.role || "Executive",
        stats: {
            productivity: e.recruitment?.employeeStats?.productivity || 80,
            affection: 40,
            comfort: 50,
            trust: 60,
            friendship: 40,
        },
        skills: e.recruitment?.employeeStats?.skills || {},
        personality: {
            confidence: 70 + Math.floor(25 * Math.random()),
            outgoing: 40 + Math.floor(40 * Math.random()),
            flirty: 20 + Math.floor(50 * Math.random()),
            professional: 50 + Math.floor(40 * Math.random()),
        },
        physical: {
            bodyType: e.appearance?.body?.type || "athletic",
            height: e.appearance?.body?.height || "average",
            hairColor: e.appearance?.hair?.color || "dark",
            hairStyle: e.appearance?.hair?.style || "styled",
            eyeColor: e.appearance?.eyes?.color || "brown",
            skinTone: e.appearance?.skin?.tone || e.appearance?.skin || "fair",
        },
        personalityTraits: e.character?.personality?.traits || ["determined", "strong"],
        hobbies: e.character?.personality?.likes?.slice(0, 3) || ["competition", "leadership"],
        kinks: [],
        profileImage: getBossImage(e.id, "recruited") || getBossImage(e.id, "portrait"),
        bio: e.character.backstory || "A former rival boss who can be recruited to your team.",
        wasFormerBoss: !0,
        originalBossId: e.id,
        passiveBonus: e.recruitment?.passiveBonus,
        activeAbility: e.recruitment?.activeAbility,
        rehireBonus: 0.15,
        timesRehired: 0,
        memory: [],
        chatHistory: [],
    };
    gameState.rehirePool.find((t) => t.originalBossId === e.id) ||
        (gameState.rehirePool.push(a),
        console.log(`[Boss Bounty] Added ${a.name} to rehire pool for later recruitment`)),
        unlockBossLocation(),
        showNotification(
            `Claimed $${formatNumber(n)} bounty! ${e.character.firstName} can be hired later from the rehire pool.`,
            "success",
            5e3
        ),
        closeBossVictoryModal(),
        saveGame(),
        updateUI();
}
function unlockBossLocation() {
    if (!bossFightState) return;
    const e = gameState.locations.find((e) => e.id === bossFightState.locationId);
    if (e) {
        (e.unlocked = !0), (e.owned = !0);
        const t = gameState.products.find((t) => t.locationId === e.id && 0 === t.unlockCost);
        t && (t.unlocked = !0);
        const n = gameState.locations.findIndex((t) => t.id === e.id) + 2;
        if (n < gameState.locations.length) {
            const t = gameState.locations[n];
            if ("function" != typeof generateUniqueBoss || gameState.bossFights?.generatedBosses?.[t.id]) {
                const e = bossFightConfig[t.id];
                e && queueBossImagesForGeneration(e.id);
            } else
                console.log(`[Boss] Pre-generating boss N+2 for ${t.id} after defeating boss at ${e.id}`),
                    generateUniqueBoss(t.id)
                        .then((e) => {
                            e &&
                                (console.log(
                                    `[Boss] Pre-generated future boss for ${t.id}:`,
                                    e.character?.firstName
                                ),
                                e.id && queueBossImagesForGeneration(e.id));
                        })
                        .catch((e) => console.warn(`[Boss] Failed to pre-generate future boss for ${t.id}:`, e));
        }
        "function" == typeof initializeHierarchicalPyramid && initializeHierarchicalPyramid();
    }
    saveGame(), "function" == typeof updateBusinessTab && updateBusinessTab();
}
function normalizeSkillsFormat(e) {
    if (!e) return {};
    const t = {};
    for (const [n, a] of Object.entries(e))
        "number" == typeof a
            ? (t[n] = { level: a, xp: 0 })
            : "object" == typeof a && null !== a && (t[n] = { level: a.level || 0, xp: a.xp || 0 });
    return t;
}
function createEmployeeFromBoss(e) {
    const t = e.character,
        n = e.recruitment,
        a = e.appearance,
        o = a?.gender || "female",
        i = {
            bodyType: a?.body?.type || "athletic",
            height: a?.body?.height || "average",
            hairColor: a?.hair?.color || "dark",
            hairStyle: a?.hair?.style || "styled",
            eyeColor: a?.eyes?.color || "brown",
            skinTone: a?.skin?.tone || a?.skin || "fair",
            face: a?.face || "attractive features",
            distinguishingFeatures: a?.distinguishingFeatures || [],
        },
        s = {
            confidence: 70 + Math.floor(25 * Math.random()),
            outgoing: 40 + Math.floor(40 * Math.random()),
            flirty: 20 + Math.floor(50 * Math.random()),
            professional: 50 + Math.floor(40 * Math.random()),
            humor: 30 + Math.floor(40 * Math.random()),
        },
        r = t.personality?.traits || ["determined", "strong"],
        l = {
            productivity: n.employeeStats?.productivity || 80,
            affection: 40 + Math.floor(20 * Math.random()),
            comfort: 50 + Math.floor(20 * Math.random()),
            trust: 60,
            friendship: 40,
            desire: 30,
            obedience: 30 + Math.floor(20 * Math.random()),
            exhibitionism: 20 + Math.floor(30 * Math.random()),
            submissiveness: 20 + Math.floor(30 * Math.random()),
        },
        c = n.corporateLadderSlot || 1;
    return {
        id: `boss_${e.id}_${Date.now()}`,
        name: `${t.firstName} ${t.lastName}`,
        firstName: t.firstName,
        lastName: t.lastName,
        age: t.age || 30,
        gender: o,
        race: "human",
        ethnicity: a?.ethnicity || null,
        role: n.employeeStats.role,
        position: n.employeeStats.role,
        level: c,
        employmentStatus: "active",
        career: { level: c, xp: 0, role: n.employeeStats.role, title: n.employeeStats.role },
        wasFormerBoss: !0,
        originalBossId: e.id,
        canRematch: !0,
        hired: !0,
        corporateLadderLevel: c,
        salary: n.employeeStats.baseSalary,
        productivity: n.employeeStats.productivity,
        locationId: e.locationId,
        trust: 60,
        friendship: 40,
        desire: 30,
        stats: l,
        personality: s,
        personalityTraits: r,
        bossPersonality: t.personality,
        backstory: t.backstory,
        bio: t.backstory || `A former boss who joined after a legendary battle. ${r.join(", ")}.`,
        physical: i,
        hobbies: t.personality?.likes?.slice(0, 3) || ["competition", "leadership"],
        kinks: [],
        trait: r[0] || "Determined",
        skills: normalizeSkillsFormat(n.employeeStats.skills),
        passiveBonus: n.passiveBonus,
        activeAbility: { ...n.activeAbility, lastUsed: 0 },
        profileImage: getBossImage(e.id, "recruited") || getBossImage(e.id, "portrait"),
        bossGallery: { ...gameState.bossImages?.[e.id] },
        originalFight: {
            duration: bossFightState.victoryData.duration,
            perfectParries: bossFightState.perfectParries,
            damageDealt: bossFightState.totalDamageDealt,
            grade: bossFightState.victoryData.grade,
        },
        hireDate: gameState.time?.currentTime || Date.now(),
        totalEarned: 0,
        interactions: 0,
        memory: [],
        speechStyle: t.speechStyle || null,
    };
}
function closeBossVictoryModal() {
    (document.getElementById("bossVictoryModal").style.display = "none"), (bossFightState = null);
    setTimeout(maybeShowDiscordPromo, 600);
}
const DISCORD_PROMO_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;
const DISCORD_PROMO_OPTOUT_KEY = "fuoc_discord_promo_optout";
const DISCORD_PROMO_LAST_SHOWN_KEY = "fuoc_discord_promo_last_shown";
function maybeShowDiscordPromo() {
    if (localStorage.getItem(DISCORD_PROMO_OPTOUT_KEY) === "1") return;
    const last = parseInt(localStorage.getItem(DISCORD_PROMO_LAST_SHOWN_KEY) || "0", 10);
    if (Date.now() - last < DISCORD_PROMO_COOLDOWN_MS) return;
    localStorage.setItem(DISCORD_PROMO_LAST_SHOWN_KEY, String(Date.now()));
    const modal = document.getElementById("discordPromoModal");
    modal && (modal.style.display = "flex");
}
function closeDiscordPromoModal() {
    const modal = document.getElementById("discordPromoModal");
    modal && (modal.style.display = "none");
}
function openDiscordPromoLink() {
    window.open("https://discord.com/invite/E6N9WKpGPA", "_blank", "noopener,noreferrer");
    closeDiscordPromoModal();
}
function dismissDiscordPromoForever() {
    localStorage.setItem(DISCORD_PROMO_OPTOUT_KEY, "1");
    closeDiscordPromoModal();
}
function closeBossDefeatModal() {
    (document.getElementById("bossDefeatModal").style.display = "none"), (bossFightState = null);
}
let bossKeyboardHandler = null;
function setupBossKeyboardControls() {
    bossKeyboardHandler && document.removeEventListener("keydown", bossKeyboardHandler),
        (bossKeyboardHandler = (e) => {
            if (!bossFightState || bossFightState.isEnding) return;
            switch (e.key.toLowerCase()) {
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
        }),
        document.addEventListener("keydown", bossKeyboardHandler);
}
async function startBossRematch(e) {
    const t = gameState.employees.find((t) => t.id === e);
    if (!t?.wasFormerBoss || !t.canRematch) return void showNotification("This employee cannot be rematched.");
    const n = Object.keys(bossFightConfig).find((e) => bossFightConfig[e].id === t.originalBossId);
    if (!n) return void showNotification("Boss data not found for rematch.");
    (await showConfirm(
        `Challenge ${t.firstName} to a friendly rematch?\n\nThis is just for fun - no rewards or penalties.\n\n"${bossFightConfig[n].dialogue.rematch.intro[0]}"`,
        "Friendly Rematch",
        { confirmText: "Fight!" }
    )) && startBossFight(n, { isRematch: !0 });
}
function closeBossFight() {
    (document.getElementById("bossFightModal").style.display = "none"),
        bossFightInterval && clearInterval(bossFightInterval),
        reactionTimerInterval && clearInterval(reactionTimerInterval),
        bossKeyboardHandler && document.removeEventListener("keydown", bossKeyboardHandler),
        (bossFightState = null),
        updateUI();
}
function bossFightAttack() {
    bossCombatAction("attack");
}
async function bossFightRetreat() {
    bossCombatAction("flee");
}
function checkBossFightRequirements(e) {
    return canFightBoss(e);
}
function preloadBossImage(e) {
    const t = bossFightConfig[e];
    t && queueBossImagesForGeneration(t.id);
}
function checkAndPreloadBossImage(e) {
    preloadBossImage(e);
}
