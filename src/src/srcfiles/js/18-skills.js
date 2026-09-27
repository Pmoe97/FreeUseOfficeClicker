// ============================================================================
// 18-skills — Skills: XP curve + pacing (SKILL_GROWTH), passive on-the-job growth, aptitude, chat-topic XP, specializations + duplicate `$` helper.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

// ---- Pacing -----------------------------------------------------------------
// Every knob for how fast skills grow. At the default 20x clock a game day is ~72 real
// minutes and a work week (40 hours on the clock) ~8.5 real hours. With these values an
// average employee who is promoted as soon as they qualify reaches Branch Manager
// (management Lv 4) after ~1.5 game weeks, CFO/COO (Lv 6) after ~3 and Senior Executive
// (Lv 8) after ~6. A gifted, productive one gets there in ~60% of that (sooner still under a
// stronger boss); a poor fit takes about a quarter longer.
const SKILL_GROWTH = {
    // XP to go from level L to L+1: base * growth^(L-1). Lv 1 -> 2 is 100, Lv 9 -> 10 is 816.
    curve: { base: 100, growth: 1.3, maxLevel: 10 },
    // XP per hour on the clock from the work itself, by site (their product's, else their seat's).
    // Managers (seat 2+) spend half their day on this and the rest running people.
    siteSkills: {
        garage: { technical: 1, social: 1 },
        home_office: { technical: 1, creative: 1 },
        office_suite: { management: 1, social: 1 },
        factory: { technical: 1.5, management: 0.5 },
        rnd: { technical: 2 },
        creative_studio: { creative: 2 },
        private_club: { social: 2 },
        velvet_room: { social: 1, intimate: 1 },
    },
    // Management XP per hour from the responsibility of their ladder seat (1 Staff .. 6 Senior Exec).
    seatManagement: { 1: 1.5, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7 },
    perDirectReport: 0.5, // more management XP/h for each filled seat reporting to them...
    maxReportBonus: 3, // ...up to this much
    managerSocial: 1, // managers spend the day in meetings: social XP/h
    // Multipliers on all of the above.
    aptitude: { min: 0.7, max: 1.6, perTrait: 0.12 }, // per matching trait (see SKILL_APTITUDE_WORDS)
    productivity: { at0: 0.7, at100: 1.3 }, // productive people learn faster
    mentor: { perLevel: 0.06, max: 0.3 }, // per management level their boss is ahead of them
    workshopCooldownDays: 7,
};
// Traits that make someone quicker at a skill. Matched against personalityTraits + keyTrait.
const SKILL_APTITUDE_WORDS = {
    management:
        /\b(ambitious|strategic|decisive|organi[sz]ed|leader(ship)?|bold|proactive|visionary|confident|dominant|responsible|reliable|diligent|driven|assertive|resourceful)\b/gi,
    technical: /\b(analytical|detail-oriented|meticulous|logical|methodical|curious|inquisitive|precise|diligent)\b/gi,
    creative: /\b(creative|innovative|artistic|imaginative|visionary|inventive|expressive|spontaneous|adventurous|playful)\b/gi,
    social: /\b(charismatic|empathetic|persuasive|friendly|outgoing|collaborative|supportive|charming|flirty|warm|caring|witty|sociable)\b/gi,
};
const SKILL_APTITUDE_DRAG = { social: /\b(shy|reserved|introvert\w*|awkward)\b/gi };

function skillXpToNext(level) {
    const c = SKILL_GROWTH.curve;
    return Math.round(c.base * Math.pow(c.growth, Math.max(0, (level || 0) - 1)));
}
// Puts a skill on the current curve, keeping how far through its level it was. maxXp used to
// start at 500 for everyone whatever their level and grow only on level-ups, so a Lv 4 hire
// needed less XP for Lv 5 than a Lv 1 hire did for Lv 2.
function normalizeSkill(s) {
    if (!s || "object" != typeof s) return s;
    const next = skillXpToNext(s.level || 0);
    if (s.maxXp !== next) {
        const frac = s.maxXp > 0 ? Math.min(0.99, Math.max(0, (s.xp || 0) / s.maxXp)) : 0;
        (s.xp = Math.floor(frac * next)), (s.maxXp = next);
    }
    return s;
}
function normalizeEmployeeSkills(e) {
    e &&
        e.skills &&
        "object" == typeof e.skills &&
        Object.keys(e.skills).forEach((k) => {
            const v = e.skills[k];
            "number" == typeof v && (e.skills[k] = { level: v, xp: 0, maxXp: skillXpToNext(v) }), normalizeSkill(e.skills[k]);
        });
    return e;
}
function gainSkillXP(e, t, n, a = "unknown") {
    if (!e.skills || !e.skills[t]) return void console.warn(`Skill ${t} not found for ${e.name}`);
    "number" == typeof e.skills[t] && (e.skills[t] = { level: e.skills[t], xp: 0, maxXp: 0 });
    const o = normalizeSkill(e.skills[t]),
        i = o.level,
        max = SKILL_GROWTH.curve.maxLevel;
    for (o.xp += n; o.xp >= o.maxXp && o.level < max; )
        (o.xp -= o.maxXp),
            o.level++,
            (o.maxXp = skillXpToNext(o.level)),
            skillNotice("work hour" === a, `${e.name} leveled up ${t} skill to level ${o.level}! 🎉`, `${e.name}: ${t} Lv ${o.level}`),
            checkSpecializationUnlocks(e, t, o.level, "work hour" === a),
            console.log(`[Skills] ${e.name} leveled up ${t}: ${i} → ${o.level} (source: ${a})`);
    o.level >= max && ((o.level = max), (o.xp = 0)), debouncedSave();
}
// Fractional XP (hourly passive growth is often under 1) carries over per skill.
function awardSkillXP(e, skill, amount, source) {
    if (!e || !e.skills || !(amount > 0)) return;
    e.skills[skill] || (e.skills[skill] = { level: 0, xp: 0, maxXp: skillXpToNext(0) });
    const carry = e.skillXpCarry || (e.skillXpCarry = {}),
        total = (carry[skill] || 0) + amount,
        whole = Math.floor(total);
    (carry[skill] = Math.round(1e3 * (total - whole)) / 1e3), whole > 0 && gainSkillXP(e, skill, whole, source);
}
// Level-ups now happen on their own. Those earned at work are kept for a daily summary at
// clock-out (flushSkillWorkDigest, from onHourChange); the rest are gathered for a moment and
// shown as one notification when there are more than two (e.g. after time passes offline).
let _skillNoticeQueue = [],
    _skillNoticeTimer = null,
    _skillWorkDigest = [];
