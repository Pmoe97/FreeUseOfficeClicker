// ============================================================================
// 15-company-events — Company events: event definitions COMPANY_EVENTS, checkForCompanyEvent, resolution, scheduled effects.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

const COMPANY_EVENTS = [
    {
        id: "coffee_machine_broke",
        name: "☕ Coffee Crisis",
        category: "incident",
        weight: 20,
        involvesEmployee: !0,
        setup: (e) => ({
            title: "☕ The Coffee Machine Incident",
            description: `${e.name} was the last one to use the coffee machine before it started making ominous grinding noises and sprayed espresso across the break room ceiling.`,
            image: "☕💥",
            choices: [
                {
                    text: `🔧 Get it repaired quickly ($${formatNumber(2e3)})`,
                    cost: 2e3,
                    outcome: {
                        text: `The repair guy arrived within the hour. "${e.name} didn't do anything wrong," he said, "this model just has anger issues." Coffee morale restored.`,
                        effects: { productivity: 5, duration: 1 },
                        employeeEffect: { stat: "comfort", change: 5, reason: "relieved to not be blamed" },
                    },
                },
                {
                    text: "⏳ Wait for the warranty service (free, 3 days)",
                    cost: 0,
                    outcome: {
                        text: `Three days without coffee. The office descends into chaos. ${e.name} has been apologizing to everyone who'll listen.`,
                        effects: { productivity: -15, comfort: -10, duration: 3 },
                        employeeEffect: {
                            stat: "comfort",
                            change: -10,
                            reason: "feels guilty about the coffee situation",
                        },
                    },
                },
                {
                    text: `✨ Upgrade to a fancy new machine ($${formatNumber(8e3)})`,
                    cost: 8e3,
                    outcome: {
                        text: `The new machine has a touch screen, makes 47 different drinks, and plays jazz. ${e.name} is now the unofficial "Coffee Champion" for suggesting it.`,
                        effects: { productivity: 10, comfort: 15, duration: 14 },
                        employeeEffect: {
                            stat: "affection",
                            change: 15,
                            reason: "proud to be the Coffee Champion",
                        },
                    },
                },
            ],
        }),
    },
    {
        id: "fire_drill",
        name: "🔥 Fire Department Visit",
        category: "incident",
        weight: 15,
        involvesEmployee: !1,
        setup: () => ({
            title: "🔥 Surprise Fire Inspection",
            description:
                "The fire department has arrived unannounced. The inspector is taking notes with a very serious expression.",
            image: "🚒",
            choices: [
                {
                    text: `✅ Full compliance inspection ($${formatNumber(5e3)})`,
                    cost: 5e3,
                    outcome: {
                        text: 'After 2 hours, the inspector left satisfied. "You\'re one of the good ones," she said. Everyone got a fire safety sticker.',
                        effects: { trust: 5, duration: 7 },
                    },
                },
                {
                    text: `⚡ Express inspection with "priority fee" ($${formatNumber(15e3)})`,
                    cost: 15e3,
                    outcome: {
                        text: 'The inspector glanced around, nodded, and left in 10 minutes. "Everything looks fine," he said with a wink. Productivity barely affected.',
                        effects: {},
                    },
                },
                {
                    text: `😬 Just the basics (violations found, $${formatNumber(25e3)} fine)`,
                    cost: 25e3,
                    outcome: {
                        text: "Several violations were cited. The expired fire extinguisher from 2019 was not appreciated. You have 30 days to comply.",
                        effects: { trust: -10, duration: 5 },
                    },
                },
            ],
        }),
    },
    {
        id: "pest_problem",
        name: "🐀 Uninvited Guest",
        category: "incident",
        weight: 12,
        involvesEmployee: !0,
        setup: (e) => ({
            title: "🐀 Something in the Walls",
            description: `${e.name} came to you looking pale. "Boss... there's something living in the break room. I heard it. It has... teeth."`,
            image: "🐀",
            choices: [
                {
                    text: `🏠 Professional extermination ($${formatNumber(8e3)})`,
                    cost: 8e3,
                    outcome: {
                        text: `The exterminator found a family of raccoons that had moved in through a vent. They've been relocated to a nice forest. ${e.name} can eat lunch in peace again.`,
                        effects: { comfort: 5, duration: 3 },
                        employeeEffect: { stat: "comfort", change: 10, reason: "grateful the creature is gone" },
                    },
                },
                {
                    text: `🐱 Adopt an office cat ($${formatNumber(500)})`,
                    cost: 500,
                    outcome: {
                        text: `Meet Mr. Whiskers, your new Chief Morale Officer. The pest problem mysteriously vanished, and everyone loves having a cat around. ${e.name} has become Mr. Whiskers' favorite human.`,
                        effects: { comfort: 20, affection: 10, duration: 30 },
                        employeeEffect: { stat: "affection", change: 20, reason: "bonded with the office cat" },
                        special: "office_cat",
                    },
                },
                {
                    text: "🙈 Ignore it and hope it leaves",
                    cost: 0,
                    outcome: {
                        text: `It did not leave. The situation has escalated. ${e.name} refuses to enter the break room and has started a petition.`,
                        effects: { comfort: -25, productivity: -10, duration: 14 },
                        employeeEffect: {
                            stat: "trust",
                            change: -15,
                            reason: "disappointed you ignored the problem",
                        },
                    },
                },
            ],
        }),
    },
    {
        id: "ac_broken",
        name: "❄️ Climate Control Catastrophe",
        category: "incident",
        weight: 10,
        involvesEmployee: !0,
        setup: (e) => ({
            title: "🌡️ It's Getting Hot in Here",
            description: `The HVAC system has failed on the hottest day of the year. ${e.name} has already taken off their shoes. This is getting dire.`,
            image: "🥵",
            choices: [
                {
                    text: `🔧 Emergency HVAC repair ($${formatNumber(15e3)})`,
                    cost: 15e3,
                    outcome: {
                        text: 'Fixed within 4 hours. The repair tech mentioned the unit was held together by "optimism and zip ties."',
                        effects: { productivity: -5, duration: 1 },
                        employeeEffect: { stat: "comfort", change: 5, reason: "relieved to have AC back" },
                    },
                },
                {
                    text: "🏖️ Send everyone home for the day",
                    cost: 0,
                    outcome: {
                        text: `A surprise day off! Everyone is thrilled. ${e.name} organized an impromptu pool party. Productivity hit, but morale skyrocketed.`,
                        effects: { productivity: -30, affection: 20, comfort: 15, duration: 1 },
                        employeeEffect: { stat: "affection", change: 25, reason: "loved the surprise day off" },
                    },
                },
                {
                    text: `🌊 Buy portable AC units and fans ($${formatNumber(3e3)})`,
                    cost: 3e3,
                    outcome: {
                        text: `The office sounds like an airport runway, but at least it's bearable. ${e.name} is hoarding a personal fan.`,
                        effects: { productivity: -10, comfort: -5, duration: 7 },
                    },
                },
            ],
        }),
    },
    {
        id: "employee_conflict",
        name: "⚡ Office Drama",
        category: "interpersonal",
        weight: 15,
        involvesEmployee: "two",
        setup: (e, t) => ({
            title: "⚡ Tensions Rising",
            description: `${e.name} and ${t.name} have been at each other's throats all week. Today, it escalated. Something about a stolen lunch and "borrowed" stapler. HR is asking what to do.`,
            image: "😤",
            choices: [
                {
                    text: "🤝 Mandatory mediation session",
                    cost: 0,
                    outcome: {
                        text: `After two hours of talking it out, ${e.name} and ${t.name} reached an understanding. The lunch was an honest mistake. The stapler issue runs deeper.`,
                        effects: { productivity: -5, duration: 1 },
                        employeeEffects: [
                            { employee: e, stat: "comfort", change: 5, reason: "felt heard during mediation" },
                            { employee: t, stat: "comfort", change: 5, reason: "felt heard during mediation" },
                        ],
                    },
                },
                {
                    text: `🎁 Team bonding lunch ($${formatNumber(500)})`,
                    cost: 500,
                    outcome: {
                        text: `Nothing fixes conflict like free food. ${e.name} and ${t.name} discovered they both love the same obscure band and are now best friends. Office chemistry is weird.`,
                        effects: { affection: 10, duration: 7 },
                        employeeEffects: [
                            { employee: e, stat: "affection", change: 15, reason: "bonded over lunch" },
                            { employee: t, stat: "affection", change: 15, reason: "bonded over lunch" },
                        ],
                    },
                },
                {
                    text: "📋 Formal written warnings",
                    cost: 0,
                    outcome: {
                        text: `Both employees received warnings. The conflict has gone cold, but the tension is palpable. ${e.name} and ${t.name} now communicate exclusively through email.`,
                        effects: {},
                        employeeEffects: [
                            { employee: e, stat: "trust", change: -10, reason: "felt the warning was unfair" },
                            { employee: t, stat: "trust", change: -10, reason: "felt the warning was unfair" },
                        ],
                    },
                },
                {
                    text: "👀 Stay out of it",
                    cost: 0,
                    outcome: {
                        text: "You decided to let them work it out. They... did not. The entire floor has taken sides. This might have been a mistake.",
                        effects: { productivity: -15, comfort: -10, duration: 14 },
                        employeeEffects: [
                            { employee: e, stat: "trust", change: -5, reason: "wished you had intervened" },
                            { employee: t, stat: "trust", change: -5, reason: "wished you had intervened" },
                        ],
                    },
                },
            ],
        }),
    },
    {
        id: "star_performer_offer",
        name: "📞 Headhunter Alert",
        category: "interpersonal",
        weight: 8,
        involvesEmployee: "high_performer",
        setup: (e) => ({
            title: "📞 Your Star is Being Poached",
            description: `${e.name} just got off a call with a headhunter. They're being offered a position at a competitor for 30% more money. They came to you first out of loyalty, but they're clearly tempted.`,
            image: "💼",
            choices: [
                {
                    text: "💰 Match the offer with a raise",
                    cost: Math.floor(0.3 * e.career?.salary || 3e4),
                    outcome: {
                        text: `${e.name}'s eyes lit up. "I knew this company valued me," they said. They called the headhunter back to decline. Your top performer stays.`,
                        employeeEffect: { stat: "affection", change: 25, reason: "feels truly valued" },
                    },
                },
                {
                    text: "🌟 Promise a promotion path",
                    cost: 0,
                    outcome: {
                        text: `You outlined a clear path to their next role. ${e.name} appreciated the transparency. They're staying... for now. But you better deliver on that promise.`,
                        employeeEffect: { stat: "trust", change: 10, reason: "sees a future here" },
                        followUp: "promotion_promise",
                    },
                },
                {
                    text: "🤷 Wish them well",
                    cost: 0,
                    outcome: {
                        text: `${e.name} looked hurt, then nodded. "I understand. Business is business." They've accepted the other offer. You're losing a good one.`,
                        employeeEffect: { stat: "affection", change: -50, reason: "felt disposable" },
                        special: "employee_leaves_soon",
                    },
                },
            ],
        }),
    },
    {
        id: "personal_crisis",
        name: "😢 Employee in Need",
        category: "interpersonal",
        weight: 10,
        involvesEmployee: !0,
        setup: (e) => ({
            title: "😢 A Difficult Conversation",
            description: `${e.name} knocked on your door looking distressed. They're dealing with a family emergency and need time off, but they're worried about job security and falling behind.`,
            image: "💔",
            choices: [
                {
                    text: "❤️ Paid leave, no questions asked",
                    cost: Math.floor(e.career?.salary / 52 || 2e3),
                    outcome: {
                        text: `${e.name} teared up. "Thank you. I won't forget this." They'll be back when they're ready, and they'll remember how you treated them.`,
                        employeeEffect: {
                            stat: "affection",
                            change: 30,
                            reason: "deeply grateful for the support",
                        },
                    },
                },
                {
                    text: "📅 Flexible work arrangement",
                    cost: 0,
                    outcome: {
                        text: `You worked out a reduced schedule so ${e.name} can handle their situation while staying connected to work. It's not perfect, but they appreciate the effort.`,
                        effects: { productivity: -5, duration: 14 },
                        employeeEffect: { stat: "trust", change: 15, reason: "appreciates the flexibility" },
                    },
                },
                {
                    text: "📋 Standard PTO policy only",
                    cost: 0,
                    outcome: {
                        text: `${e.name} nodded stiffly. "I understand the rules." They used their vacation days. The interaction felt cold, and something shifted.`,
                        employeeEffect: {
                            stat: "trust",
                            change: -15,
                            reason: "felt unsupported during a hard time",
                        },
                    },
                },
            ],
        }),
    },
    {
        id: "server_crash",
        name: "💻 System Meltdown",
        category: "tech",
        weight: 8,
        involvesEmployee: !1,
        setup: () => ({
            title: "💻 DEFCON 1: Servers Down",
            description:
                "The main servers just crashed. Everything is offline. The IT lead is already on their fourth energy drink and it's only been 20 minutes.",
            image: "🔥💻🔥",
            choices: [
                {
                    text: `🚨 Emergency IT contractor ($${formatNumber(25e3)})`,
                    cost: 25e3,
                    outcome: {
                        text: 'External specialists worked through the night. Systems restored in 6 hours. They left a 47-page report about "technical debt." Everyone pretends they\'ll read it.',
                        effects: { productivity: -10, duration: 1 },
                    },
                },
                {
                    text: "☕ Let internal IT handle it (12+ hours)",
                    cost: 0,
                    outcome: {
                        text: "The IT team pulled an all-nighter. They're heroes, but they're also now running on fumes and spite. Systems restored, but barely.",
                        effects: { productivity: -30, duration: 2 },
                    },
                },
                {
                    text: `☁️ Use this as reason to migrate to cloud ($${formatNumber(75e3)})`,
                    cost: 75e3,
                    outcome: {
                        text: "A blessing in disguise. The migration took a week of chaos, but now you're on modern infrastructure. IT is cautiously optimistic for the first time in years.",
                        effects: { productivity: -50, duration: 7 },
                        delayedEffects: { productivity: 15, duration: 90 },
                    },
                },
            ],
        }),
    },
    {
        id: "data_breach",
        name: "🔓 Security Incident",
        category: "tech",
        weight: 3,
        involvesEmployee: !1,
        setup: () => ({
            title: "🔓 BREACH DETECTED",
            description:
                "Security flagged unauthorized access to customer data. The scope is still being determined. Legal is already asking questions. This is bad.",
            image: "⚠️🔐",
            choices: [
                {
                    text: `📢 Full transparency & notification ($${formatNumber(1e5)})`,
                    cost: 1e5,
                    outcome: {
                        text: "You notified all affected customers, hired credit monitoring services, and brought in forensics. Expensive, but your reputation for integrity grows.",
                        effects: { trust: 10, duration: 30 },
                    },
                },
                {
                    text: `🔒 Quiet remediation ($${formatNumber(5e4)})`,
                    cost: 5e4,
                    outcome: {
                        text: "You patched the vulnerability and monitored for misuse. Nothing seems to have leaked. But if this ever comes out...",
                        effects: { trust: -5, duration: 14 },
                        special: "breach_secret",
                    },
                },
                {
                    text: `⚖️ Minimum legal compliance ($${formatNumber(25e3)})`,
                    cost: 25e3,
                    outcome: {
                        text: "You did exactly what the law requires, nothing more. Some customers are upset about the delayed notification. A few lawsuits are expected.",
                        effects: { trust: -15, duration: 30 },
                        delayedCost: { min: 5e4, max: 2e5, delay: 30 },
                    },
                },
            ],
        }),
    },
    {
        id: "harassment_complaint",
        name: "📋 HR Alert",
        category: "legal",
        weight: 6,
        involvesEmployee: !0,
        setup: (e) => ({
            title: "📋 Sensitive HR Matter",
            description: `HR has received a complaint about ${e.name}. The details are serious but unverified. How you handle this will set a precedent.`,
            image: "⚖️",
            choices: [
                {
                    text: `🔍 Full independent investigation ($${formatNumber(15e3)})`,
                    cost: 15e3,
                    outcome: {
                        text: `External investigators found the complaint was based on a misunderstanding. ${e.name} is cleared, and everyone learned about proper procedures.`,
                        effects: { trust: 5, duration: 7 },
                        employeeEffect: {
                            stat: "trust",
                            change: -5,
                            reason: "stressed by the investigation but glad it's resolved",
                        },
                    },
                },
                {
                    text: "👥 Internal HR review",
                    cost: 0,
                    outcome: {
                        text: `HR conducted interviews and found insufficient evidence. The matter is closed, but whispers remain. ${e.name} is walking on eggshells.`,
                        employeeEffect: {
                            stat: "comfort",
                            change: -15,
                            reason: "feels like they're being watched",
                        },
                    },
                },
                {
                    text: `📝 Mandatory training for everyone ($${formatNumber(5e3)})`,
                    cost: 5e3,
                    outcome: {
                        text: "Everyone attends sensitivity training. It's awkward, but necessary. The complaint is addressed systemically without singling anyone out.",
                        effects: { productivity: -10, trust: 10, duration: 1 },
                    },
                },
            ],
        }),
    },
    {
        id: "lawsuit_threat",
        name: "⚖️ Legal Trouble",
        category: "legal",
        weight: 4,
        involvesEmployee: !1,
        setup: () => ({
            title: "⚖️ Certified Letter Received",
            description:
                "A former employee is threatening to sue for wrongful termination. Their lawyer is demanding a settlement meeting. The claims seem... exaggerated.",
            image: "📜",
            choices: [
                {
                    text: `💰 Settle quickly ($${formatNumber(75e3)})`,
                    cost: 75e3,
                    outcome: {
                        text: "The settlement was signed with an NDA. It stings, but it's over. No court date, no press, no headaches. Sometimes you pay to make problems disappear.",
                        effects: {},
                    },
                },
                {
                    text: `⚔️ Fight it in court ($${formatNumber(3e4)} legal fees)`,
                    cost: 3e4,
                    outcome: {
                        text: "Your lawyers are confident. The case will take months, but you're on solid ground. Partial victory: the payout is reduced to a fraction.",
                        delayedCost: { min: 1e4, max: 4e4, delay: 60 },
                    },
                },
                {
                    text: "🤝 Negotiate directly",
                    cost: 0,
                    outcome: {
                        text: "A risky move. After a tense meeting, you reached a modest settlement. The ex-employee mostly wanted to be heard. Cost: minimal. Stress: maximal.",
                        delayedCost: { min: 5e3, max: 2e4, delay: 7 },
                    },
                },
            ],
        }),
    },
    {
        id: "team_victory",
        name: "🏆 Big Win",
        category: "positive",
        weight: 10,
        involvesEmployee: !0,
        isPositive: !0,
        setup: (e) => ({
            title: "🏆 Celebrating Success",
            description: `${e.name}'s project just landed a major deal! The whole team is buzzing with excitement. How do you celebrate?`,
            image: "🎉",
            choices: [
                {
                    text: `🎉 Office party ($${formatNumber(5e3)})`,
                    cost: 5e3,
                    outcome: {
                        text: `The celebration was legendary. ${e.name} gave a speech that made people tear up. Morale is at an all-time high.`,
                        effects: { affection: 15, comfort: 10, productivity: 10, duration: 14 },
                        employeeEffect: {
                            stat: "affection",
                            change: 25,
                            reason: "felt celebrated and appreciated",
                        },
                    },
                },
                {
                    text: `💰 Bonus for the team ($${formatNumber(2e4)})`,
                    cost: 2e4,
                    outcome: {
                        text: `Cold hard cash speaks volumes. ${e.name} and the team are thrilled. Word spreads that good work gets rewarded here.`,
                        effects: { trust: 15, productivity: 15, duration: 21 },
                        employeeEffect: { stat: "trust", change: 20, reason: "bonus showed real appreciation" },
                    },
                },
                {
                    text: "📢 Public recognition (free)",
                    cost: 0,
                    outcome: {
                        text: `You highlighted ${e.name}'s achievement in the company newsletter and team meeting. They're beaming. It didn't cost anything, but the recognition matters.`,
                        effects: { affection: 5, duration: 7 },
                        employeeEffect: { stat: "affection", change: 10, reason: "proud to be recognized" },
                    },
                },
            ],
        }),
    },
    {
        id: "media_opportunity",
        name: "📺 PR Opportunity",
        category: "positive",
        weight: 6,
        involvesEmployee: !1,
        isPositive: !0,
        setup: () => ({
            title: "📺 You're Going Viral (Good Kind)",
            description:
                'A local news station wants to feature your company in a "Best Places to Work" segment. This could be great exposure!',
            image: "🎬",
            choices: [
                {
                    text: `🌟 Full production feature ($${formatNumber(15e3)})`,
                    cost: 15e3,
                    outcome: {
                        text: "The segment aired during prime time. Applications have tripled. Your employees are proud to work here, and everyone's parents finally understand what the company does.",
                        effects: { affection: 20, trust: 15, duration: 30 },
                    },
                },
                {
                    text: "📹 Quick interview (free)",
                    cost: 0,
                    outcome: {
                        text: "A brief but positive segment. It's not groundbreaking, but it's nice to be noticed. A few new resumes came in.",
                        effects: { affection: 5, trust: 5, duration: 7 },
                    },
                },
                {
                    text: "❌ Decline politely",
                    cost: 0,
                    outcome: {
                        text: "You prefer to stay under the radar. The reporter was disappointed but understood. Some employees wonder why you passed on free publicity.",
                        effects: { affection: -5, duration: 7 },
                    },
                },
            ],
        }),
    },
    {
        id: "community_opportunity",
        name: "🌱 Community Initiative",
        category: "positive",
        weight: 8,
        involvesEmployee: !0,
        isPositive: !0,
        setup: (e) => ({
            title: "🌱 Giving Back",
            description: `${e.name} proposed organizing a company volunteer day at a local charity. They've already got a few people interested.`,
            image: "💚",
            choices: [
                {
                    text: `💪 Company-wide volunteer day ($${formatNumber(8e3)})`,
                    cost: 8e3,
                    outcome: {
                        text: `The whole company spent a day at the local food bank. Social media loved it. More importantly, everyone came back feeling good about where they work. ${e.name} organized everything flawlessly.`,
                        effects: { affection: 20, comfort: 15, trust: 10, duration: 21 },
                        employeeEffect: {
                            stat: "affection",
                            change: 25,
                            reason: "proud of making the volunteer day happen",
                        },
                    },
                },
                {
                    text: `💵 Match employee donations ($${formatNumber(5e3)})`,
                    cost: 5e3,
                    outcome: {
                        text: `Your matching program inspired generosity. ${e.name}'s charity received a substantial donation, and employees appreciate the company's support.`,
                        effects: { trust: 10, affection: 10, duration: 14 },
                        employeeEffect: { stat: "trust", change: 15, reason: "appreciates the donation match" },
                    },
                },
                {
                    text: "👍 Approve with no budget",
                    cost: 0,
                    outcome: {
                        text: `${e.name} organized a small group to volunteer on their own time. It was modest but meaningful. They wished for more company support.`,
                        effects: { affection: 5, duration: 7 },
                        employeeEffect: { stat: "trust", change: -5, reason: "wished for more company backing" },
                    },
                },
            ],
        }),
    },
];
function checkForCompanyEvent() {
    if (!isStoryEnabled()) return;
    if (
        (gameState.companyEvents ||
            (gameState.companyEvents = {
                active: [],
                history: [],
                nextEventCheck: Date.now(),
                eventChance: 0.15,
                eventsThisWeek: 0,
            }),
        void 0 !== StoryEngine && StoryEngine.checkMinorEvents)
    )
        return void StoryEngine.checkMinorEvents();
    console.warn("[Events] StoryEngine not available, falling back to legacy system");
    const e = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus).length;
    if (gameState.cash < 3e4 || e < 5) return;
    const t = gameState.time?.startTime || gameState.time?.currentTime || Date.now();
    if ((gameState.time?.currentTime || Date.now()) - t < 432e6 / (gameState.time?.gameSpeed || 1)) return;
    const n = initializeDynamicEventSystem();
    if (n.queue.length >= 3) return;
    if (Date.now() < n.nextGenerationTime) return;
    if (n.generating) return;
    const a = Math.min(0.4, 0.15 + 0.01 * e);
    Math.random() > a
        ? (n.nextGenerationTime = Date.now() + 6e4)
        : generateDynamicEvent().catch((e) => {
              console.error("[Events] Dynamic event generation failed:", e);
          });
}
function showCompanyEventModal(e) {
    if ("function" == typeof openEventPanel) return openEventPanel();
    const t = e.eventData;
    if (!t) return;
    const n = (e.involvedEmployees || []).map((e) => gameState.employees.find((t) => t.id === e)).filter(Boolean),
        a = document.createElement("div");
    (a.id = "companyEventModal"),
        (a.style.cssText =
            "\n      position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n      background: var(--l-veil-85); z-index: 100000;\n      display: flex; justify-content: center; align-items: center;\n      animation: fadeIn 0.3s ease-out;\n    ");
    let o = "";
    n.length > 0 &&
        (o = `\n        <div style="display:flex; justify-content:center; gap:15px; margin-bottom:20px;">\n          ${n.map((t) => `\n            <div style="text-align:center;">\n              <img src="${t.profileImage || t.generatedPortrait || placeholderImage(80, 80)}" \n                   style="width:70px; height:70px; border-radius:50%; border:3px solid ${e.isPositive ? "var(--l-green)" : "var(--l-red)"}; object-fit:cover;">\n              <div style="font-size:0.8rem; color:var(--l-ink); margin-top:5px;">${t.name}</div>\n            </div>\n          `).join("")}\n        </div>\n      `);
    const i = t.choices
            .map((t, n) => {
                const a = gameState.cash >= t.cost,
                    o = t.cost > 0 ? ` (${formatCash(t.cost)})` : "";
                return `\n        <button onclick="resolveCompanyEvent('${e.id}', ${n})"\n                style="width:100%; padding:15px; margin:8px 0; \n                       background:${a ? "var(--l-panel-2)" : "var(--l-panel)"}; \n                       border:2px solid ${a ? "var(--l-indigo)" : "var(--l-neutral-4)"}; \n                       border-radius:10px; color:${a ? "var(--l-ink)" : "var(--l-neutral-6)"}; \n                       cursor:${a ? "pointer" : "not-allowed"}; \n                       font-size:0.95rem; text-align:left;\n                       transition: all 0.2s ease;\n                       ${a ? "" : "opacity:0.6;"}"\n                ${a ? "" : "disabled"}\n                onmouseenter="this.style.borderColor='${a ? "var(--l-red)" : "var(--l-neutral-4)"}'; this.style.transform='translateX(5px)';"\n                onmouseleave="this.style.borderColor='${a ? "var(--l-indigo)" : "var(--l-neutral-4)"}'; this.style.transform='translateX(0)';">\n          ${t.text}${o ? `<span style="float:right; color:${a ? "var(--l-pink)" : "var(--l-neutral-6)"};">${o}</span>` : ""}\n        </button>\n      `;
            })
            .join(""),
        s = document.createElement("div");
    if (
        ((s.style.cssText = `\n      background: linear-gradient(135deg, var(--l-panel) 0%, var(--l-panel-2) 100%);\n      border-radius: 15px; max-width: 550px; width: 90%;\n      padding: 30px; position: relative;\n      border: 2px solid ${e.isPositive ? "var(--l-green)" : "var(--l-red)"};\n      box-shadow: 0 20px 60px var(--l-veil-50);\n      max-height: 90vh; overflow-y: auto;\n    `),
        (s.innerHTML = `\n      <div style="text-align:center; margin-bottom:20px;">\n        <div style="font-size:3rem; margin-bottom:10px;">${t.image || "📢"}</div>\n        <h2 style="margin:0; color:${e.isPositive ? "var(--l-green)" : "var(--l-red)"}; font-size:1.5rem;">\n          ${t.title}\n        </h2>\n      </div>\n      \n      ${o}\n      \n      <p style="color:var(--l-ink-dim); font-size:0.95rem; line-height:1.6; margin-bottom:25px; text-align:center;">\n        ${t.description}\n      </p>\n      \n      <div style="border-top:1px solid var(--border); padding-top:20px;">\n        <div style="color:var(--text-dim); font-size:0.8rem; margin-bottom:10px; text-align:center;">\n          Choose your response:\n        </div>\n        ${i}\n      </div>\n      \n      <div style="text-align:center; margin-top:15px; color:var(--text-mute); font-size:0.75rem;">\n        💰 Current Cash: ${formatCash(gameState.cash)}\n      </div>\n    `),
        a.appendChild(s),
        document.body.appendChild(a),
        !document.getElementById("eventModalStyles"))
    ) {
        const e = document.createElement("style");
        (e.id = "eventModalStyles"),
            (e.textContent =
                "\n        @keyframes fadeIn {\n          from { opacity: 0; }\n          to { opacity: 1; }\n        }\n        #companyEventModal > div {\n          animation: slideIn 0.3s ease-out;\n        }\n        @keyframes slideIn {\n          from { transform: translateY(-20px); opacity: 0; }\n          to { transform: translateY(0); opacity: 1; }\n        }\n      "),
            document.head.appendChild(e);
    }
}
function showEventOutcomeModal(e, t) {
    const n = document.createElement("div");
    (n.id = "eventOutcomeModal"),
        (n.style.cssText =
            "\n      position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n      background: var(--l-veil-85); z-index: 100000;\n      display: flex; justify-content: center; align-items: center;\n      animation: fadeIn 0.3s ease-out;\n    ");
    const a = document.createElement("div");
    a.style.cssText = `\n      background: linear-gradient(135deg, var(--l-panel) 0%, var(--l-panel-2) 100%);\n      border-radius: 15px; max-width: 500px; width: 90%;\n      padding: 30px; text-align: center;\n      border: 2px solid ${e.isPositive ? "var(--l-green)" : "var(--l-indigo)"};\n      box-shadow: 0 20px 60px var(--l-veil-50);\n    `;
    let o = "";
    if (t.effects && Object.keys(t.effects).length > 0) {
        const e = [];
        for (const [n, a] of Object.entries(t.effects)) {
            if ("duration" === n) continue;
            const t = a > 0 ? "+" : "",
                o = a > 0 ? "var(--l-green)" : "var(--l-red)";
            e.push(`<span style="color:${o}">${t}${a}% ${n}</span>`);
        }
        if (e.length > 0) {
            const n = t.effects.duration || 7;
            o = `\n          <div style="margin-top:15px; padding:10px; background:var(--l-veil-30); border-radius:8px; font-size:0.85rem;">\n            ${e.join(" • ")}\n            <div style="color:var(--text-dim); font-size:0.75rem; margin-top:5px;">Duration: ${n} days</div>\n          </div>\n        `;
        }
    }
    (a.innerHTML = `\n      <div style="font-size:3rem; margin-bottom:15px;">${e.isPositive ? "✨" : "📋"}</div>\n      <h2 style="margin:0 0 15px 0; color:var(--l-ink); font-size:1.3rem;">Result</h2>\n      <p style="color:var(--l-ink-dim); font-size:0.95rem; line-height:1.6; margin-bottom:20px;">\n        ${t.text}\n      </p>\n      ${o}\n      <button onclick="document.getElementById('eventOutcomeModal').remove()"\n              style="margin-top:20px; padding:12px 40px; background:var(--l-indigo); border:none; \n                     border-radius:8px; color:var(--l-ink-on-fill); font-size:1rem; cursor:pointer;\n                     transition: all 0.2s ease;"\n              onmouseenter="this.style.background='#7c8dea'"\n              onmouseleave="this.style.background='var(--l-indigo)'">\n        Continue\n      </button>\n    `),
        n.appendChild(a),
        document.body.appendChild(n);
}
function applyEmployeeEventEffect(e, t) {
    if (!e || !e.stats) {
        if (!e) return;
        e.stats = {};
    }
    const n = t.stat,
        a = t.change;
    n &&
        void 0 !== a &&
        ((e.stats[n] = Math.max(0, Math.min(100, (e.stats[n] || 50) + a))),
        console.log(`[Event] ${e.name}: ${n} ${a > 0 ? "+" : ""}${a} (${t.reason})`));
}
function scheduleDelayedEffect(e) {
    gameState.companyEvents.scheduledEffects || (gameState.companyEvents.scheduledEffects = []);
    const t =
        (gameState.time?.currentTime || Date.now()) +
        (24 * (e.delay || 7) * 60 * 60 * 1e3) / (gameState.time?.gameSpeed || 360);
    gameState.companyEvents.scheduledEffects.push({ effects: e, triggerAt: t });
}
function scheduleDelayedCost(e, t) {
    gameState.companyEvents.scheduledCosts || (gameState.companyEvents.scheduledCosts = []);
    const n = e.min + Math.random() * (e.max - e.min),
        a =
            (gameState.time?.currentTime || Date.now()) +
            (24 * (e.delay || 30) * 60 * 60 * 1e3) / (gameState.time?.gameSpeed || 360);
    gameState.companyEvents.scheduledCosts.push({ cost: Math.floor(n), eventName: t, triggerAt: a });
}
function handleSpecialOutcome(e, t) {
    switch (e) {
        case "office_cat":
            (gameState.companyEvents.officeCat = !0), console.log("[Event] Office cat acquired!");
            break;
        case "employee_leaves_soon":
            const e = gameState.employees.find((e) => e.id === t.involvedEmployees[0]);
            e && ((e.leavingSoon = !0), (e.leaveDate = (gameState.time?.currentTime || Date.now()) + 12096e5));
            break;
        case "breach_secret":
            gameState.companyEvents.hiddenBreach = !0;
    }
}
function applyCompanyEventEffect(e) {
    if (!e) return;
    gameState.employees
        .filter((e) => e.hired && "active" === e.employmentStatus)
        .forEach((t) => {
            t.stats || (t.stats = {}),
                void 0 !== e.productivity &&
                    (t.stats.productivity = Math.max(
                        0,
                        Math.min(100, (t.stats.productivity || 50) + e.productivity)
                    )),
                void 0 !== e.comfort &&
                    (t.stats.comfort = Math.max(0, Math.min(100, (t.stats.comfort || 50) + e.comfort))),
                void 0 !== e.affection &&
                    (t.stats.affection = Math.max(0, Math.min(100, (t.stats.affection || 50) + e.affection))),
                void 0 !== e.trust && (t.stats.trust = Math.max(0, Math.min(100, (t.stats.trust || 50) + e.trust)));
        });
}
function processScheduledEventEffects() {
    if (!isStoryEnabled()) return;
    if (!gameState.companyEvents) return;
    const e = gameState.time?.currentTime || Date.now();
    if (gameState.companyEvents.scheduledEffects) {
        gameState.companyEvents.scheduledEffects
            .filter((t) => e >= t.triggerAt)
            .forEach((e) => {
                applyCompanyEventEffect(e.effects),
                    showNotification(
                        `📈 Delayed benefit activated: +${e.effects.productivity || 0}% productivity`,
                        "success"
                    );
            }),
            (gameState.companyEvents.scheduledEffects = gameState.companyEvents.scheduledEffects.filter(
                (t) => e < t.triggerAt
            ));
    }
    if (gameState.companyEvents.scheduledCosts) {
        gameState.companyEvents.scheduledCosts
            .filter((t) => e >= t.triggerAt)
            .forEach((e) => {
                (gameState.cash -= e.cost),
                    showNotification(`📋 ${e.eventName} follow-up: -${formatCash(e.cost)}`, "warning"),
                    console.log(`[Event] Delayed cost from ${e.eventName}: -$${e.cost.toLocaleString()}`);
            }),
            (gameState.companyEvents.scheduledCosts = gameState.companyEvents.scheduledCosts.filter(
                (t) => e < t.triggerAt
            ));
    }
    gameState.employees.forEach((t) => {
        t.leavingSoon &&
            t.leaveDate &&
            e >= t.leaveDate &&
            ((t.employmentStatus = "resigned"),
            (t.hired = !1),
            (t.leavingSoon = !1),
            showNotification(`👋 ${t.name} has resigned and left the company.`, "warning"),
            console.log(`[Event] ${t.name} left due to earlier decision`));
    });
}
