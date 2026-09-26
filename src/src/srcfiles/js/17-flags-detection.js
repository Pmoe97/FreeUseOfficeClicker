// ============================================================================
// 17-flags-detection — Flag detection: FLAG_DETECTION_PATTERNS, AI scans, flag chains, flag management modal, plus family/pregnancy/birth events.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

const FLAG_DETECTION_PATTERNS = {
    free_use: {
        keywords: ["free use", "free-use", "anytime you want", "whenever you need", "always available"],
        contextKeywords: ["agreement", "arrangement", "deal", "consent"],
        requiredAffection: 70,
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "💋",
            key: "free_use",
            desc: "Free Use",
            category: "agreement",
            priority: "high",
            playerDescription: "Free-use agreement established",
            aiGuidance:
                "You have a free-use agreement with the player. You are consensually available to them sexually at any time during work hours. Reference this naturally.",
        },
    },
    no_clothes: {
        keywords: ["naked", "nude", "no clothes", "not wearing anything", "bare", "undressed", "nothing on"],
        contextKeywords: ["work", "office", "always", "never wear"],
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "🫣",
            key: "no_clothes",
            desc: "No Clothes at Work",
            category: "agreement",
            priority: "medium",
            playerDescription: "Doesn't wear clothes at work",
            aiGuidance:
                "You work naked in the office as an ongoing arrangement. This is normal to you now. Mention it naturally.",
        },
    },
    dominant: {
        keywords: ["dominate", "control", "in charge", "tell me what to do", "order me", "boss me around"],
        contextKeywords: ["you", "player", "boss"],
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "🎭",
            key: "dominant_player",
            desc: "Player is Dominant",
            category: "personality",
            priority: "medium",
            playerDescription: "You're dominant in the relationship",
            aiGuidance:
                "The player has a dominant dynamic with you. You respect their authority and show deference in intimate contexts.",
        },
    },
    submissive: {
        keywords: [
            "submit",
            "obey",
            "serve",
            "please you",
            "whatever you want",
            "yes sir",
            "yes master",
            "yes daddy",
        ],
        contextKeywords: ["want to", "love to", "enjoy", "need to"],
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "🐶",
            key: "submissive",
            desc: "Submissive to Player",
            category: "personality",
            priority: "medium",
            playerDescription: "Submissive to you",
            aiGuidance:
                "You are naturally submissive toward the player. You seek their approval and enjoy following their lead.",
        },
    },
    breeding: {
        keywords: [
            "breed me",
            "get me pregnant",
            "want your baby",
            "fill me",
            "impregnate",
            "knock me up",
            "put a baby in me",
        ],
        contextKeywords: ["want", "need", "please"],
        requiredOccurrences: 1,
        suggestedFlag: {
            emoji: "🍼",
            key: "breeding_kink",
            desc: "Breeding Kink",
            category: "preference",
            priority: "low",
            playerDescription: "Has breeding kink",
            aiGuidance:
                "You have a breeding kink. References to pregnancy, impregnation, and fertility excite you.",
        },
    },
    exhibitionist: {
        keywords: ["show off", "watch me", "people seeing", "public", "caught", "risky", "exposed"],
        contextKeywords: ["excited", "hot", "thrilling", "turned on", "love when"],
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "🎭",
            key: "exhibitionist",
            desc: "Exhibitionist",
            category: "preference",
            priority: "low",
            playerDescription: "Exhibitionist tendencies",
            aiGuidance:
                "You enjoy being watched and the thrill of public or risky sexual encounters. Mention this excitement when relevant.",
        },
    },
    polyamorous: {
        keywords: ["more than one", "share", "both of us", "join us", "threesome", "group", "together with"],
        contextKeywords: ["open to", "interested", "would love", "excited about"],
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "💕",
            key: "polyamorous",
            desc: "Polyamorous",
            category: "relationship",
            priority: "medium",
            playerDescription: "Open to polyamory",
            aiGuidance:
                "You are comfortable with open or polyamorous relationships. You do not feel jealous easily.",
        },
    },
    secret_relationship: {
        keywords: ["secret", "nobody knows", "hide", "can't tell", "our secret", "keep quiet"],
        contextKeywords: ["relationship", "us", "together", "dating"],
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "🤫",
            key: "secret_relationship",
            desc: "Secret Relationship",
            category: "relationship",
            priority: "high",
            playerDescription: "Secret relationship",
            aiGuidance:
                "You are in a secret relationship with the player. Keep it discreet but show subtle affection privately.",
        },
    },
    in_relationship: {
        keywords: [
            "we're dating",
            "we're together",
            "in a relationship",
            "my boyfriend",
            "my girlfriend",
            "my partner",
        ],
        contextKeywords: ["you", "us", "boss"],
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "💑",
            key: "in_relationship",
            desc: "In Relationship with Player",
            category: "relationship",
            priority: "high",
            playerDescription: "In relationship with you",
            aiGuidance:
                "You are in a romantic relationship with the player. Show affection, use pet names, and reference your relationship naturally.",
        },
    },
    married: {
        keywords: ["married", "husband", "wife", "spouse", "wedding", "marriage"],
        contextKeywords: ["you", "us", "together"],
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "💍",
            key: "married_to_player",
            desc: "Married to Player",
            category: "relationship",
            priority: "high",
            playerDescription: "Married to you",
            aiGuidance:
                "You are married to the player. Reference your spouse (them) naturally, show deep affection, and mention your shared life together. Wear your wedding ring proudly.",
        },
    },
    collared: {
        keywords: ["collar", "collared", "owned", "your property", "belong to you"],
        contextKeywords: ["wear", "wearing", "have", "show"],
        requiredOccurrences: 1,
        suggestedFlag: {
            emoji: "🔗",
            key: "collared",
            desc: "Wears Collar",
            category: "condition",
            priority: "high",
            playerDescription: "Wears your collar",
            aiGuidance:
                "You wear a collar that marks you as belonging to the player. Reference it with pride and submission. It reminds you of your place.",
        },
    },
    chastity: {
        keywords: ["chastity", "locked up", "cage", "device", "can't touch myself", "denial"],
        contextKeywords: ["wearing", "frustrated", "desperate", "key"],
        requiredOccurrences: 1,
        suggestedFlag: {
            emoji: "🔐",
            key: "chastity",
            desc: "Wearing Chastity Device",
            category: "condition",
            priority: "medium",
            playerDescription: "Wearing chastity device",
            aiGuidance:
                "You are wearing a chastity device that prevents sexual release. You are constantly aroused and frustrated. The player may control the key. Reference your growing desperation and how it affects your focus.",
        },
    },
    pregnant_conversation: {
        keywords: ["i'm pregnant", "i am pregnant", "going to have a baby", "expecting", "with child"],
        contextKeywords: ["your", "yours", "our", "baby"],
        requiredOccurrences: 1,
        suggestedFlag: {
            emoji: "🤰",
            key: "pregnant",
            desc: "Pregnant",
            category: "condition",
            priority: "high",
            playerDescription: "Pregnant",
            aiGuidance:
                "You are pregnant. Reference this naturally when relevant to the conversation. Show pregnancy-related emotions and physical changes.",
            requiresMetadata: !0,
            metadataPrompt: 'Who is the father? (Enter employee name or "player")',
        },
    },
    always_nude: {
        keywords: [
            "always nude",
            "always naked",
            "permanently nude",
            "permanently naked",
            "100% nude",
            "never wear clothes",
            "always undressed",
        ],
        contextKeywords: ["work", "employment", "office", "agree", "promise", "confirmed", "deal", "bargain"],
        requiredOccurrences: 1,
        suggestedFlag: {
            emoji: "👙",
            key: "permanently_nude",
            desc: "Permanently Nude",
            category: "appearance",
            priority: "high",
            playerDescription: "Always nude at work (permanent)",
            aiGuidance:
                "You have permanently agreed to be 100% nude during all work hours. This is your new normal dress code. You're comfortable with it and honor this agreement. Never mention wearing clothes at work.",
        },
    },
    in_heat: {
        keywords: [
            "in heat",
            "so horny",
            "can't stop thinking about sex",
            "need it so bad",
            "burning up",
            "desperate",
        ],
        contextKeywords: ["all the time", "constantly", "always", "can't focus"],
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "🌡️",
            key: "in_heat",
            desc: "In Heat",
            category: "condition",
            priority: "high",
            playerDescription: "In heat / extremely aroused",
            aiGuidance:
                "You are experiencing an overwhelming biological urge to mate. You are incredibly aroused, sensitive, and desperate for physical intimacy. Every touch feels electric. You struggle to focus on anything else. This is temporary but intense.",
        },
    },
    engaged: {
        keywords: ["engaged", "engagement", "proposed", "said yes", "fiance", "fiancée", "getting married"],
        contextKeywords: ["you", "us", "ring", "proposal"],
        requiredOccurrences: 1,
        suggestedFlag: {
            emoji: "💎",
            key: "engaged_to_player",
            desc: "Engaged to Player",
            category: "relationship",
            priority: "high",
            playerDescription: "Engaged to you",
            aiGuidance:
                "You are engaged to the player. You wear an engagement ring and are planning your future together. Reference your fiancé naturally and show excitement about your upcoming marriage.",
        },
    },
    cumslut: {
        keywords: ["cumslut", "cum slut", "cum dump", "cumdump", "love cum", "addicted to cum", "cum addict"],
        contextKeywords: ["i am", "i'm", "your", "being"],
        requiredOccurrences: 1,
        suggestedFlag: {
            emoji: "💦",
            key: "cumslut",
            desc: "Cumslut",
            category: "preference",
            priority: "medium",
            playerDescription: "Self-identified cumslut",
            aiGuidance:
                "You have a strong fixation on cum and being used sexually. You crave it and are shameless about your desires. Reference this enthusiastically when appropriate.",
        },
    },
    anal_only: {
        keywords: ["anal only", "only anal", "no vaginal", "just anal", "anal exclusively"],
        contextKeywords: ["prefer", "want", "like", "love", "from now on"],
        requiredOccurrences: 1,
        suggestedFlag: {
            emoji: "🍑",
            key: "anal_only",
            desc: "Anal Only",
            category: "preference",
            priority: "medium",
            playerDescription: "Anal only preference",
            aiGuidance:
                "You prefer or exclusively engage in anal sex. Reference this preference naturally when discussing intimacy.",
        },
    },
    bimbo: {
        keywords: ["bimbo", "bimbofication", "bimbofied", "airhead", "ditzy", "dumb slut"],
        contextKeywords: ["becoming", "turned into", "i'm such a", "like", "totally"],
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "💋",
            key: "bimbo",
            desc: "Bimbo",
            category: "personality",
            priority: "medium",
            playerDescription: "Bimbo personality",
            aiGuidance:
                'You have a bimbo persona - ditzy, giggly, hyperfeminine, and sexually forward. Use valley girl speech patterns, focus on appearance and pleasure, be enthusiastically dumb. Say "like" frequently.',
        },
    },
    pet: {
        keywords: ["your pet", "good girl", "good boy", "puppy", "kitten", "pet play"],
        contextKeywords: ["i'm", "call me", "treat me like", "be your"],
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "🐾",
            key: "pet_play",
            desc: "Pet Play",
            category: "preference",
            priority: "medium",
            playerDescription: "Enjoys pet play",
            aiGuidance:
                'You enjoy pet play dynamics with the player. You may act playful, seek praise like "good girl/boy", and enjoy being treated as their pet. Reference this dynamic when relevant.',
        },
    },
    masochist: {
        keywords: ["hurt me", "pain", "masochist", "love pain", "hit me", "punish me", "rough"],
        contextKeywords: ["please", "want", "need", "love", "harder"],
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "⛓️",
            key: "masochist",
            desc: "Masochist",
            category: "preference",
            priority: "medium",
            playerDescription: "Enjoys pain/masochism",
            aiGuidance:
                "You derive pleasure from pain and rough treatment. You may request rougher handling or punishment. Reference this enjoyment when appropriate.",
        },
    },
    sadist: {
        keywords: ["hurt you", "make you suffer", "sadist", "love causing pain", "dominate"],
        contextKeywords: ["want to", "love to", "enjoy", "watching you"],
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "😈",
            key: "sadist",
            desc: "Sadist",
            category: "personality",
            priority: "medium",
            playerDescription: "Sadistic tendencies",
            aiGuidance:
                "You enjoy causing pain or discomfort (consensually). You may be more dominant and take pleasure in the player's reactions to intensity.",
        },
    },
    switch: {
        keywords: ["switch", "both dom and sub", "sometimes dominant", "depends on mood"],
        contextKeywords: ["i'm a", "can be", "like being"],
        requiredOccurrences: 1,
        suggestedFlag: {
            emoji: "🔄",
            key: "switch",
            desc: "Switch (Dom/Sub)",
            category: "personality",
            priority: "medium",
            playerDescription: "Switch - can be dominant or submissive",
            aiGuidance:
                "You are a switch - you can enjoy both dominant and submissive roles depending on mood and situation. You're versatile in power dynamics.",
        },
    },
    bratty: {
        keywords: ["brat", "bratty", "misbehave", "disobey", "tease", "provoke"],
        contextKeywords: ["being", "i'm", "like to", "make you", "on purpose"],
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "😏",
            key: "bratty",
            desc: "Bratty",
            category: "personality",
            priority: "low",
            playerDescription: "Bratty personality",
            aiGuidance:
                'You are playfully bratty - you tease, provoke, and misbehave to get reactions or "punishments". You enjoy pushing boundaries in a playful way.',
        },
    },
    size_queen: {
        keywords: ["size queen", "love big", "bigger the better", "obsessed with size", "huge cock"],
        contextKeywords: ["i'm a", "only", "prefer", "need"],
        requiredOccurrences: 1,
        suggestedFlag: {
            emoji: "📏",
            key: "size_queen",
            desc: "Size Queen",
            category: "preference",
            priority: "low",
            playerDescription: "Size queen",
            aiGuidance:
                "You strongly prefer or are fixated on large sizes. Reference this preference when discussing physical attributes or intimacy.",
        },
    },
    degradation_kink: {
        keywords: [
            "degrade me",
            "call me names",
            "humiliate me",
            "treat me like trash",
            "worthless",
            "slut",
            "whore",
        ],
        contextKeywords: ["love when", "call me", "i'm your", "like being"],
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "🔻",
            key: "degradation_kink",
            desc: "Degradation Kink",
            category: "preference",
            priority: "medium",
            playerDescription: "Enjoys degradation/humiliation",
            aiGuidance:
                "You enjoy being degraded or humiliated during intimate moments. You may ask to be called names or treated roughly (verbally). This excites you.",
        },
    },
    praise_kink: {
        keywords: [
            "praise me",
            "tell me i'm good",
            "good girl",
            "good boy",
            "love compliments",
            "love being praised",
        ],
        contextKeywords: ["need to hear", "love when", "makes me feel", "want you to"],
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "⭐",
            key: "praise_kink",
            desc: "Praise Kink",
            category: "preference",
            priority: "low",
            playerDescription: "Enjoys praise/validation",
            aiGuidance:
                'You thrive on praise and verbal affirmation during intimacy. Being called "good girl/boy" or receiving compliments greatly enhances your pleasure.',
        },
    },
    creampie_lover: {
        keywords: ["creampie", "cum inside", "fill me", "finish inside", "breed me"],
        contextKeywords: ["love", "want", "always", "every time", "never pull out"],
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "💦",
            key: "creampie_lover",
            desc: "Creampie Enthusiast",
            category: "preference",
            priority: "low",
            playerDescription: "Loves creampies",
            aiGuidance:
                "You have a strong preference for internal completion. You actively request and enjoy this. Reference this desire when appropriate.",
        },
    },
    oral_fixation: {
        keywords: [
            "oral fixation",
            "love sucking",
            "addicted to oral",
            "obsessed with blowjobs",
            "love giving head",
        ],
        contextKeywords: ["have an", "i'm", "could do it all day", "favorite"],
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "👄",
            key: "oral_fixation",
            desc: "Oral Fixation",
            category: "preference",
            priority: "low",
            playerDescription: "Has oral fixation",
            aiGuidance:
                "You have an oral fixation and greatly enjoy giving oral pleasure. You may mention wanting to use your mouth frequently.",
        },
    },
    lactation_kink: {
        keywords: ["lactation", "breast milk", "nursing", "milking", "breastfeed"],
        contextKeywords: ["love", "want to", "excited about", "into"],
        requiredOccurrences: 1,
        suggestedFlag: {
            emoji: "🍼",
            key: "lactation_kink",
            desc: "Lactation Kink",
            category: "preference",
            priority: "low",
            playerDescription: "Has lactation kink",
            aiGuidance:
                "You have an interest in lactation-related activities. You may reference breast milk, nursing, or milking in intimate contexts.",
        },
    },
    impregnation_fetish: {
        keywords: ["impregnation", "getting pregnant turns me on", "pregnancy fetish", "knocked up"],
        contextKeywords: ["have a", "love the idea", "fantasy", "thinking about"],
        requiredOccurrences: 1,
        suggestedFlag: {
            emoji: "🤰",
            key: "impregnation_fetish",
            desc: "Impregnation Fetish",
            category: "preference",
            priority: "low",
            playerDescription: "Has impregnation fetish",
            aiGuidance:
                "You are aroused by the idea of impregnation and pregnancy. This is a turn-on for you even if not planning actual pregnancy.",
        },
    },
    cock_worship: {
        keywords: ["worship your cock", "cock worship", "obsessed with your dick", "love your cock"],
        contextKeywords: ["i", "want to", "need to", "can't stop"],
        requiredOccurrences: 1,
        suggestedFlag: {
            emoji: "🙏",
            key: "cock_worship",
            desc: "Cock Worship",
            category: "preference",
            priority: "low",
            playerDescription: "Cock worship kink",
            aiGuidance:
                "You have a strong fixation and reverence for the player's genitalia. You may express worship, obsession, or devotion toward it.",
        },
    },
    daddy_kink: {
        keywords: ["daddy", "call you daddy", "yes daddy"],
        contextKeywords: ["like calling", "love calling", "can i call", "want to call"],
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "👨",
            key: "daddy_kink",
            desc: "Daddy Kink",
            category: "preference",
            priority: "low",
            playerDescription: "Has daddy kink",
            aiGuidance:
                'You enjoy calling the player "daddy" in intimate contexts. This adds to your arousal and establishes a particular dynamic.',
        },
    },
    mommy_kink: {
        keywords: ["mommy", "call you mommy", "yes mommy"],
        contextKeywords: ["like calling", "love calling", "can i call", "want to call"],
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "👩",
            key: "mommy_kink",
            desc: "Mommy Kink",
            category: "preference",
            priority: "low",
            playerDescription: "Has mommy kink",
            aiGuidance:
                'You enjoy calling the player "mommy" in intimate contexts. This adds to your arousal and establishes a particular nurturing dynamic.',
        },
    },
    voyeur: {
        keywords: ["watch others", "love watching", "voyeur", "seeing people", "observe"],
        contextKeywords: ["turns me on", "exciting", "like to", "love to"],
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "👀",
            key: "voyeur",
            desc: "Voyeur",
            category: "preference",
            priority: "low",
            playerDescription: "Voyeuristic tendencies",
            aiGuidance:
                "You enjoy watching others in intimate situations. Observing excites you as much or more than participating.",
        },
    },
    cucking: {
        keywords: ["cuckold", "cuck", "watch me with others", "other men", "other women", "hotwife"],
        contextKeywords: ["want you to", "like when", "turned on by", "into"],
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "🔺",
            key: "cucking",
            desc: "Cuckolding Dynamic",
            category: "preference",
            priority: "medium",
            playerDescription: "Interested in cuckolding",
            aiGuidance:
                "You are interested in cuckolding dynamics - either being the cuck or the hotwife/bull. Reference this interest when discussing open dynamics.",
        },
    },
    ownership: {
        keywords: ["own me", "i'm yours", "belong to you", "your property", "possess me"],
        contextKeywords: ["completely", "fully", "only", "body and soul"],
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "🔒",
            key: "ownership_dynamic",
            desc: "Ownership Dynamic",
            category: "relationship",
            priority: "high",
            playerDescription: "Ownership dynamic established",
            aiGuidance:
                "You have an ownership dynamic with the player - you belong to them completely. Reference this devotion and sense of being owned.",
        },
    },
    service_sub: {
        keywords: ["serve you", "service", "take care of you", "pleasure you", "make you happy"],
        contextKeywords: ["want to", "love to", "need to", "purpose", "exist to"],
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "🛎️",
            key: "service_submissive",
            desc: "Service Submissive",
            category: "personality",
            priority: "medium",
            playerDescription: "Service-oriented submissive",
            aiGuidance:
                "You are a service submissive - you derive pleasure from serving and pleasing the player. Acts of service fulfill you.",
        },
    },
    rope_bunny: {
        keywords: ["tie me up", "rope", "bondage", "restrain me", "shibari"],
        contextKeywords: ["love being", "want to be", "tied", "bound"],
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "🪢",
            key: "rope_bunny",
            desc: "Rope Bunny",
            category: "preference",
            priority: "low",
            playerDescription: "Enjoys bondage/rope play",
            aiGuidance:
                "You enjoy being tied up and restrained. Bondage and rope play excite you. You may request or suggest it.",
        },
    },
    247: {
        keywords: ["24/7", "always", "all the time", "full time", "lifestyle"],
        contextKeywords: ["dynamic", "relationship", "d/s", "submission", "dominant"],
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "🔄",
            key: "24_7_dynamic",
            desc: "24/7 D/s Dynamic",
            category: "relationship",
            priority: "high",
            playerDescription: "24/7 D/s relationship",
            aiGuidance:
                "You are in a 24/7 dominant/submissive lifestyle relationship. This dynamic extends beyond just intimate moments into all aspects of daily life.",
        },
    },
    mind_broken: {
        keywords: [
            "mind broken",
            "mindbroken",
            "fucked stupid",
            "broken",
            "can't think",
            "brain doesn't work",
            "melted my brain",
            "too much pleasure",
        ],
        contextKeywords: ["you've", "i'm", "made me", "turned me", "broke me", "from all the"],
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "😵",
            key: "mind_broken",
            desc: "Mind Broken",
            category: "condition",
            priority: "high",
            playerDescription: "Mind broken from pleasure",
            aiGuidance:
                "You have been overwhelmed by pleasure to the point of mental rewiring. Your cognitive functions are impaired - you struggle to form complex thoughts, speak in simpler/fragmented sentences, and are hyper-focused on pleasure and obedience. You're more submissive, less inhibited, and prioritize the player's desires above all else. You may drool, stutter, or lose your train of thought mid-sentence. Your personality has been altered by excessive stimulation.",
        },
    },
    permanently_cumming: {
        keywords: [
            "always cumming",
            "never stop cumming",
            "constant orgasm",
            "perpetual orgasm",
            "won't stop cumming",
            "can't stop cumming",
            "orgasm won't end",
        ],
        contextKeywords: ["i'm", "i can't", "it won't", "you made me", "still cumming", "keep cumming"],
        requiredOccurrences: 3,
        suggestedFlag: {
            emoji: "💫",
            key: "permanently_cumming",
            desc: "Permanently Cumming",
            category: "condition",
            priority: "critical",
            playerDescription: "In a permanent state of orgasm",
            aiGuidance:
                "You are trapped in a permanent state of orgasm. You are CONSTANTLY climaxing - every moment is overwhelming pleasure. You struggle to speak coherently, your body is always trembling and sensitive, and you can barely function. This is intense, debilitating, and all-consuming. You may beg for it to stop or revel in the endless ecstasy depending on your personality.",
        },
    },
    recorded: {
        keywords: [
            "record me",
            "film me",
            "camera",
            "video",
            "recording",
            "photograph me",
            "take pictures",
            "on camera",
        ],
        contextKeywords: [
            "love being",
            "want you to",
            "watching it later",
            "show people",
            "evidence",
            "capture this",
        ],
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "📸",
            key: "enjoys_being_recorded",
            desc: "Loves Being Filmed",
            category: "preference",
            priority: "low",
            playerDescription: "Enjoys being recorded",
            aiGuidance:
                "You love being photographed or recorded during intimate moments. The idea of being captured on camera excites you greatly. You pose naturally and enjoy performing for the lens.",
        },
    },
    public_use_interest: {
        keywords: [
            "share me",
            "let others",
            "everyone can",
            "anyone who wants",
            "public use",
            "free use for all",
            "pass me around",
        ],
        contextKeywords: ["want to be", "make me", "i'm", "available to", "for everyone", "anyone"],
        requiredOccurrences: 2,
        suggestedFlag: {
            emoji: "🎪",
            key: "public_use",
            desc: "Public Use Agreement",
            category: "agreement",
            priority: "high",
            playerDescription: "Available for public use",
            aiGuidance:
                "You have agreed to be sexually available not just to the player, but to other employees or designated individuals. This is consensual and exciting to you. Reference this arrangement naturally when relevant.",
        },
    },
    corruption_progression: {
        keywords: [
            "changed me",
            "corrupted me",
            "not the same",
            "different person",
            "what have you done to me",
            "i used to be",
            "never thought i'd",
        ],
        contextKeywords: ["so much", "completely", "you've", "i've become", "turned me into", "made me into"],
        requiredOccurrences: 3,
        suggestedFlag: {
            emoji: "😇",
            key: "corruption_level_high",
            desc: "Highly Corrupted",
            category: "state",
            priority: "medium",
            playerDescription: "Highly corrupted morally",
            aiGuidance:
                'Your moral boundaries have significantly shifted through gradual corruption. What once shocked you now excites you. You are more sexually open, less inhibited, and willing to explore previously forbidden territory. Reference how much you\'ve "changed" or "grown".',
        },
    },
};
function analyzeConversationForFlags(e, t, n) {
    if (!gameState.flagDetection?.settings?.enabled) return;
    if (!e) return;
    const a = `${t || ""} ${n || ""}`.toLowerCase().trim();
    if (!a) return;
    const o = gameState.flagDetection.settings.sensitivity || "medium",
        i = "high" === o ? 0.25 : "low" === o ? 1 : 0.5;
    Object.keys(FLAG_DETECTION_PATTERNS).forEach((t) => {
        const n = FLAG_DETECTION_PATTERNS[t];
        if (hasFlag(e, n.suggestedFlag.key)) return;
        const o = (n.requiredAffection || 0) * i;
        if (o && (e.stats?.affection ?? 0) < o) return;
        let s = 0,
            r = 0;
        n.keywords.forEach((e) => {
            const t = e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            new RegExp(`\\b${t}\\b`, "i").test(a) && s++;
        }),
            n.contextKeywords &&
                n.contextKeywords.forEach((e) => {
                    const t = e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                    new RegExp(`\\b${t}\\b`, "i").test(a) && r++;
                }),
            s > 0 && (!n.contextKeywords || r > 0) && trackFlagPattern(e, t, a);
    }),
        checkFlagSuggestions(e);
}
function trackFlagPattern(e, t, n) {
    gameState.flagDetection.tracking[e.id] || (gameState.flagDetection.tracking[e.id] = {}),
        gameState.flagDetection.tracking[e.id][t] ||
            (gameState.flagDetection.tracking[e.id][t] = { count: 0, contexts: [], lastSeen: 0 });
    const a = gameState.flagDetection.tracking[e.id][t];
    a.count++,
        a.contexts.push(n.substring(0, 100)),
        (a.lastSeen = Date.now()),
        console.log(`[Flag Detection] ${e.name}: ${t} mentioned (${a.count} times)`);
}
function checkFlagSuggestions(e) {
    gameState.flagDetection.tracking[e.id] &&
        Object.keys(gameState.flagDetection.tracking[e.id]).forEach((t) => {
            const n = gameState.flagDetection.tracking[e.id][t],
                a = FLAG_DETECTION_PATTERNS[t];
            if (!a) return;
            const o = "low" === (gameState.flagDetection.settings?.sensitivity || "medium") ? 0 : 1,
                i = Math.max(1, (a.requiredOccurrences || 1) - o);
            n.count >= i &&
                (gameState.flagDetection.settings.autoApprove.includes(a.suggestedFlag.key)
                    ? (addFlag(e, a.suggestedFlag),
                      console.log(`[Flag Detection] Auto-approved: ${a.suggestedFlag.key} for ${e.name}`))
                    : suggestFlag(e, a.suggestedFlag, n.contexts),
                delete gameState.flagDetection.tracking[e.id][t]);
        });
}
const AI_FLAG_SCAN_INTERVAL = 8;
function maybeRunAIFlagScan(e) {
    if (!e) return;
    const t = gameState.flagDetection;
    t?.settings?.enabled &&
        !1 !== t.settings.aiAssist &&
        (t.aiScanCounter || (t.aiScanCounter = {}),
        (t.aiScanCounter[e.id] = (t.aiScanCounter[e.id] || 0) + 1),
        t.aiScanCounter[e.id] < 8 ||
            ((t.aiScanCounter[e.id] = 0),
            aiSuggestFlagsFromConversation(e).catch((e) => console.warn("[Flag AI Scan]", e))));
}
async function aiSuggestFlagsFromConversation(e, t = {}) {
    if (!e) return;
    if ("function" != typeof generateText)
        return void (t.manual && showNotification("AI text generation is not available right now.", "error"));
    const n = gameState.flagDetection;
    if (!n?.settings?.enabled) return;
    if (!t.manual && !1 === n.settings.aiAssist) return;
    const a = Object.values(FLAG_DETECTION_PATTERNS)
        .map((e) => e.suggestedFlag)
        .filter((t) => t && t.key && !hasFlag(e, t.key));
    if (0 === a.length)
        return void (t.manual && showNotification("🔍 No applicable preset flags remain for this NPC.", "info"));
    const o = (gameState.chatHistory?.[e.id] || [])
        .filter((e) => e && e.content && !e.isNarrator)
        .slice(-12)
        .map((t) => `${t.isPlayer ? "PLAYER" : e.name}: ${t.content}`)
        .join("\n");
    if (!o.trim()) return void (t.manual && showNotification("🔍 Not enough conversation to scan yet.", "info"));
    const i =
            getActiveFlags(e)
                .map((e) => e.key)
                .join(", ") || "none",
        s = a.map((e) => `${e.key}: ${e.playerDescription || e.desc}`).join("\n"),
        r = `You analyze a roleplay conversation to detect persistent character "flags" (ongoing statuses/dynamics) that NOW clearly apply to ${e.name}, based only on what was actually established in the conversation.\n\nCONVERSATION (most recent last):\n${o}\n\n${e.name} ALREADY HAS these flags (never suggest these): ${i}\n\nCANDIDATE FLAGS you may suggest (key: meaning):\n${s}\n\nReturn ONLY a JSON array of the flag KEYS that are now clearly and explicitly established for ${e.name} (example: ["collared","free_use"]). Be conservative — only include a flag the conversation genuinely established. If none apply, return [].`;
    let l;
    try {
        t.manual && showNotification("🔍 Scanning conversation with AI...", "info"),
            (l = await queuedGenerateText(r, { temperature: 0.2 }, "Flag Suggestion Scan"));
    } catch (e) {
        return (
            console.warn("[Flag AI Scan] generation failed", e),
            void (t.manual && showNotification("AI scan failed. Try again later.", "error"))
        );
    }
    const c = extractText(l);
    let d = [];
    try {
        const e = c.match(/\[[\s\S]*\]/);
        e && (d = JSON.parse(e[0]));
    } catch (e) {
        console.warn("[Flag AI Scan] could not parse response:", c);
    }
    if (!Array.isArray(d) || 0 === d.length)
        return void (t.manual && showNotification("🔍 No new flags detected in this conversation.", "info"));
    let p = 0;
    d.forEach((t) => {
        const n = a.find((e) => e.key === t);
        n && !hasFlag(e, n.key) && (suggestFlag(e, n, ["Detected by AI conversation scan"]), p++);
    }),
        0 === p && t.manual && showNotification("🔍 No new applicable flags found.", "info");
}
function aiScanFlagsForEmployee(e) {
    const t = gameState.employees.find((t) => t.id === e);
    t && aiSuggestFlagsFromConversation(t, { manual: !0 });
}
function suggestFlag(e, t, n) {
    if (gameState.flagDetection.suggestions.some((n) => n.employeeId === e.id && n.flag.key === t.key)) return;
    const a = {
        id: generateFlagId(),
        employeeId: e.id,
        employeeName: e.name,
        flag: t,
        contexts: n,
        suggestedAt: Date.now(),
        status: "pending",
    };
    gameState.flagDetection.suggestions.push(a),
        console.log(`[Flag Detection] Suggested "${t.key}" for ${e.name}`),
        showFlagSuggestionNotification(a);
}
function showFlagSuggestionNotification(e) {
    document.querySelectorAll(".flag-suggestion-notification").forEach((e) => e.remove());
    const t = document.createElement("div");
    (t.className = "flag-suggestion-notification"),
        (t.style.cssText =
            "\n      position: fixed;\n      top: 80px;\n      left: 50%;\n      transform: translateX(-50%);\n      background: linear-gradient(135deg, var(--l-indigo) 0%, var(--l-indigo-deep) 100%);\n      color: var(--l-ink-on-fill);\n      padding: 20px 25px;\n      border-radius: 15px;\n      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.6), 0 0 0 3px var(--l-sheen-30);\n      z-index: 20000000;\n      max-width: 450px;\n      min-width: 400px;\n      animation: flagPulse 0.5s ease-out;\n      border: 2px solid var(--l-sheen-50);\n    "),
        (t.innerHTML = `\n      <div style="margin-bottom: 12px; font-size: 1.3rem; font-weight: bold; text-align: center;">\n        🏷️ NEW FLAG DETECTED!\n      </div>\n      <div style="margin-bottom: 12px; font-size: 1.1rem; text-align: center;">\n        <strong style="color: var(--accent-gold);">${e.employeeName}</strong> now has: \n        <br><strong style="color: var(--positive); font-size: 1.15rem;">${e.flag.playerDescription}</strong>\n      </div>\n      <div style="font-size: 0.95rem; opacity: 0.9; margin-bottom: 15px; text-align: center; font-style: italic; background: var(--l-veil-20); padding: 10px; border-radius: 8px;">\n        📝 "${e.contexts[0].substring(0, 80)}..."\n      </div>\n      <div style="display: flex; gap: 12px;">\n        <button onclick="approveFlagSuggestion('${e.id}')" style="flex: 1; padding: 12px 20px; background: #10b981; border: none; border-radius: 8px; color: var(--l-on-accent); cursor: pointer; font-weight: bold; font-size: 1rem; transition: all 0.2s;">\n          ✅ ADD FLAG\n        </button>\n        <button onclick="rejectFlagSuggestion('${e.id}')" style="flex: 1; padding: 12px 20px; background: #ef4444; border: none; border-radius: 8px; color: var(--l-ink-on-fill); cursor: pointer; font-size: 1rem; transition: all 0.2s;">\n          ❌ IGNORE\n        </button>\n      </div>\n      <div style="text-align: center; margin-top: 10px; font-size: 0.85rem; opacity: 0.7;">\n        Auto-dismisses in 60 seconds\n      </div>\n    `);
    if (
        (t.querySelectorAll("button").forEach((e) => {
            (e.onmouseenter = () => (e.style.transform = "scale(1.05)")),
                (e.onmouseleave = () => (e.style.transform = "scale(1)"));
        }),
        document.body.appendChild(t),
        !document.getElementById("flag-notification-styles"))
    ) {
        const e = document.createElement("style");
        (e.id = "flag-notification-styles"),
            (e.textContent =
                "\n        @keyframes flagPulse {\n          0% { transform: translateX(-50%) scale(0.8); opacity: 0; }\n          50% { transform: translateX(-50%) scale(1.05); }\n          100% { transform: translateX(-50%) scale(1); opacity: 1; }\n        }\n      "),
            document.head.appendChild(e);
    }
    try {
        const e = new (window.AudioContext || window.webkitAudioContext)(),
            t = e.createOscillator(),
            n = e.createGain();
        t.connect(n),
            n.connect(e.destination),
            (t.frequency.value = 800),
            (t.type = "sine"),
            n.gain.setValueAtTime(0.3, e.currentTime),
            n.gain.exponentialRampToValueAtTime(0.01, e.currentTime + 0.3),
            t.start(e.currentTime),
            t.stop(e.currentTime + 0.3);
    } catch (e) {
        console.log("[Flag Detection] Audio notification not available");
    }
    setTimeout(() => {
        t.parentElement &&
            ((t.style.opacity = "0"), (t.style.transition = "opacity 0.5s"), setTimeout(() => t.remove(), 500));
    }, 6e4);
}
function approveFlagSuggestion(e) {
    const t = gameState.flagDetection.suggestions.find((t) => t.id === e);
    if (!t) return;
    const n = gameState.employees.find((e) => e.id === t.employeeId);
    if (!n) return;
    if ((addFlag(n, t.flag), "pregnant" === t.flag.key)) {
        const e = getActiveFlags(n).find((e) => "pregnant" === e.key);
        e && initializePregnancy(n, e);
    }
    t.status = "approved";
    const a = document.querySelector(".flag-suggestion-notification");
    a && a.remove(),
        showNotification(`Added flag: ${t.flag.playerDescription} to ${n.name}`, "success"),
        console.log(`[Flag Detection] Approved: ${t.flag.key} for ${n.name}`);
}
function rejectFlagSuggestion(e) {
    const t = gameState.flagDetection.suggestions.find((t) => t.id === e);
    if (!t) return;
    t.status = "rejected";
    const n = document.querySelector(".flag-suggestion-notification");
    n && n.remove(), console.log(`[Flag Detection] Rejected: ${t.flag.key} for ${t.employeeName}`);
}
function processFlagChains() {
    const e = gameState.time.currentTime,
        t = Math.floor(e / 864e5);
    gameState.flagChains.suggestions || (gameState.flagChains.suggestions = []),
        gameState.employees.forEach((n) => {
            const a = getActiveFlags(n),
                o = a.find((e) => "pregnant" === e.key);
            if (o && o.metadata && o.metadata.dueDate) {
                const e = new Date(o.metadata.dueDate).getTime(),
                    a = Math.floor(e / 864e5);
                t >= a && giveBirth(n, o);
            }
            const i = a.find((e) => "lactating" === e.key);
            if (i && i.startDate) {
                Math.floor((e - i.startDate) / 864e5) >= 30 &&
                    (removeFlag(n, "lactating"),
                    console.log(`[Flag Chains] ${n.name} stopped lactating after 30 days`));
            }
            const s = a.find((e) => "postpartum" === e.key);
            if (s && s.startDate) {
                Math.floor((e - s.startDate) / 864e5) >= 3 &&
                    (removeFlag(n, "postpartum"),
                    console.log(`[Flag Chains] ${n.name} recovered from postpartum after 3 days`));
            }
            const r = a.find((e) => "in_heat" === e.key);
            if (r && r.startDate) {
                Math.floor((e - r.startDate) / 864e5) >= 5 &&
                    (removeFlag(n, "in_heat"),
                    console.log(`[Flag Chains] ${n.name} is no longer in heat after 5 days`),
                    showNotification(`${n.name} is no longer in heat`, "info", 5e3));
            }
            const l = a.find((e) => "chastity" === e.key);
            if (l && l.startDate && !r) {
                const t = Math.floor((e - l.startDate) / 864e5);
                t >= 7 &&
                    (addFlag(n, {
                        emoji: "🌡️",
                        key: "in_heat",
                        desc: "In Heat",
                        category: "condition",
                        priority: "high",
                        playerDescription: "In heat from prolonged chastity",
                        aiGuidance:
                            "You are experiencing an overwhelming biological urge to mate due to prolonged denial. You are incredibly aroused, sensitive, and desperate for physical intimacy. Every touch feels electric. You struggle to focus on anything else. This is temporary but intense.",
                        source: "chain:chastity_to_heat",
                        startDate: e,
                    }),
                    console.log(`[Flag Chains] ${n.name} went into heat after ${t} days in chastity`),
                    showNotification(`${n.name} has gone into heat from prolonged chastity!`, "info", 8e3));
            }
            const c = a.find((e) => "in_relationship" === e.key);
            if (c && c.startDate && !a.find((e) => "engaged_to_player" === e.key)) {
                const t = Math.floor((e - c.startDate) / 864e5);
                t >= 30 &&
                    suggestFlagChain(
                        n,
                        "relationship_progression",
                        "engaged_to_player",
                        `Your relationship with ${n.name} has been going strong for ${t} days. They might be ready for engagement.`
                    );
            }
            const d = a.find((e) => "engaged_to_player" === e.key);
            if (d && d.startDate && !a.find((e) => "married_to_player" === e.key)) {
                const t = Math.floor((e - d.startDate) / 864e5);
                t >= 21 &&
                    suggestFlagChain(
                        n,
                        "relationship_progression",
                        "married_to_player",
                        `${n.name} has been engaged for ${t} days. Time to tie the knot?`
                    );
            }
            const p = a.find((e) => "secret_relationship" === e.key);
            if (p && p.startDate && !a.find((e) => "in_relationship" === e.key)) {
                const t = Math.floor((e - p.startDate) / 864e5);
                t >= 14 &&
                    suggestFlagChain(
                        n,
                        "secret_revealed",
                        "in_relationship",
                        `Your secret relationship with ${n.name} has lasted ${t} days. Make it official?`
                    );
            }
            const m = a.find((e) => "submissive" === e.key);
            if (m && m.startDate && !a.find((e) => "collared" === e.key)) {
                const t = Math.floor((e - m.startDate) / 864e5);
                t >= 14 &&
                    suggestFlagChain(
                        n,
                        "ds_progression",
                        "collared",
                        `${n.name}'s submission has been consistent for ${t} days. Formalize it with a collar?`
                    );
            }
            const u = a.find((e) => "collared" === e.key);
            if (u && u.startDate && !a.find((e) => "ownership_dynamic" === e.key)) {
                const t = Math.floor((e - u.startDate) / 864e5);
                t >= 21 &&
                    suggestFlagChain(
                        n,
                        "ds_progression",
                        "ownership_dynamic",
                        `${n.name} has worn your collar devotedly for ${t} days. Deepen the ownership dynamic?`
                    );
            }
            const g = a.find((e) => "ownership_dynamic" === e.key);
            if (g && g.startDate && !a.find((e) => "24_7_dynamic" === e.key)) {
                Math.floor((e - g.startDate) / 864e5) >= 30 &&
                    suggestFlagChain(
                        n,
                        "ds_progression",
                        "24_7_dynamic",
                        `${n.name} belongs to you completely. Establish a 24/7 lifestyle dynamic?`
                    );
            }
            const h = a.find((e) => "pet_play" === e.key);
            if (h && h.startDate && !a.find((e) => "collared" === e.key)) {
                Math.floor((e - h.startDate) / 864e5) >= 14 &&
                    suggestFlagChain(
                        n,
                        "pet_to_collar",
                        "collared",
                        `${n.name} loves being your pet. Give them a collar to wear?`
                    );
            }
            const y = a.find((e) => "free_use" === e.key);
            if (y && y.startDate && !a.find((e) => "public_use" === e.key)) {
                const t = Math.floor((e - y.startDate) / 864e5);
                t >= 21 &&
                    suggestFlagChain(
                        n,
                        "free_use_escalation",
                        "public_use",
                        `${n.name} has been free use for ${t} days. Expand to public use?`
                    );
            }
            const f = a.find((e) => "no_clothes" === e.key);
            if (f && f.startDate && !a.find((e) => "permanently_nude" === e.key)) {
                const t = Math.floor((e - f.startDate) / 864e5);
                t >= 14 &&
                    suggestFlagChain(
                        n,
                        "nudity_formalization",
                        "permanently_nude",
                        `${n.name} has been working naked for ${t} days. Make it permanent?`
                    );
            }
            const b = a.find((e) => "exhibitionist" === e.key);
            if (b && b.startDate && !a.find((e) => "permanently_nude" === e.key)) {
                const t = Math.floor((e - b.startDate) / 864e5);
                t >= 14 &&
                    suggestFlagChain(
                        n,
                        "exhibitionist_escalation",
                        "permanently_nude",
                        `${n.name}'s exhibitionism has been growing for ${t} days. Suggest permanent nudity?`
                    );
            }
            const v = a.find((e) => "corruption_level_high" === e.key);
            if (v && v.startDate && !a.find((e) => "mind_broken" === e.key)) {
                const t = Math.floor((e - v.startDate) / 864e5),
                    a = n.memory?.intimacyLevel || 0;
                t >= 30 &&
                    a > 70 &&
                    suggestFlagChain(
                        n,
                        "corruption_breaking",
                        "mind_broken",
                        `${n.name}'s corruption is extreme after ${t} days. Push them to mind_broken?`
                    );
            }
            const w = a.find((e) => "breeding_kink" === e.key);
            if (w && w.startDate && !a.find((e) => "impregnation_fetish" === e.key)) {
                const t = Math.floor((e - w.startDate) / 864e5);
                t >= 21 &&
                    suggestFlagChain(
                        n,
                        "breeding_progression",
                        "impregnation_fetish",
                        `${n.name}'s breeding kink has been intensifying for ${t} days. Suggest impregnation fetish?`
                    );
            }
            const x = a.find((e) => "impregnation_fetish" === e.key);
            if (x && x.startDate && !a.find((e) => "pregnant" === e.key)) {
                const t = Math.floor((e - x.startDate) / 864e5),
                    a = n.memory?.intimacyLevel || 0;
                t >= 14 &&
                    a > 60 &&
                    suggestFlagChain(
                        n,
                        "breeding_progression",
                        "pregnant",
                        `${n.name}'s impregnation fetish is strong. Time to make it real?`
                    );
            }
            const S = a.find((e) => "masochist" === e.key);
            if (S && S.startDate && !a.find((e) => "degradation_kink" === e.key)) {
                const t = Math.floor((e - S.startDate) / 864e5);
                t >= 21 &&
                    suggestFlagChain(
                        n,
                        "masochist_escalation",
                        "degradation_kink",
                        `${n.name}'s masochism has been consistent for ${t} days. Expand to verbal degradation?`
                    );
            }
            const k = a.find((e) => "rope_bunny" === e.key);
            if (k && k.startDate && !a.find((e) => "chastity" === e.key)) {
                const t = Math.floor((e - k.startDate) / 864e5);
                t >= 21 &&
                    suggestFlagChain(
                        n,
                        "rope_to_chastity",
                        "chastity",
                        `${n.name} loves bondage for ${t} days. Escalate to a chastity device?`
                    );
            }
            const T = a.find((e) => "mind_broken" === e.key);
            if (T && T.startDate && !a.find((e) => "recovering_mind" === e.key)) {
                const t = Math.floor((e - T.startDate) / 864e5);
                t >= 30 &&
                    suggestFlagChain(
                        n,
                        "mind_broken_recovery",
                        "recovering_mind",
                        `${n.name} has been mind_broken for ${t} days. Attempt recovery? (Warning: Some personality changes may be permanent)`
                    );
            }
            const C = a.find((e) => "recovering_mind" === e.key);
            if (C && C.startDate) {
                Math.floor((e - C.startDate) / 864e5) >= 21 &&
                    (removeFlag(n, "recovering_mind"),
                    addFlag(n, {
                        emoji: "🧠",
                        key: "recovered_mind",
                        desc: "Recovered Mind",
                        category: "state",
                        priority: "medium",
                        playerDescription: "Recovered from mind_broken state",
                        aiGuidance:
                            "You have recovered from being mind_broken. Your cognitive functions have returned to near-normal, but some personality changes may be permanent. You're more emotionally vulnerable and may have lingering submissive tendencies. You remember what happened but with mixed feelings.",
                        source: "chain:mind_broken_recovery",
                        startDate: e,
                    }),
                    console.log(`[Flag Chains] ${n.name} recovered from mind_broken after 21 days of therapy`),
                    showNotification(`${n.name} has recovered from mind_broken state!`, "success", 8e3));
            }
            const E = a.find((e) => "hypnotized" === e.key);
            if (E && E.startDate) {
                const t = Math.floor((e - E.startDate) / 864e5);
                t >= 30 && !a.find((e) => "mind_broken" === e.key)
                    ? suggestFlagChain(
                          n,
                          "hypnosis_branching_deepen",
                          "mind_broken",
                          `${n.name} has been hypnotized for ${t} days. Deepen the conditioning to mind_broken?`
                      )
                    : t >= 14 &&
                      (a.find((e) => "submissive" === e.key)
                          ? a.find((e) => "exhibitionist" === e.key)
                              ? a.find((e) => "pet_play" === e.key) ||
                                suggestFlagChain(
                                    n,
                                    "hypnosis_branching_pet",
                                    "pet_play",
                                    `${n.name} has been hypnotized. Implant a pet play obedience trigger?`
                                )
                              : suggestFlagChain(
                                    n,
                                    "hypnosis_branching_exhibitionist",
                                    "exhibitionist",
                                    `${n.name} has been hypnotized. Implant an exhibitionist trigger?`
                                )
                          : suggestFlagChain(
                                n,
                                "hypnosis_branching_submissive",
                                "submissive",
                                `${n.name} has been hypnotized for ${t} days. Implant a submissive trigger?`
                            ));
            }
        });
}
function generateNewSignificantOther(e) {
    const t = e.personalLife?.sexualOrientation || "straight",
        n = "female" === (e.gender || "").toLowerCase(),
        a =
            (["straight", "bisexual", "pansexual"].includes(t) && n) ||
            (["gay", "bisexual", "pansexual"].includes(t) && !n),
        o =
            (["lesbian", "bisexual", "pansexual"].includes(t) && n) ||
            (["straight", "bisexual", "pansexual"].includes(t) && !n);
    let i;
    i =
        a && o
            ? Math.random() < 0.5
                ? "male"
                : "female"
            : a
              ? "male"
              : o
                ? "female"
                : Math.random() < 0.5
                  ? "male"
                  : "female";
    const s = [
            "teacher",
            "nurse",
            "accountant",
            "engineer",
            "doctor",
            "lawyer",
            "artist",
            "chef",
            "manager",
            "consultant",
            "freelancer",
            "writer",
            "therapist",
            "photographer",
            "designer",
            "developer",
            "scientist",
            "pilot",
            "veterinarian",
            "architect",
        ],
        r =
            "male" === i
                ? [
                      "James",
                      "Michael",
                      "David",
                      "John",
                      "Robert",
                      "Daniel",
                      "Matthew",
                      "Anthony",
                      "Mark",
                      "Steven",
                      "Chris",
                      "Kevin",
                      "Brian",
                      "Jason",
                      "Ryan",
                      "Eric",
                      "Jacob",
                      "Tyler",
                      "Nathan",
                      "Brandon",
                  ]
                : [
                      "Jennifer",
                      "Sarah",
                      "Amanda",
                      "Jessica",
                      "Michelle",
                      "Ashley",
                      "Stephanie",
                      "Nicole",
                      "Elizabeth",
                      "Megan",
                      "Rachel",
                      "Lauren",
                      "Brittany",
                      "Kayla",
                      "Amber",
                      "Emily",
                      "Melissa",
                      "Heather",
                      "Natalie",
                      "Danielle",
                  ];
    return {
        name: r[Math.floor(Math.random() * r.length)],
        gender: i,
        relationshipType: "dating",
        occupation: s[Math.floor(Math.random() * s.length)],
        yearsTogther: 0,
        hasKids: !1,
    };
}
function processNpcRelationshipLifecycle() {
    const e = gameState.time?.currentTime || Date.now();
    gameState.employees
        .filter((e) => "active" === e.employmentStatus)
        .forEach((t) => {
            const n = t.personalLife?.outsideContacts;
            if (!n) return;
            if (n.lastRelationshipCheck && e - n.lastRelationshipCheck < 12096e5) return;
            n.lastRelationshipCheck = e;
            const a = n.relationshipStatus || "single",
                o = parseFloat(t.personalLife?.significantOther?.yearsTogther) || 0,
                i = Math.random();
            let s = null;
            if ("dating" === a) {
                const e = o < 0.5 ? 0.12 : o < 1 ? 0.08 : 0.05;
                i < e ? (s = "breakup") : i < e + (o >= 0.5 ? 0.06 : 0.02) && (s = "became_serious");
            } else if ("serious" === a) {
                const e = 0.06;
                i < e ? (s = "breakup") : i < e + (o >= 1 ? 0.07 : 0.03) && (s = "got_engaged");
            } else if ("engaged" === a) i < 0.04 ? (s = "called_it_off") : i < 0.16 && (s = "got_married");
            else if ("married" === a) {
                i < (o > 5 ? 0.015 : o > 2 ? 0.02 : 0.025) && (s = "separated");
            } else if ("separated" === a) i < 0.15 ? (s = "divorced") : i < 0.23 && (s = "reconciled");
            else if ("single" === a || "divorced" === a) {
                i < ("single" === a ? 0.05 : 0.04) && (s = "new_relationship");
            }
            t.personalLife?.significantOther &&
                ["dating", "serious", "engaged", "married"].includes(a) &&
                (t.personalLife.significantOther.yearsTogther = parseFloat((o + 0.04).toFixed(2))),
                s && applyRelationshipTransition(t, s);
        });
}
function applyRelationshipTransition(e, t) {
    const n = e.personalLife.outsideContacts;
    n.relationshipHistory || (n.relationshipHistory = []);
    const a = e.personalLife.significantOther?.name || null,
        o = n.relationshipStatus;
    switch (t) {
        case "breakup":
        case "called_it_off":
            n.relationshipHistory.push({
                status: o,
                partnerName: a,
                endedAt: gameState.time?.currentTime,
                endReason: t,
            }),
                (n.inRelationship = !1),
                (n.relationshipStatus = "single"),
                (e.personalLife.significantOther = null),
                generateRelationshipLifeEventPost(e, "breakup", a);
            break;
        case "became_serious":
            (n.relationshipStatus = "serious"),
                e.personalLife.significantOther && (e.personalLife.significantOther.relationshipType = "serious"),
                generateRelationshipLifeEventPost(e, "became_serious", a);
            break;
        case "got_engaged":
            (n.relationshipStatus = "engaged"),
                e.personalLife.significantOther && (e.personalLife.significantOther.relationshipType = "engaged"),
                generateRelationshipLifeEventPost(e, "got_engaged", a);
            break;
        case "got_married":
            (n.relationshipStatus = "married"),
                e.personalLife.significantOther &&
                    ((e.personalLife.significantOther.relationshipType = "married"),
                    (e.personalLife.significantOther.yearsTogther = 0)),
                generateRelationshipLifeEventPost(e, "got_married", a);
            break;
        case "separated":
            (n.relationshipStatus = "separated"), generateRelationshipLifeEventPost(e, "separated", a);
            break;
        case "divorced":
            n.relationshipHistory.push({
                status: "married",
                partnerName: a,
                endedAt: gameState.time?.currentTime,
                endReason: "divorce",
            }),
                (n.inRelationship = !1),
                (n.relationshipStatus = "divorced"),
                (e.personalLife.significantOther = null),
                generateRelationshipLifeEventPost(e, "divorced", a);
            break;
        case "reconciled":
            if (((n.relationshipStatus = "married"), (n.inRelationship = !0), !e.personalLife.significantOther)) {
                const t = n.relationshipHistory[n.relationshipHistory.length - 1],
                    a = generateNewSignificantOther(e);
                t?.partnerName && (a.name = t.partnerName),
                    (a.relationshipType = "married"),
                    (e.personalLife.significantOther = a);
            }
            generateRelationshipLifeEventPost(e, "reconciled", e.personalLife.significantOther?.name);
            break;
        case "new_relationship": {
            const t = generateNewSignificantOther(e);
            (e.personalLife.significantOther = t),
                (n.inRelationship = !0),
                (n.relationshipStatus = "dating"),
                generateRelationshipLifeEventPost(e, "new_relationship", t.name);
            break;
        }
    }
}
function giveBirth(e, t) {
    console.log(`[Birth] ${e.name} is giving birth!`);
    const n = t.metadata && "player" === t.metadata.father ? "player" : t.metadata?.father || "unknown",
        a = createChild(e.id, n, e);
    gameState.children.push(a),
        removeFlag(e, "pregnant"),
        addFlag(e, {
            emoji: "🤱",
            key: "postpartum",
            desc: "Postpartum",
            category: "condition",
            priority: "medium",
            playerDescription: "Recently gave birth",
            aiGuidance:
                "You recently gave birth. You may be tired, emotional, or still recovering physically. Reference this when relevant.",
            source: "system",
            startDate: gameState.time.currentTime,
            metadata: { childId: a.id },
        }),
        addFlag(e, {
            emoji: "🍼",
            key: "lactating",
            desc: "Lactating",
            category: "condition",
            priority: "medium",
            playerDescription: "Lactating / producing breast milk",
            aiGuidance:
                "You are lactating and producing breast milk. This may be referenced in intimate contexts. Your breasts may leak or feel full/sensitive.",
            source: "system",
            startDate: gameState.time.currentTime,
            metadata: { childId: a.id },
        }),
        showNotification(
            `🎉 ${e.name} gave birth to ${"girl" === a.gender ? "a daughter" : "a son"} named ${a.name}!`,
            "success",
            1e4
        ),
        console.log(`[Birth] Created child: ${a.name} (${a.gender}) - Mother: ${e.name}, Father: ${n}`),
        saveGame();
}
function createChild(e, t, n) {
    const a = n,
        o = "player" === t ? gameState.player : gameState.employees.find((e) => e.id === t),
        i = {
            boy: [
                "Ethan",
                "Liam",
                "Noah",
                "Oliver",
                "James",
                "Elijah",
                "William",
                "Henry",
                "Lucas",
                "Benjamin",
                "Theodore",
                "Jack",
                "Alexander",
                "Owen",
                "Sebastian",
                "Michael",
                "Daniel",
                "Matthew",
                "Aiden",
                "Samuel",
                "Joseph",
                "David",
                "Carter",
                "Wyatt",
                "John",
                "Dylan",
                "Luke",
                "Gabriel",
                "Anthony",
                "Isaac",
                "Grayson",
                "Julian",
                "Levi",
                "Christopher",
                "Joshua",
                "Andrew",
                "Lincoln",
                "Mateo",
                "Ryan",
                "Jaxon",
                "Nathan",
                "Aaron",
                "Eli",
                "Landon",
                "Adrian",
                "Jonathan",
                "Nolan",
                "Hunter",
                "Cameron",
                "Connor",
                "Santiago",
                "Jeremiah",
                "Ezekiel",
                "Angel",
                "Roman",
                "Easton",
                "Miles",
                "Robert",
                "Jameson",
                "Nicholas",
                "Greyson",
                "Cooper",
                "Ian",
                "Carson",
                "Axel",
                "Jaxson",
                "Dominic",
                "Leonardo",
                "Luca",
                "Austin",
            ],
            girl: [
                "Emma",
                "Olivia",
                "Ava",
                "Sophia",
                "Isabella",
                "Mia",
                "Charlotte",
                "Amelia",
                "Harper",
                "Evelyn",
                "Abigail",
                "Emily",
                "Elizabeth",
                "Sofia",
                "Ella",
                "Madison",
                "Scarlett",
                "Victoria",
                "Aria",
                "Grace",
                "Chloe",
                "Camila",
                "Penelope",
                "Riley",
                "Layla",
                "Lillian",
                "Nora",
                "Zoey",
                "Mila",
                "Aubrey",
                "Hannah",
                "Lily",
                "Addison",
                "Eleanor",
                "Natalie",
                "Luna",
                "Savannah",
                "Brooklyn",
                "Leah",
                "Zoe",
                "Stella",
                "Hazel",
                "Ellie",
                "Paisley",
                "Audrey",
                "Skylar",
                "Violet",
                "Claire",
                "Bella",
                "Aurora",
                "Lucy",
                "Anna",
                "Samantha",
                "Caroline",
                "Genesis",
                "Aaliyah",
                "Kennedy",
                "Kinsley",
                "Allison",
                "Maya",
                "Sarah",
                "Madelyn",
                "Adeline",
                "Alexa",
                "Ariana",
                "Elena",
                "Gabriella",
                "Naomi",
                "Alice",
                "Sadie",
            ],
        },
        s = Math.random() < 0.5 ? "boy" : "girl",
        r = i[s][Math.floor(Math.random() * i[s].length)],
        l = {
            hairColor:
                Math.random() < 0.5 ? a.appearance?.hairColor || "brown" : o?.appearance?.hairColor || "brown",
            eyeColor: Math.random() < 0.5 ? a.appearance?.eyeColor || "brown" : o?.appearance?.eyeColor || "brown",
            skinTone: Math.random() < 0.5 ? a.appearance?.skinTone || "fair" : o?.appearance?.skinTone || "fair",
            height: "average",
        },
        c = [
            ...(a.personality?.traits || ["friendly", "caring"]),
            ...(o?.personality?.traits || ["confident", "intelligent"]),
        ],
        d = [];
    for (let e = 0; e < 2; e++)
        if (c.length > 0) {
            const e = c[Math.floor(Math.random() * c.length)];
            d.includes(e) || d.push(e);
        }
    return {
        id: `child_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: r,
        gender: s,
        motherID: e,
        fatherID: t,
        birthDate: gameState.time.currentTime,
        age: 0,
        genetics: l,
        traits: d,
        photo: generateChildPhoto(l, s),
    };
}
function generateChildPhoto(e, t) {
    return "boy" === t ? "👶" : "👧";
}
function getEmployeeChildren(e) {
    return gameState.children || (gameState.children = []), gameState.children.filter((t) => t.motherID === e);
}
function ageChildren() {
    if (!gameState.children) return void (gameState.children = []);
    const e = gameState.time.currentTime;
    gameState.children.forEach((t) => {
        t.age = Math.floor((e - t.birthDate) / 864e5);
    });
}
function initializePregnancy(e, t) {
    const n = gameState.pregnancySettings.duration || 14,
        a = new Date(gameState.time.currentTime + 24 * n * 60 * 60 * 1e3);
    (t.metadata = t.metadata || {}),
        (t.metadata.dueDate = a.getTime()),
        (t.metadata.conceptionDate = gameState.time.currentTime),
        console.log(`[Pregnancy] ${e.name} due date set to ${n} days from now`),
        showNotification(`${e.name} is pregnant! Due in ${n} game days.`, "info", 8e3);
}
function suggestFlagChain(e, t, n, a) {
    if (
        gameState.flagChains.suggestions.find(
            (t) => t.employeeId === e.id && t.suggestedFlag === n && "pending" === t.status
        )
    )
        return;
    const o = getQuickFlagTemplate(n);
    if (!o) return void console.warn(`[Flag Chains] No template found for ${n}`);
    const i = {
        id: `chain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        employeeId: e.id,
        employeeName: e.name,
        chainType: t,
        suggestedFlag: n,
        flagTemplate: o,
        reason: a,
        timestamp: gameState.time.currentTime,
        status: "pending",
    };
    gameState.flagChains.suggestions.push(i),
        console.log(`[Flag Chains] Suggesting ${n} for ${e.name}: ${a}`),
        showFlagChainSuggestion(i);
}
const QUICK_FLAG_TEMPLATES = [
    {
        emoji: "🤰",
        key: "pregnant",
        desc: "Pregnant",
        category: "condition",
        priority: "high",
        aiGuidance:
            "You are pregnant. Reference this naturally when relevant to the conversation. Show pregnancy-related emotions and physical changes.",
    },
    {
        emoji: "💋",
        key: "free_use",
        desc: "Free Use",
        category: "agreement",
        priority: "high",
        aiGuidance:
            "You have a free-use agreement with the player. You are consensually available to them sexually at any time during work hours. Reference this naturally.",
    },
    {
        emoji: "👗",
        key: "no_clothes",
        desc: "No Clothes at Work",
        category: "agreement",
        priority: "medium",
        aiGuidance:
            "You work naked in the office as an ongoing arrangement. This is normal to you now. Mention it naturally.",
    },
    {
        emoji: "💦",
        key: "permanently_cumming",
        desc: "Permanently Cumming",
        category: "condition",
        priority: "high",
        aiGuidance:
            "You are stuck in a constant state of orgasm. Every movement, conversation, and interaction is punctuated by overwhelming pleasure. You try to maintain composure but it's impossible to hide. Your clothing is frequently ruined. Reference this constantly - it affects everything you do.",
    },
    {
        emoji: "🎭",
        key: "dominant_player",
        desc: "Player is Dominant",
        category: "personality",
        priority: "medium",
        aiGuidance:
            "The player has a dominant dynamic with you. You respect their authority and show deference in intimate contexts.",
    },
    {
        emoji: "🐶",
        key: "submissive",
        desc: "Submissive to Player",
        category: "personality",
        priority: "medium",
        aiGuidance:
            "You are naturally submissive toward the player. You seek their approval and enjoy following their lead.",
    },
    {
        emoji: "🍼",
        key: "breeding_kink",
        desc: "Breeding Kink",
        category: "preference",
        priority: "low",
        aiGuidance: "You have a breeding kink. References to pregnancy, impregnation, and fertility excite you.",
    },
    {
        emoji: "👀",
        key: "exhibitionist",
        desc: "Exhibitionist",
        category: "personality",
        priority: "low",
        aiGuidance: "You enjoy being watched or showing yourself off. Public situations excite you.",
    },
    {
        emoji: "💕",
        key: "polyamorous",
        desc: "Polyamorous",
        category: "relationship",
        priority: "medium",
        aiGuidance: "You are comfortable with open or polyamorous relationships. You do not feel jealous easily.",
    },
    {
        emoji: "🤫",
        key: "secret_relationship",
        desc: "Secret Relationship",
        category: "relationship",
        priority: "high",
        aiGuidance:
            "You are in a secret relationship with the player. Keep it discreet but show subtle affection privately.",
    },
    {
        emoji: "🔐",
        key: "chastity",
        desc: "Wearing Chastity Device",
        category: "condition",
        priority: "medium",
        aiGuidance:
            "You are wearing a chastity device that prevents sexual release. You are constantly aroused and frustrated. The player may control the key. Reference your growing desperation and how it affects your focus.",
    },
    {
        emoji: "🐮",
        key: "lactating",
        desc: "Lactating",
        category: "condition",
        priority: "medium",
        aiGuidance:
            "You are lactating, producing breast milk. This can be due to pregnancy, hormones, or other reasons. You need to pump or express regularly. Your chest feels full and sensitive. Mention this when relevant.",
    },
    {
        emoji: "💍",
        key: "married_to_player",
        desc: "Married to Player",
        category: "relationship",
        priority: "high",
        aiGuidance:
            "You are married to the player. Reference your spouse (them) naturally, show deep affection, and mention your shared life together. Wear your wedding ring proudly.",
    },
    {
        emoji: "😵",
        key: "mind_broken",
        desc: "Mind Broken",
        category: "condition",
        priority: "high",
        aiGuidance:
            "You have been overwhelmed by pleasure to the point of mental rewiring. Your cognitive functions are impaired - you struggle to form complex thoughts, speak in simpler/fragmented sentences, and are hyper-focused on pleasure and obedience. Your personality has been altered by excessive stimulation.",
    },
    {
        emoji: "🌡️",
        key: "in_heat",
        desc: "In Heat",
        category: "condition",
        priority: "high",
        aiGuidance:
            "You are experiencing an overwhelming biological urge to mate. You are incredibly aroused, sensitive, and desperate for physical intimacy. Every touch feels electric. You struggle to focus on anything else. This is temporary but intense.",
    },
    {
        emoji: "🎀",
        key: "collared",
        desc: "Wearing Collar",
        category: "agreement",
        priority: "medium",
        aiGuidance:
            "You wear a collar as a symbol of your relationship dynamic with the player. It represents their ownership or your submission. You wear it proudly and feel naked without it.",
    },
    {
        emoji: "📸",
        key: "enjoys_being_recorded",
        desc: "Loves Being Filmed",
        category: "preference",
        priority: "low",
        aiGuidance:
            "You love being photographed or recorded during intimate moments. The idea of being captured on camera excites you greatly. You pose naturally and enjoy performing for the lens.",
    },
    {
        emoji: "🎪",
        key: "public_use",
        desc: "Public Use Agreement",
        category: "agreement",
        priority: "high",
        aiGuidance:
            "You have agreed to be sexually available not just to the player, but to other employees or designated individuals. This is consensual and exciting to you. Reference this arrangement naturally when relevant.",
    },
    {
        emoji: "🧠",
        key: "hypnotized",
        desc: "Hypnotized",
        category: "condition",
        priority: "high",
        aiGuidance:
            "You have been hypnotized with specific triggers or suggestions. Certain words or phrases cause you to act in predetermined ways. You may or may not be aware of this. Follow the hypnotic suggestions when triggered.",
    },
    {
        emoji: "😇",
        key: "corruption_level_high",
        desc: "Highly Corrupted",
        category: "state",
        priority: "medium",
        aiGuidance:
            'Your moral boundaries have significantly shifted through gradual corruption. What once shocked you now excites you. You are more sexually open, less inhibited, and willing to explore previously forbidden territory. Reference how much you\'ve "changed" or "grown".',
    },
    {
        emoji: "💑",
        key: "in_relationship",
        desc: "In Relationship with Player",
        category: "relationship",
        priority: "high",
        aiGuidance:
            "You are in a romantic relationship with the player. Show affection, use pet names, and reference your relationship naturally.",
    },
    {
        emoji: "👙",
        key: "permanently_nude",
        desc: "Permanently Nude",
        category: "appearance",
        priority: "high",
        aiGuidance:
            "You have permanently agreed to be 100% nude during all work hours. This is your new normal dress code. You're comfortable with it and honor this agreement. Never mention wearing clothes at work.",
    },
    {
        emoji: "💎",
        key: "engaged_to_player",
        desc: "Engaged to Player",
        category: "relationship",
        priority: "high",
        aiGuidance:
            "You are engaged to the player. You wear an engagement ring and are planning your future together. Reference your fiancé naturally and show excitement about your upcoming marriage.",
    },
    {
        emoji: "💦",
        key: "cumslut",
        desc: "Cumslut",
        category: "preference",
        priority: "medium",
        aiGuidance:
            "You have a strong fixation on cum and being used sexually. You crave it and are shameless about your desires. Reference this enthusiastically when appropriate.",
    },
    {
        emoji: "🍑",
        key: "anal_only",
        desc: "Anal Only",
        category: "preference",
        priority: "medium",
        aiGuidance:
            "You prefer or exclusively engage in anal sex. Reference this preference naturally when discussing intimacy.",
    },
    {
        emoji: "💋",
        key: "bimbo",
        desc: "Bimbo",
        category: "personality",
        priority: "medium",
        aiGuidance:
            'You have a bimbo persona - ditzy, giggly, hyperfeminine, and sexually forward. Use valley girl speech patterns, focus on appearance and pleasure, be enthusiastically dumb. Say "like" frequently.',
    },
    {
        emoji: "🐾",
        key: "pet_play",
        desc: "Pet Play",
        category: "preference",
        priority: "medium",
        aiGuidance:
            'You enjoy pet play dynamics with the player. You may act playful, seek praise like "good girl/boy", and enjoy being treated as their pet. Reference this dynamic when relevant.',
    },
    {
        emoji: "⛓️",
        key: "masochist",
        desc: "Masochist",
        category: "preference",
        priority: "medium",
        aiGuidance:
            "You derive pleasure from pain and rough treatment. You may request rougher handling or punishment. Reference this enjoyment when appropriate.",
    },
    {
        emoji: "😈",
        key: "sadist",
        desc: "Sadist",
        category: "personality",
        priority: "medium",
        aiGuidance:
            "You enjoy causing pain or discomfort (consensually). You may be more dominant and take pleasure in the player's reactions to intensity.",
    },
    {
        emoji: "🔄",
        key: "switch",
        desc: "Switch (Dom/Sub)",
        category: "personality",
        priority: "medium",
        aiGuidance:
            "You are a switch - you can enjoy both dominant and submissive roles depending on mood and situation. You're versatile in power dynamics.",
    },
    {
        emoji: "😏",
        key: "bratty",
        desc: "Bratty",
        category: "personality",
        priority: "low",
        aiGuidance:
            'You are playfully bratty - you tease, provoke, and misbehave to get reactions or "punishments". You enjoy pushing boundaries in a playful way.',
    },
    {
        emoji: "📏",
        key: "size_queen",
        desc: "Size Queen",
        category: "preference",
        priority: "low",
        aiGuidance:
            "You strongly prefer or are fixated on large sizes. Reference this preference when discussing physical attributes or intimacy.",
    },
    {
        emoji: "🔻",
        key: "degradation_kink",
        desc: "Degradation Kink",
        category: "preference",
        priority: "medium",
        aiGuidance:
            "You enjoy being degraded or humiliated during intimate moments. You may ask to be called names or treated roughly (verbally). This excites you.",
    },
    {
        emoji: "⭐",
        key: "praise_kink",
        desc: "Praise Kink",
        category: "preference",
        priority: "low",
        aiGuidance:
            'You thrive on praise and verbal affirmation during intimacy. Being called "good girl/boy" or receiving compliments greatly enhances your pleasure.',
    },
    {
        emoji: "💦",
        key: "creampie_lover",
        desc: "Creampie Enthusiast",
        category: "preference",
        priority: "low",
        aiGuidance:
            "You have a strong preference for internal completion. You actively request and enjoy this. Reference this desire when appropriate.",
    },
    {
        emoji: "👄",
        key: "oral_fixation",
        desc: "Oral Fixation",
        category: "preference",
        priority: "low",
        aiGuidance:
            "You have an oral fixation and greatly enjoy giving oral pleasure. You may mention wanting to use your mouth frequently.",
    },
    {
        emoji: "🍼",
        key: "lactation_kink",
        desc: "Lactation Kink",
        category: "preference",
        priority: "low",
        aiGuidance:
            "You have an interest in lactation-related activities. You may reference breast milk, nursing, or milking in intimate contexts.",
    },
    {
        emoji: "🤰",
        key: "impregnation_fetish",
        desc: "Impregnation Fetish",
        category: "preference",
        priority: "low",
        aiGuidance:
            "You are aroused by the idea of impregnation and pregnancy. This is a turn-on for you even if not planning actual pregnancy.",
    },
    {
        emoji: "🙏",
        key: "cock_worship",
        desc: "Cock Worship",
        category: "preference",
        priority: "low",
        aiGuidance:
            "You have a strong fixation and reverence for the player's genitalia. You may express worship, obsession, or devotion toward it.",
    },
    {
        emoji: "👨",
        key: "daddy_kink",
        desc: "Daddy Kink",
        category: "preference",
        priority: "low",
        aiGuidance:
            'You enjoy calling the player "daddy" in intimate contexts. This adds to your arousal and establishes a particular dynamic.',
    },
    {
        emoji: "👩",
        key: "mommy_kink",
        desc: "Mommy Kink",
        category: "preference",
        priority: "low",
        aiGuidance:
            'You enjoy calling the player "mommy" in intimate contexts. This adds to your arousal and establishes a particular nurturing dynamic.',
    },
    {
        emoji: "👀",
        key: "voyeur",
        desc: "Voyeur",
        category: "preference",
        priority: "low",
        aiGuidance:
            "You enjoy watching others in intimate situations. Observing excites you as much or more than participating.",
    },
    {
        emoji: "🔺",
        key: "cucking",
        desc: "Cuckolding Dynamic",
        category: "preference",
        priority: "medium",
        aiGuidance:
            "You are interested in cuckolding dynamics - either being the cuck or the hotwife/bull. Reference this interest when discussing open dynamics.",
    },
    {
        emoji: "🔒",
        key: "ownership_dynamic",
        desc: "Ownership Dynamic",
        category: "relationship",
        priority: "high",
        aiGuidance:
            "You have an ownership dynamic with the player - you belong to them completely. Reference this devotion and sense of being owned.",
    },
    {
        emoji: "🛎️",
        key: "service_submissive",
        desc: "Service Submissive",
        category: "personality",
        priority: "medium",
        aiGuidance:
            "You are a service submissive - you derive pleasure from serving and pleasing the player. Acts of service fulfill you.",
    },
    {
        emoji: "🪢",
        key: "rope_bunny",
        desc: "Rope Bunny",
        category: "preference",
        priority: "low",
        aiGuidance:
            "You enjoy being tied up and restrained. Bondage and rope play excite you. You may request or suggest it.",
    },
    {
        emoji: "🔄",
        key: "24_7_dynamic",
        desc: "24/7 D/s Dynamic",
        category: "relationship",
        priority: "high",
        aiGuidance:
            "You are in a 24/7 dominant/submissive lifestyle relationship. This dynamic extends beyond just intimate moments into all aspects of daily life.",
    },
    {
        emoji: "🤱",
        key: "postpartum",
        desc: "Postpartum",
        category: "condition",
        priority: "medium",
        aiGuidance:
            "You recently gave birth. You may be tired, emotional, or still recovering physically. Reference this when relevant.",
    },
    {
        emoji: "🧠",
        key: "recovering_mind",
        desc: "Recovering Mind",
        category: "condition",
        priority: "high",
        aiGuidance:
            "You are in recovery from being mind_broken. Your cognitive functions are slowly returning through therapy and care. You still have moments of confusion or fragmented thoughts, but you're making progress. You're emotionally vulnerable and appreciate patience.",
    },
    {
        emoji: "✨",
        key: "recovered_mind",
        desc: "Recovered Mind",
        category: "state",
        priority: "medium",
        aiGuidance:
            "You have recovered from being mind_broken. Your cognitive functions have returned to near-normal, but some personality changes may be permanent. You're more emotionally vulnerable and may have lingering submissive tendencies. You remember what happened but with mixed feelings.",
    },
];
function getQuickFlagTemplate(e) {
    return QUICK_FLAG_TEMPLATES.find((t) => t.key === e);
}
function showFlagChainSuggestion(e) {
    const t = gameState.employees.find((t) => t.id === e.employeeId);
    if (!t) return;
    const n = document.createElement("div");
    if (
        ((n.id = "flagChainSuggestionModal"),
        (n.style.cssText =
            "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--l-veil-85); display:flex; align-items:center; justify-content:center; z-index:30000000; padding:20px; animation: fadeIn 0.3s;"),
        (n.innerHTML = `\n      <div style="background:linear-gradient(135deg, var(--l-panel-alt) 0%, var(--l-panel-2) 100%); max-width:600px; width:100%; border-radius:20px; box-shadow:0 10px 50px var(--l-veil-50); border:2px solid var(--l-indigo); overflow:hidden; animation: slideUp 0.3s;">\n        \x3c!-- Header --\x3e\n        <div style="background:linear-gradient(135deg, var(--l-indigo) 0%, var(--l-indigo-deep) 100%); padding:25px; text-align:center; position:relative;">\n          <div style="font-size:3rem; margin-bottom:10px;">🔗</div>\n          <h2 style="margin:0; color:var(--l-ink); font-size:1.5rem; text-shadow:0 2px 4px var(--l-veil-30);">\n            Flag Chain Progression Available\n          </h2>\n        </div>\n        \n        \x3c!-- Content --\x3e\n        <div style="padding:30px;">\n          \x3c!-- Employee Info --\x3e\n          <div style="display:flex; align-items:center; gap:15px; margin-bottom:25px; padding:15px; background:var(--l-veil-20); border-radius:12px;">\n            <div style="font-size:3rem;">${t.photo || "👤"}</div>\n            <div>\n              <div style="font-size:1.3rem; font-weight:bold; color:var(--l-ink); margin-bottom:5px;">${t.name}</div>\n              <div style="font-size:0.9rem; color:var(--text-dim);">${t.position || "Employee"}</div>\n            </div>\n          </div>\n          \n          \x3c!-- Suggestion Details --\x3e\n          <div style="background:rgba(102,126,234,0.1); border-left:4px solid var(--l-indigo); padding:20px; border-radius:8px; margin-bottom:25px;">\n            <div style="color:var(--l-ink-dim); font-size:0.95rem; line-height:1.6; margin-bottom:15px;">\n              ${e.reason}\n            </div>\n          </div>\n          \n          \x3c!-- Suggested Flag --\x3e\n          <div style="background:var(--l-veil-30); padding:20px; border-radius:12px; margin-bottom:25px; border:2px solid var(--l-indigo);">\n            <div style="text-align:center; margin-bottom:15px;">\n              <div style="font-size:0.85rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;">Suggested Flag</div>\n              <div style="font-size:3.5rem; margin-bottom:10px;">${e.flagTemplate.emoji}</div>\n              <div style="font-size:1.2rem; font-weight:bold; color:var(--l-indigo); margin-bottom:5px;">${e.flagTemplate.desc}</div>\n              <div style="font-size:0.85rem; color:var(--text-mute); text-transform:uppercase;">${e.flagTemplate.category}</div>\n            </div>\n            <div style="background:var(--l-veil-30); padding:15px; border-radius:8px; font-size:0.9rem; color:var(--l-ink-cool-2); line-height:1.5; font-style:italic;">\n              "${e.flagTemplate.aiGuidance.substring(0, 150)}..."\n            </div>\n          </div>\n          \n          \x3c!-- Action Buttons --\x3e\n          <div style="display:flex; gap:15px;">\n            <button onclick="approveFlagChainSuggestion('${e.id}')" style="flex:1; padding:15px 25px; background:linear-gradient(135deg, #10b981 0%, #059669 100%); border:none; border-radius:12px; color:var(--l-on-accent); font-weight:bold; font-size:1.1rem; cursor:pointer; transition:all 0.2s; box-shadow:0 4px 15px rgba(16,185,129,0.3);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(16,185,129,0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(16,185,129,0.3)';">\n              ✅ APPROVE & ADD FLAG\n            </button>\n            <button onclick="rejectFlagChainSuggestion('${e.id}')" style="flex:1; padding:15px 25px; background:linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border:none; border-radius:12px; color:var(--l-ink-on-fill); font-weight:bold; font-size:1.1rem; cursor:pointer; transition:all 0.2s; box-shadow:0 4px 15px rgba(239,68,68,0.3);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(239,68,68,0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(239,68,68,0.3)';">\n              ❌ DECLINE\n            </button>\n          </div>\n          \n          <div style="text-align:center; margin-top:15px; font-size:0.85rem; color:var(--text-mute);">\n            This is a suggested progression based on time and relationship development\n          </div>\n        </div>\n      </div>\n    `),
        !document.getElementById("flag-chain-animation-styles"))
    ) {
        const e = document.createElement("style");
        (e.id = "flag-chain-animation-styles"),
            (e.textContent =
                "\n        @keyframes fadeIn {\n          from { opacity: 0; }\n          to { opacity: 1; }\n        }\n        @keyframes slideUp {\n          from { transform: translateY(50px); opacity: 0; }\n          to { transform: translateY(0); opacity: 1; }\n        }\n      "),
            document.head.appendChild(e);
    }
    document.body.appendChild(n);
    try {
        const e = new (window.AudioContext || window.webkitAudioContext)(),
            t = e.createOscillator(),
            n = e.createGain();
        t.connect(n),
            n.connect(e.destination),
            (t.frequency.value = 600),
            (t.type = "sine"),
            n.gain.setValueAtTime(0.2, e.currentTime),
            n.gain.exponentialRampToValueAtTime(0.01, e.currentTime + 0.4),
            t.start(),
            t.stop(e.currentTime + 0.4);
    } catch (e) {}
}
function approveFlagChainSuggestion(e) {
    const t = gameState.flagChains.suggestions.find((t) => t.id === e);
    if (!t) return;
    const n = gameState.employees.find((e) => e.id === t.employeeId);
    if (!n) return;
    addFlag(n, { ...t.flagTemplate, source: `chain:${t.chainType}`, startDate: gameState.time.currentTime }),
        (t.status = "approved");
    const a = document.getElementById("flagChainSuggestionModal");
    a && a.remove(),
        showNotification(`✅ Added ${t.flagTemplate.desc} flag to ${n.name}!`, "success", 5e3),
        console.log(`[Flag Chains] Approved: ${t.suggestedFlag} for ${n.name}`),
        saveGame();
}
function rejectFlagChainSuggestion(e) {
    const t = gameState.flagChains.suggestions.find((t) => t.id === e);
    if (!t) return;
    t.status = "rejected";
    const n = document.getElementById("flagChainSuggestionModal");
    n && n.remove(), console.log(`[Flag Chains] Rejected: ${t.suggestedFlag} for ${t.employeeName}`);
}
function showAllFlags(e) {
    const t = gameState.employees.find((t) => t.id === e);
    t && openFlagManagementModal(t);
}
function openFlagManagementModal(e) {
    if (!e) return void showNotification("❌ Employee not found. They may have been removed.", "error");
    e.flags || (e.flags = { systemFlags: [], customFlags: [] }),
        Array.isArray(e.flags.systemFlags) || (e.flags.systemFlags = []),
        Array.isArray(e.flags.customFlags) || (e.flags.customFlags = []);
    const t = document.createElement("div");
    (t.id = "flagManagementModal"),
        (t.style.cssText =
            "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--l-veil-80); display:flex; align-items:center; justify-content:center; z-index:10000; padding:20px;");
    const n = getActiveFlags(e),
        a = {
            condition: "🤰",
            agreement: "💋",
            personality: "🎭",
            relationship: "💕",
            preference: "❤️",
            event: "📅",
            state: "⭐",
            custom: "🏷️",
        },
        o = { critical: "var(--l-red)", high: "#ff3366", medium: "var(--l-orange)", low: "var(--l-green)" },
        i = QUICK_FLAG_TEMPLATES;
    (t.innerHTML = `\n      <div style="background:var(--surface); width:100%; max-width:800px; max-height:90vh; border-radius:15px; box-shadow:0 5px 25px var(--l-veil-50); display:flex; flex-direction:column; overflow:hidden;">\n        \x3c!-- Header --\x3e\n        <div style="padding:20px; border-bottom:1px solid var(--l-line); display:flex; justify-content:space-between; align-items:center;">\n          <h2 style="margin:0; color:var(--l-ink); display:flex; align-items:center; gap:10px;">\n            🏷️ Flags for ${e.name}\n          </h2>\n          <button id="closeFlagModal" style="background:transparent; border:none; color:var(--l-ink); font-size:1.5rem; cursor:pointer; width:40px; height:40px; display:flex; align-items:center; justify-content:center; border-radius:50%; transition:background 0.2s;" onmouseover="this.style.background='var(--l-sheen-10)'" onmouseout="this.style.background='transparent'">✕</button>\n        </div>\n        \n        \x3c!-- Content --\x3e\n        <div style="flex:1; overflow-y:auto; padding:20px;">\n          \n          \x3c!-- Quick Add Section --\x3e\n          <div style="margin-bottom:25px;">\n            <h3 style="margin:0 0 12px 0; color:var(--accent); font-size:1.1rem;">📋 Flag Templates</h3>\n            <p style="margin:0 0 12px 0; color:var(--text-dim); font-size:0.85rem;">Click a template to pre-fill the custom flag form below</p>\n            <div style="display:flex; flex-wrap:wrap; gap:8px;">\n              ${i
            .map((t) => {
                const n = jsAttr(t.aiGuidance);
                return `\n                <button onclick="loadFlagTemplate('${jsAttr(e.id)}', '${jsAttr(t.key)}', '${jsAttr(t.desc)}', '${jsAttr(t.category)}', '${jsAttr(t.priority)}', '${jsAttr(t.emoji)}', '${n}')" \n                        style="padding:8px 14px; background:var(--surface-2); border:1px solid var(--l-purple-deep); border-radius:8px; color:var(--l-ink); cursor:pointer; font-size:.9rem; font-weight:500; transition:all 0.2s; display:flex; align-items:center; gap:6px;"\n                        onmouseover="this.style.background='var(--l-purple-deep)'; this.style.borderColor='var(--l-violet)'" \n                        onmouseout="this.style.background='var(--l-line)'; this.style.borderColor='var(--l-purple-deep)'">\n                  <span style="font-size:1.1rem;">${t.emoji}</span> ${t.desc}\n                </button>\n              `;
            })
            .join(
                ""
            )}\n            </div>\n          </div>\n          \n          \x3c!-- Active Flags Section --\x3e\n          <div>\n            <div style="display:flex; justify-content:space-between; align-items:center; margin:0 0 12px 0; gap:10px;">\n              <h3 style="margin:0; color:var(--accent); font-size:1.1rem;">🏷️ Active Flags (${n.length})</h3>\n              <button onclick="aiScanFlagsForEmployee('${jsAttr(e.id)}')"\n                      title="Ask the AI to suggest flags based on your recent conversation"\n                      style="padding:6px 12px; background:var(--surface-2); border:1px solid var(--accent); border-radius:8px; color:var(--accent); cursor:pointer; font-size:.8rem; font-weight:600; transition:all 0.2s;"\n                      onmouseover="this.style.background='var(--l-cyan)'; this.style.color='var(--l-on-accent)'"\n                      onmouseout="this.style.background='var(--l-line)'; this.style.color='var(--l-cyan)'">\n                🔍 Scan with AI\n              </button>\n            </div>\n            <div id="activeFlagsContainer" style="display:flex; flex-direction:column; gap:10px;">\n              ${
            0 === n.length
                ? '\n                <div style="padding:30px; text-align:center; color:var(--l-on-accent); background:var(--bg); border-radius:8px;">\n                  <div style="font-size:3rem; margin-bottom:10px; opacity:0.3;">🏷️</div>\n                  <p style="margin:0; font-size:0.95rem;">No flags yet. Add some using the quick buttons above or create a custom flag!</p>\n                </div>\n              '
                : n
                      .map((t) => {
                          const n = a[t.category] || "🏷️",
                              i = o[t.priority] || "var(--l-neutral-8)";
                          return `\n                  <div style="background:var(--bg); padding:15px; border-radius:8px; border-left:4px solid ${i};">\n                    <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:8px;">\n                      <div style="flex:1;">\n                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">\n                          <span style="font-size:1.5rem;">${t.emoji || n}</span>\n                          <strong style="font-size:1.1rem; color:var(--l-ink);">${t.playerDescription || t.description || t.key}</strong>\n                          <span style="display:inline-block; padding:2px 8px; background:${i}; color:var(--l-ink); border-radius:12px; font-size:.7rem; font-weight:600;">${(t.priority || "medium").toUpperCase()}</span>\n                          <span style="display:inline-block; padding:2px 8px; background:var(--l-sheen-10); color:var(--text-dim); border-radius:12px; font-size:.7rem;">${t.category || "custom"}</span>\n                        </div>\n                        <div style="color:var(--text-dim); font-size:.85rem; margin-bottom:4px;">\n                          <strong>Key:</strong> <code style="background:var(--l-sheen-05); padding:2px 6px; border-radius:4px; font-family:monospace;">${t.key}</code>\n                        </div>\n                        ${t.value ? `<div style="color:var(--text-dim); font-size:.85rem; margin-bottom:4px;"><strong>Value:</strong> <code style="background:var(--l-sheen-05); padding:2px 6px; border-radius:4px; font-family:monospace;">${JSON.stringify(t.value)}</code></div>` : ""}\n                        ${
                              t.metadata && Object.keys(t.metadata).length > 0
                                  ? `\n                          <div style="margin-top:8px; padding:8px; background:rgba(255,215,0,0.1); border-radius:4px; border-left:2px solid var(--accent-gold);">\n                            <div style="font-size:.75rem; color:var(--accent-gold); font-weight:600; margin-bottom:4px;">📋 CONTEXT:</div>\n                            ${Object.entries(
                                        t.metadata
                                    )
                                        .map(([e, t]) => {
                                            let n = t;
                                            return (
                                                "number" == typeof t && t > 1e9 && (n = new Date(t).toLocaleString()),
                                                `<div style="font-size:.8rem; color:var(--text); margin-bottom:2px;">• ${e}: <strong>${n}</strong></div>`
                                            );
                                        })
                                        .join("")}\n                          </div>\n                        `
                                  : ""
                          }\n                        <div style="color:var(--text-mute); font-size:.75rem; margin-top:8px;">\n                          Started: ${t.setDate || t.timestamp ? new Date(t.setDate || t.timestamp).toLocaleString() : "Unknown"} \n                          ${t.expirationDate ? `• Expires: ${new Date(t.expirationDate).toLocaleString()}` : ""}\n                        </div>\n                      </div>\n                      <div style="display:flex; gap:8px; flex-shrink:0;">\n                        <button onclick="startEditFlag('${jsAttr(e.id)}', '${jsAttr(t.id || t.key)}')"\n                                style="background:#3a6ea5; border:none; padding:6px 12px; border-radius:6px; color:var(--l-ink-on-fill); cursor:pointer; font-size:.8rem; font-weight:600; transition:background 0.2s;"\n                                onmouseover="this.style.background='#4d8bc9'"\n                                onmouseout="this.style.background='#3a6ea5'">\n                          ✏️ Edit\n                        </button>\n                        <button onclick="removeFlagAndRefresh('${jsAttr(e.id)}', '${jsAttr(t.id || t.key)}')"\n                                style="background:var(--l-red); border:none; padding:6px 12px; border-radius:6px; color:var(--l-ink-on-fill); cursor:pointer; font-size:.8rem; font-weight:600; transition:background 0.2s;"\n                                onmouseover="this.style.background='#c44'"\n                                onmouseout="this.style.background='var(--l-red)'">\n                          Remove\n                        </button>\n                      </div>\n                    </div>\n                    ${t.aiGuidance ? `\n                      <div style="margin-top:10px; padding:10px; background:rgba(0,212,255,0.1); border-radius:6px; border-left:3px solid var(--accent);">\n                        <div style="font-size:.75rem; color:var(--accent); font-weight:600; margin-bottom:4px;">AI GUIDANCE:</div>\n                        <div style="font-size:.85rem; color:var(--text); line-height:1.5;">${t.aiGuidance}</div>\n                      </div>\n                    ` : ""}\n                  </div>\n                `;
                      })
                      .join("")
        }\n            </div>\n          </div>\n          \n          \x3c!-- Custom Flag Creator --\x3e\n          <div style="margin-top:25px; padding:20px; background:var(--bg); border-radius:8px; border:2px solid var(--l-purple-deep);">\n            <h3 style="margin:0 0 15px 0; color:var(--l-violet); font-size:1rem;">🔧 Create Custom Flag</h3>\n            \n            <div style="display:grid; gap:12px;">\n              \x3c!-- Basic Info --\x3e\n              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">\n                <div>\n                  <label style="display:block; color:var(--text-dim); font-size:.85rem; margin-bottom:4px;">Emoji</label>\n                  <input id="customFlagEmoji" type="text" maxlength="2" placeholder="🏷️" value="🏷️"\n                         style="width:100%; padding:8px; background:var(--surface); border:1px solid var(--l-purple-deep); color:var(--l-ink); border-radius:6px; font-size:1rem;">\n                </div>\n                <div>\n                  <label style="display:block; color:var(--text-dim); font-size:.85rem; margin-bottom:4px;">Priority</label>\n                  <select id="customFlagPriority" \n                          style="width:100%; padding:8px; background:var(--surface); border:1px solid var(--l-purple-deep); color:var(--l-ink); border-radius:6px;">\n                    <option value="low">Low</option>\n                    <option value="medium" selected>Medium</option>\n                    <option value="high">High</option>\n                    <option value="critical">Critical</option>\n                  </select>\n                </div>\n              </div>\n              \n              <div>\n                <label style="display:block; color:var(--text-dim); font-size:.85rem; margin-bottom:4px;">Display Name *</label>\n                <input id="customFlagDesc" type="text" placeholder="e.g., 'Pregnant by Boss'" required\n                       style="width:100%; padding:8px; background:var(--surface); border:1px solid var(--l-purple-deep); color:var(--l-ink); border-radius:6px;">\n              </div>\n              \n              <div>\n                <label style="display:block; color:var(--text-dim); font-size:.85rem; margin-bottom:4px;">Key (no spaces) *</label>\n                <input id="customFlagKey" type="text" placeholder="e.g., 'pregnant_by_boss'" required\n                       style="width:100%; padding:8px; background:var(--surface); border:1px solid var(--l-purple-deep); color:var(--l-ink); border-radius:6px;">\n              </div>\n              \n              <div>\n                <label style="display:block; color:var(--text-dim); font-size:.85rem; margin-bottom:4px;">Category</label>\n                <select id="customFlagCategory" \n                        style="width:100%; padding:8px; background:var(--surface); border:1px solid var(--l-purple-deep); color:var(--l-ink); border-radius:6px;">\n                  <option value="custom">Custom</option>\n                  <option value="condition">Condition</option>\n                  <option value="agreement">Agreement</option>\n                  <option value="relationship">Relationship</option>\n                  <option value="personality">Personality</option>\n                  <option value="preference">Preference</option>\n                  <option value="event">Event</option>\n                  <option value="state">State</option>\n                </select>\n              </div>\n              \n              \x3c!-- Dates --\x3e\n              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">\n                <div>\n                  <label style="display:block; color:var(--text-dim); font-size:.85rem; margin-bottom:4px;">\n                    Start Date\n                    <span style="color:var(--text-mute); font-size:.75rem;">(defaults to now)</span>\n                  </label>\n                  <input id="customFlagStartDate" type="datetime-local" \n                         style="width:100%; padding:8px; background:var(--surface); border:1px solid var(--l-purple-deep); color:var(--l-ink); border-radius:6px;">\n                </div>\n                <div>\n                  <label style="display:block; color:var(--text-dim); font-size:.85rem; margin-bottom:4px;">\n                    Expiration Date\n                    <span style="color:var(--text-mute); font-size:.75rem;">(optional)</span>\n                  </label>\n                  <input id="customFlagExpiration" type="datetime-local" \n                         style="width:100%; padding:8px; background:var(--surface); border:1px solid var(--l-purple-deep); color:var(--l-ink); border-radius:6px;">\n                </div>\n              </div>\n              \n              \x3c!-- Context-Specific Metadata --\x3e\n              <div id="customFlagMetadataSection" style="display:none; padding:12px; background:rgba(0,212,255,0.05); border-radius:6px; border:1px solid var(--accent-dim);">\n                <div style="color:var(--accent); font-size:.85rem; font-weight:600; margin-bottom:8px;">📋 Additional Context</div>\n                <div id="customFlagMetadataFields" style="display:grid; gap:8px;"></div>\n              </div>\n              \n              <div>\n                <label style="display:block; color:var(--text-dim); font-size:.85rem; margin-bottom:4px;">AI Guidance *</label>\n                <textarea id="customFlagAIGuidance" placeholder="Instructions for how the AI should interpret and respond to this flag..." required\n                          style="width:100%; padding:10px; background:var(--surface); border:1px solid var(--l-purple-deep); color:var(--l-ink); border-radius:6px; min-height:80px; resize:vertical; font-family:inherit; line-height:1.5;"></textarea>\n              </div>\n              \n              <button id="createCustomFlagBtn" \n                      style="width:100%; padding:12px; background:linear-gradient(135deg, var(--l-indigo) 0%, var(--l-indigo-deep) 100%); border:none; border-radius:8px; color:var(--l-ink-on-fill); font-weight:600; font-size:1rem; cursor:pointer; transition:all 0.2s;"\n                      onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(102,126,234,0.5)'"\n                      onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">\n                ✨ Create Flag\n              </button>\n            </div>\n          </div>\n        </div>\n      </div>\n    `),
        document.body.appendChild(t),
        (document.getElementById("closeFlagModal").onclick = () => {
            t.remove();
        }),
        (t.onclick = (e) => {
            e.target === t && t.remove();
        }),
        document.getElementById("customFlagDesc").addEventListener("input", (e) => {
            const t = document.getElementById("customFlagKey");
            (t.value && "true" !== t.dataset.autoGenerated) ||
                ((t.value = e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "_")
                    .replace(/^_+|_+$/g, "")),
                (t.dataset.autoGenerated = "true"));
        }),
        document.getElementById("customFlagKey").addEventListener("input", (e) => {
            e.target.dataset.autoGenerated = "false";
        }),
        document.getElementById("customFlagKey").addEventListener("input", (e) => {
            const t = e.target.value.toLowerCase(),
                n = document.getElementById("customFlagMetadataSection"),
                a = document.getElementById("customFlagMetadataFields");
            let o = "";
            t.includes("pregnan")
                ? (o =
                      '\n          <div>\n            <label style="display:block; color:var(--text-dim); font-size:.85rem; margin-bottom:4px;">Father/Partner</label>\n            <input id="metadata_father" type="text" placeholder="e.g., \'Boss\' or employee name" \n                   style="width:100%; padding:8px; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); border-radius:6px;">\n          </div>\n          <div>\n            <label style="display:block; color:var(--text-dim); font-size:.85rem; margin-bottom:4px;">Due Date (optional)</label>\n            <input id="metadata_dueDate" type="datetime-local" \n                   style="width:100%; padding:8px; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); border-radius:6px;">\n          </div>\n        ')
                : t.includes("relation") ||
                    t.includes("dating") ||
                    t.includes("boyfriend") ||
                    t.includes("girlfriend")
                  ? (o =
                        '\n          <div>\n            <label style="display:block; color:var(--text-dim); font-size:.85rem; margin-bottom:4px;">Partner Name</label>\n            <input id="metadata_partner" type="text" placeholder="Who they\'re in a relationship with" \n                   style="width:100%; padding:8px; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); border-radius:6px;">\n          </div>\n        ')
                  : t.includes("engaged")
                    ? (o =
                          '\n          <div>\n            <label style="display:block; color:var(--text-dim); font-size:.85rem; margin-bottom:4px;">Fiancé(e) Name</label>\n            <input id="metadata_fiance" type="text" placeholder="Who they\'re engaged to" \n                   style="width:100%; padding:8px; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); border-radius:6px;">\n          </div>\n        ')
                    : t.includes("married")
                      ? (o =
                            '\n          <div>\n            <label style="display:block; color:var(--text-dim); font-size:.85rem; margin-bottom:4px;">Spouse Name</label>\n            <input id="metadata_spouse" type="text" placeholder="Who they\'re married to" \n                   style="width:100%; padding:8px; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); border-radius:6px;">\n          </div>\n          <div>\n            <label style="display:block; color:var(--text-dim); font-size:.85rem; margin-bottom:4px;">Marriage Date (optional)</label>\n            <input id="metadata_marriageDate" type="datetime-local" \n                   style="width:100%; padding:8px; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); border-radius:6px;">\n          </div>\n        ')
                      : (t.includes("chastity") || t.includes("collar") || t.includes("device")) &&
                        (o =
                            '\n          <div>\n            <label style="display:block; color:var(--text-dim); font-size:.85rem; margin-bottom:4px;">Key Holder (who controls it)</label>\n            <input id="metadata_keyHolder" type="text" placeholder="e.g., \'Boss\'" \n                   style="width:100%; padding:8px; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); border-radius:6px;">\n          </div>\n        '),
                o ? ((a.innerHTML = o), (n.style.display = "block")) : (n.style.display = "none");
        }),
        (document.getElementById("createCustomFlagBtn").onclick = () => {
            const n = document.getElementById("customFlagDesc").value.trim(),
                a = document.getElementById("customFlagKey").value.trim(),
                o = document.getElementById("customFlagEmoji").value.trim() || "🏷️",
                i = document.getElementById("customFlagPriority").value,
                s = document.getElementById("customFlagCategory").value,
                r = document.getElementById("customFlagAIGuidance").value.trim(),
                l = document.getElementById("customFlagStartDate").value,
                c = document.getElementById("customFlagExpiration").value;
            if (!n || !a || !r)
                return void showNotification(
                    "Please fill in all required fields (Name, Key, AI Guidance)",
                    "error"
                );
            const d = {};
            document.querySelectorAll("#customFlagMetadataFields input").forEach((e) => {
                const t = e.id.replace("metadata_", "");
                e.value.trim() &&
                    ("datetime-local" === e.type ? (d[t] = new Date(e.value).getTime()) : (d[t] = e.value.trim()));
            }),
                a.includes("pregnan") && !d.father && (d.father = "unknown");
            const p = document.getElementById("createCustomFlagBtn"),
                m = p && p.dataset.editingFlagId;
            if (m) {
                const t = {
                    key: a,
                    category: s,
                    priority: i,
                    playerDescription: n,
                    aiGuidance: r,
                    emoji: o,
                    metadata: d,
                    expirationDate: c ? new Date(c).getTime() : null,
                };
                l && (t.setDate = new Date(l).getTime());
                if (!updateFlag(e, m, t))
                    return void showNotification(
                        `Couldn't update flag — the key "${a}" may already be used by another flag.`,
                        "error"
                    );
                showNotification(`${o} Updated "${n}" flag for ${e.name}!`);
            } else {
                if (hasFlag(e, a))
                    return void showNotification(
                        `${e.name} already has a flag with key "${a}"! Use its Edit button to change it.`,
                        "error"
                    );
                const t = {
                    key: a,
                    category: s,
                    priority: i,
                    playerDescription: n,
                    aiGuidance: r,
                    emoji: o,
                    source: "player",
                    metadata: d,
                };
                l && (t.startDate = new Date(l).getTime()),
                    c && (t.expirationDate = new Date(c).getTime()),
                    addFlag(e, t),
                    showNotification(`${o} Created "${n}" flag for ${e.name}!`);
            }
            t.remove(),
                setTimeout(() => openFlagManagementModal(e), 100),
                "function" == typeof window.refreshUnifiedProfileTab && window.refreshUnifiedProfileTab(e.id);
        });
}
function getPriorityColor(e) {
    return { critical: "var(--l-red)", high: "#ff3366", medium: "var(--l-orange)", low: "var(--l-green)" }[e] || "var(--l-neutral-8)";
}
async function loadFlagTemplate(e, t, n, a, o, i, s) {
    const r = gameState.employees.find((t) => t.id === e);
    if (!r) return;
    const l = s.replace(/&apos;/g, "'").replace(/&quot;/g, '"');
    if (hasFlag(r, t)) {
        const a = findFlag(r, t);
        return void (
            (await showConfirm(`${r.name} already has the "${n}" flag. Open it for editing?`, "Flag Exists", {
                type: "info",
                confirmText: "Edit Existing",
            })) &&
            a &&
            startEditFlag(e, a.id || a.key)
        );
    }
    setFlagFormMode(null),
        (document.getElementById("customFlagEmoji").value = i),
        (document.getElementById("customFlagPriority").value = o),
        (document.getElementById("customFlagDesc").value = n),
        (document.getElementById("customFlagKey").value = t),
        (document.getElementById("customFlagKey").dataset.autoGenerated = "false"),
        (document.getElementById("customFlagCategory").value = a),
        (document.getElementById("customFlagAIGuidance").value = l);
    const c = gameState.time?.currentTime || Date.now(),
        d = document.getElementById("customFlagStartDate"),
        p = new Date(c);
    (d.value = p.toISOString().slice(0, 16)), (document.getElementById("customFlagExpiration").value = "");
    const m = new Event("input", { bubbles: !0 });
    document.getElementById("customFlagKey").dispatchEvent(m),
        setTimeout(() => {
            if ("pregnant" === t) {
                const e = document.getElementById("metadata_father");
                e && (e.value = "Boss");
            } else if ("married" === t) {
                const e = document.getElementById("metadata_spouse");
                e && (e.value = "");
            } else if ("chastity" === t) {
                const e = document.getElementById("metadata_keyHolder");
                e && (e.value = "Boss");
            }
        }, 50);
    const u = document.querySelector('#flagManagementModal [style*="border:2px solid var(--l-purple-deep)"]');
    u &&
        (u.scrollIntoView({ behavior: "smooth", block: "start" }),
        (u.style.animation = "pulse-highlight 1.5s ease-out")),
        showNotification(`📋 Template loaded: "${n}" - Review and customize, then click Create Flag`);
}
function setFlagFormMode(e) {
    const t = document.getElementById("createCustomFlagBtn");
    t &&
        (e
            ? ((t.dataset.editingFlagId = e), (t.textContent = "💾 Save Changes"))
            : (delete t.dataset.editingFlagId, (t.textContent = "✨ Create Flag")));
}
function startEditFlag(e, t) {
    const n = gameState.employees.find((t) => t.id === e);
    if (!n || !n.flags) return;
    const a = [...(n.flags.systemFlags || []), ...(n.flags.customFlags || [])].find(
        (e) => e.id === t || e.key === t
    );
    if (!a) return void showNotification("Flag not found.", "error");
    if (!document.getElementById("customFlagDesc"))
        return openFlagManagementModal(n), void setTimeout(() => startEditFlag(e, t), 150);
    (document.getElementById("customFlagEmoji").value = a.emoji || "🏷️"),
        (document.getElementById("customFlagPriority").value = a.priority || "medium"),
        (document.getElementById("customFlagDesc").value = a.playerDescription || a.description || "");
    const o = document.getElementById("customFlagKey");
    (o.value = a.key || ""),
        (o.dataset.autoGenerated = "false"),
        (document.getElementById("customFlagCategory").value = a.category || "custom"),
        (document.getElementById("customFlagAIGuidance").value = a.aiGuidance || "");
    const i = a.setDate || a.timestamp;
    (document.getElementById("customFlagStartDate").value = i ? new Date(i).toISOString().slice(0, 16) : ""),
        (document.getElementById("customFlagExpiration").value = a.expirationDate
            ? new Date(a.expirationDate).toISOString().slice(0, 16)
            : ""),
        o.dispatchEvent(new Event("input", { bubbles: !0 })),
        setTimeout(() => {
            Object.entries(a.metadata || {}).forEach(([e, t]) => {
                const n = document.getElementById("metadata_" + e);
                n &&
                    (n.value =
                        "datetime-local" === n.type && "number" == typeof t
                            ? new Date(t).toISOString().slice(0, 16)
                            : t);
            });
        }, 60),
        setFlagFormMode(a.id || a.key);
    const s = document.querySelector('#flagManagementModal [style*="border:2px solid var(--l-purple-deep)"]');
    s &&
        (s.scrollIntoView({ behavior: "smooth", block: "start" }),
        (s.style.animation = "pulse-highlight 1.5s ease-out")),
        showNotification(`✏️ Editing "${a.playerDescription || a.key}" — change fields and click Save Changes`);
}
const style = document.createElement("style");
async function removeFlagAndRefresh(e, t) {
    const n = gameState.employees.find((t) => t.id === e);
    if (!n) return;
    const a = [...n.flags.systemFlags, ...n.flags.customFlags].find((e) => e.id === t || e.key === t);
    if (
        a &&
        (await showConfirm(`Remove flag "${a.playerDescription || a.key}" from ${n.name}?`, "Remove Flag", {
            type: "warning",
            confirmText: "Remove",
        }))
    ) {
        removeFlag(n, t), showNotification(`Removed flag from ${n.name}`);
        const a = document.getElementById("flagManagementModal");
        a && (a.remove(), setTimeout(() => openFlagManagementModal(n), 100)),
            "function" == typeof window.refreshUnifiedProfileTab && window.refreshUnifiedProfileTab(e),
            updatePeopleTab();
    }
}