function skillNotice(fromWork, full, short) {
    fromWork ? _skillWorkDigest.push({ full, short }) : queueSkillNotice(full, short);
}
function flushSkillWorkDigest() {
    const d = _skillWorkDigest;
    (_skillWorkDigest = []),
        d.length &&
            (d.length <= 2
                ? d.forEach((m) => queueSkillNotice(m.full, m.short))
                : queueSkillNotice(
                      `📈 Grew at work today: ${d
                          .slice(0, 4)
                          .map((m) => m.short)
                          .join(" · ")}${d.length > 4 ? ` · +${d.length - 4} more` : ""}`,
                      `${d.length} level-ups at work`
                  ));
}
function queueSkillNotice(full, short) {
    _skillNoticeQueue.push({ full, short }), _skillNoticeTimer || (_skillNoticeTimer = setTimeout(flushSkillNotices, 1500));
}
function flushSkillNotices() {
    const q = _skillNoticeQueue;
    (_skillNoticeQueue = []), (_skillNoticeTimer = null);
    q.length &&
        (q.length <= 2
            ? q.forEach((m) => showNotification(m.full))
            : showNotification(
                  `📈 ${q.length} skill milestones: ${q
                      .slice(0, 4)
                      .map((m) => m.short)
                      .join(" · ")}${q.length > 4 ? ` · +${q.length - 4} more` : ""}`
              ));
}
function checkSpecializationUnlocks(e, t, n, fromWork = !1) {
    e.specializations || (e.specializations = []);
    const a = {
        technical: { 3: "Code Wizard", 5: "System Architect", 7: "Tech Lead", 10: "Engineering Master" },
        creative: { 3: "Creative Thinker", 5: "Design Expert", 7: "Art Director", 10: "Creative Genius" },
        social: { 3: "People Person", 5: "Charisma Expert", 7: "Influencer", 10: "Master Communicator" },
        management: { 3: "Team Coordinator", 5: "Project Manager", 7: "Department Head", 10: "Strategic Leader" },
        intimate: {
            3: "Experienced Lover",
            5: "Passionate Partner",
            7: "Intimate Expert",
            10: "Master of Seduction",
        },
    };
    if (a[t] && a[t][n]) {
        const o = a[t][n];
        e.specializations.includes(o) ||
            (e.specializations.push(o), skillNotice(fromWork, `${e.name} earned: ${o}! ⭐`, `${e.name} ⭐ ${o}`));
    }
}
// How quickly someone picks up a skill, from their traits and personality: 0.7 (a poor fit)
// to 1.6 (a natural).
function skillAptitude(e, skill) {
    const cfg = SKILL_GROWTH.aptitude,
        p = e.personality || {},
        text = [...(e.personalityTraits || []), e.keyTrait || ""].join(" "),
        hits = (re) => (re ? (text.match(re) || []).length : 0),
        lean = (v) => ((v ?? 50) - 50) / 250; // a 0-100 personality stat nudges it by up to ±0.2
    let a = 1 + cfg.perTrait * (hits(SKILL_APTITUDE_WORDS[skill]) - hits(SKILL_APTITUDE_DRAG[skill]));
    "management" === skill && (a += lean(((p.confidence ?? 50) + (p.professional ?? 50)) / 2)),
        "social" === skill && (a += lean(p.outgoing)),
        "technical" === skill && (a += lean(p.professional) / 2);
    return Math.min(cfg.max, Math.max(cfg.min, a));
}
// A boss with more management experience rubs off on the people who report to them.
function skillMentorBoost(e, pos) {
    const cfg = SKILL_GROWTH.mentor,
        seat = pos?.reportsTo && "function" == typeof getPosition ? getPosition(pos.reportsTo) : null,
        boss = seat?.employeeId && "player" !== seat.employeeId ? gameState.employees.find((x) => x.id === seat.employeeId) : null,
        lvl = (x) => x?.skills?.management?.level ?? x?.skills?.management ?? 0,
        lead = boss ? lvl(boss) - lvl(e) : 0;
    return lead > 0 ? Math.min(cfg.max, cfg.perLevel * lead) : 0;
}
// One hour on the clock (onHourChange, for everyone at work). Skills used to grow only for
// product managers at a few sites, and never again once someone was promoted off a product —
// so nobody ever reached the management levels the executive seats need. Now everyone learns
// from the work their site does, from the responsibility of their seat and the people under
// them, faster when they're suited to it, productive, and working for someone better at it.
function accrueWorkHourSkills(e) {
    if (!e || !e.skills || (e.employmentStatus && "active" !== e.employmentStatus)) return;
    const G = SKILL_GROWTH,
        pos = "function" == typeof getEmployeePosition ? getEmployeePosition(e.id) : null,
        seat = Math.min(6, Math.max(1, Math.floor(pos?.level || e.career?.level || 1))),
        isManager = seat >= 2,
        site = (e.productId && gameState.products.find((p) => p.id === e.productId)?.locationId) || e.locationId || "garage",
        gains = {},
        add = (k, v) => v > 0 && (gains[k] = (gains[k] || 0) + v);
    Object.entries(G.siteSkills[site] || G.siteSkills.garage).forEach(([k, v]) => add(k, isManager ? v / 2 : v));
    add("management", G.seatManagement[seat] || 0);
    if (isManager && pos && "function" == typeof getSubordinates) {
        add("management", Math.min(G.maxReportBonus, getSubordinates(pos.positionId).length * G.perDirectReport));
        add("social", G.managerSocial);
    }
    const prod = Math.min(100, Math.max(0, e.stats?.productivity ?? 50)),
        pm = G.productivity.at0 + ((G.productivity.at100 - G.productivity.at0) * prod) / 100,
        mentor = 1 + skillMentorBoost(e, pos);
    Object.entries(gains).forEach(([k, v]) =>
        awardSkillXP(e, k, v * pm * skillAptitude(e, k) * ("management" === k ? mentor : 1), "work hour")
    );
}
function getSkillBonus(e, t) {
    if (!e.skills || !e.skills[t]) return 0;
    const n = e.skills[t];
    return 5 * ("number" == typeof n ? n : n.level || 0);
}
function getHighestSkill(e) {
    if (!e.skills) return null;
    let t = { name: "none", level: 0 };
    for (const [n, a] of Object.entries(e.skills)) {
        const e = "number" == typeof a ? a : a.level || 0;
        e > t.level && (t = { name: n, level: e });
    }
    return t;
}
const CHAT_SKILL_TOPICS = {
    management:
        /\b(team|manag\w*|lead\w*|delegat\w*|strateg\w*|budget\w*|hir(e|ing)|plan|planning|goals?|targets?|promot\w*|staff\w*|priorit\w*|decisions?)\b/,
    technical: /\b(code|coding|bugs?|servers?|systems?|data|software|tech\w*|engineer\w*|debug\w*|spreadsheets?|analys\w*)\b/,
    creative: /\b(design\w*|ideas?|brainstorm\w*|campaigns?|artwork|creative\w*|concepts?|brand\w*|content|drafts?)\b/,
};
function processSkillGainsFromChat(e, t, n) {
    const a = t.toLowerCase(),
        o = n.toLowerCase();
    gainSkillXP(e, "social", 2, "chat_message"),
        (a.length > 100 || o.length > 150) && gainSkillXP(e, "social", 5, "deep_conversation");
    ["beautiful", "gorgeous", "sexy", "attractive", "hot", "cute", "stunning"].some(
        (e) => a.includes(e) || o.includes(e)
    ) &&
        e.stats.affection > 40 &&
        gainSkillXP(e, "intimate", 5, "flirt");
    // Talking shop teaches whatever the talk was about. (It used to feed only their best skill,
    // so a strategy chat with an engineer trained their coding.)
    const said = a + " " + o;
    let talkedShop = !1;
    Object.entries(CHAT_SKILL_TOPICS).forEach(([k, re]) => {
        re.test(said) && ((talkedShop = !0), awardSkillXP(e, k, 3 * skillAptitude(e, k), "work_discussion"));
    });
    if (
        !talkedShop &&
        ["project", "task", "deadline", "client", "meeting", "report"].some((e) => a.includes(e) || o.includes(e))
    ) {
        const t = getHighestSkill(e);
        "none" !== t.name && "intimate" !== t.name && gainSkillXP(e, t.name, 3, "work_discussion");
    }
}
function $(e) {
    return document.getElementById(e);
}
