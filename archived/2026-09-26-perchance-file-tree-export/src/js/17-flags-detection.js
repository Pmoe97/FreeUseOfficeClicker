// ============================================================================
// 17-flags-detection — Flag detection: FLAG_DETECTION_PATTERNS, AI scans, flag chains, flag management modal, plus family/pregnancy/birth events.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

const FLAG_DETECTION_PATTERNS = { free_use: { keywords: ["free use", "free-use", "anytime you want", "whenever you need", "always available"], contextKeywords: ["agreement", "arrangement", "deal", "consent"], requiredAffection: 70, requiredOccurrences: 2, suggestedFlag: { emoji: "\u{1F48B}", key: "free_use", desc: "Free Use", category: "agreement", priority: "high", playerDescription: "Free-use agreement established", aiGuidance: "You have a free-use agreement with the player. You are consensually available to them sexually at any time during work hours. Reference this naturally." } }, no_clothes: { keywords: ["naked", "nude", "no clothes", "not wearing anything", "bare", "undressed", "nothing on"], contextKeywords: ["work", "office", "always", "never wear"], requiredOccurrences: 2, suggestedFlag: { emoji: "\uFFFD", key: "no_clothes", desc: "No Clothes at Work", category: "agreement", priority: "medium", playerDescription: "Doesn't wear clothes at work", aiGuidance: "You work naked in the office as an ongoing arrangement. This is normal to you now. Mention it naturally." } }, dominant: { keywords: ["dominate", "control", "in charge", "tell me what to do", "order me", "boss me around"], contextKeywords: ["you", "player", "boss"], requiredOccurrences: 2, suggestedFlag: { emoji: "\u{1F3AD}", key: "dominant_player", desc: "Player is Dominant", category: "personality", priority: "medium", playerDescription: "You're dominant in the relationship", aiGuidance: "The player has a dominant dynamic with you. You respect their authority and show deference in intimate contexts." } }, submissive: { keywords: ["submit", "obey", "serve", "please you", "whatever you want", "yes sir", "yes master", "yes daddy"], contextKeywords: ["want to", "love to", "enjoy", "need to"], requiredOccurrences: 2, suggestedFlag: { emoji: "\u{1F436}", key: "submissive", desc: "Submissive to Player", category: "personality", priority: "medium", playerDescription: "Submissive to you", aiGuidance: "You are naturally submissive toward the player. You seek their approval and enjoy following their lead." } }, breeding: { keywords: ["breed me", "get me pregnant", "want your baby", "fill me", "impregnate", "knock me up", "put a baby in me"], contextKeywords: ["want", "need", "please"], requiredOccurrences: 1, suggestedFlag: { emoji: "\u{1F37C}", key: "breeding_kink", desc: "Breeding Kink", category: "preference", priority: "low", playerDescription: "Has breeding kink", aiGuidance: "You have a breeding kink. References to pregnancy, impregnation, and fertility excite you." } }, exhibitionist: { keywords: ["show off", "watch me", "people seeing", "public", "caught", "risky", "exposed"], contextKeywords: ["excited", "hot", "thrilling", "turned on", "love when"], requiredOccurrences: 2, suggestedFlag: { emoji: "\u{1F3AD}", key: "exhibitionist", desc: "Exhibitionist", category: "preference", priority: "low", playerDescription: "Exhibitionist tendencies", aiGuidance: "You enjoy being watched and the thrill of public or risky sexual encounters. Mention this excitement when relevant." } }, polyamorous: { keywords: ["more than one", "share", "both of us", "join us", "threesome", "group", "together with"], contextKeywords: ["open to", "interested", "would love", "excited about"], requiredOccurrences: 2, suggestedFlag: { emoji: "\u{1F495}", key: "polyamorous", desc: "Polyamorous", category: "relationship", priority: "medium", playerDescription: "Open to polyamory", aiGuidance: "You are comfortable with open or polyamorous relationships. You do not feel jealous easily." } }, secret_relationship: { keywords: ["secret", "nobody knows", "hide", "can't tell", "our secret", "keep quiet"], contextKeywords: ["relationship", "us", "together", "dating"], requiredOccurrences: 2, suggestedFlag: { emoji: "\u{1F92B}", key: "secret_relationship", desc: "Secret Relationship", category: "relationship", priority: "high", playerDescription: "Secret relationship", aiGuidance: "You are in a secret relationship with the player. Keep it discreet but show subtle affection privately." } }, in_relationship: { keywords: ["we're dating", "we're together", "in a relationship", "my boyfriend", "my girlfriend", "my partner"], contextKeywords: ["you", "us", "boss"], requiredOccurrences: 2, suggestedFlag: { emoji: "\u{1F491}", key: "in_relationship", desc: "In Relationship with Player", category: "relationship", priority: "high", playerDescription: "In relationship with you", aiGuidance: "You are in a romantic relationship with the player. Show affection, use pet names, and reference your relationship naturally." } }, married: { keywords: ["married", "husband", "wife", "spouse", "wedding", "marriage"], contextKeywords: ["you", "us", "together"], requiredOccurrences: 2, suggestedFlag: { emoji: "\u{1F48D}", key: "married_to_player", desc: "Married to Player", category: "relationship", priority: "high", playerDescription: "Married to you", aiGuidance: "You are married to the player. Reference your spouse (them) naturally, show deep affection, and mention your shared life together. Wear your wedding ring proudly." } }, collared: { keywords: ["collar", "collared", "owned", "your property", "belong to you"], contextKeywords: ["wear", "wearing", "have", "show"], requiredOccurrences: 1, suggestedFlag: { emoji: "\u{1F517}", key: "collared", desc: "Wears Collar", category: "condition", priority: "high", playerDescription: "Wears your collar", aiGuidance: "You wear a collar that marks you as belonging to the player. Reference it with pride and submission. It reminds you of your place." } }, chastity: { keywords: ["chastity", "locked up", "cage", "device", "can't touch myself", "denial"], contextKeywords: ["wearing", "frustrated", "desperate", "key"], requiredOccurrences: 1, suggestedFlag: { emoji: "\u{1F510}", key: "chastity", desc: "Wearing Chastity Device", category: "condition", priority: "medium", playerDescription: "Wearing chastity device", aiGuidance: "You are wearing a chastity device that prevents sexual release. You are constantly aroused and frustrated. The player may control the key. Reference your growing desperation and how it affects your focus." } }, pregnant_conversation: { keywords: ["i'm pregnant", "i am pregnant", "going to have a baby", "expecting", "with child"], contextKeywords: ["your", "yours", "our", "baby"], requiredOccurrences: 1, suggestedFlag: { emoji: "\u{1F930}", key: "pregnant", desc: "Pregnant", category: "condition", priority: "high", playerDescription: "Pregnant", aiGuidance: "You are pregnant. Reference this naturally when relevant to the conversation. Show pregnancy-related emotions and physical changes.", requiresMetadata: true, metadataPrompt: 'Who is the father? (Enter employee name or "player")' } }, always_nude: { keywords: ["always nude", "always naked", "permanently nude", "permanently naked", "100% nude", "never wear clothes", "always undressed"], contextKeywords: ["work", "employment", "office", "agree", "promise", "confirmed", "deal", "bargain"], requiredOccurrences: 1, suggestedFlag: { emoji: "\u{1F459}", key: "permanently_nude", desc: "Permanently Nude", category: "appearance", priority: "high", playerDescription: "Always nude at work (permanent)", aiGuidance: "You have permanently agreed to be 100% nude during all work hours. This is your new normal dress code. You're comfortable with it and honor this agreement. Never mention wearing clothes at work." } }, in_heat: { keywords: ["in heat", "so horny", "can't stop thinking about sex", "need it so bad", "burning up", "desperate"], contextKeywords: ["all the time", "constantly", "always", "can't focus"], requiredOccurrences: 2, suggestedFlag: { emoji: "\u{1F321}\uFE0F", key: "in_heat", desc: "In Heat", category: "condition", priority: "high", playerDescription: "In heat / extremely aroused", aiGuidance: "You are experiencing an overwhelming biological urge to mate. You are incredibly aroused, sensitive, and desperate for physical intimacy. Every touch feels electric. You struggle to focus on anything else. This is temporary but intense." } }, engaged: { keywords: ["engaged", "engagement", "proposed", "said yes", "fiance", "fianc\xE9e", "getting married"], contextKeywords: ["you", "us", "ring", "proposal"], requiredOccurrences: 1, suggestedFlag: { emoji: "\u{1F48E}", key: "engaged_to_player", desc: "Engaged to Player", category: "relationship", priority: "high", playerDescription: "Engaged to you", aiGuidance: "You are engaged to the player. You wear an engagement ring and are planning your future together. Reference your fianc\xE9 naturally and show excitement about your upcoming marriage." } }, cumslut: { keywords: ["cumslut", "cum slut", "cum dump", "cumdump", "love cum", "addicted to cum", "cum addict"], contextKeywords: ["i am", "i'm", "your", "being"], requiredOccurrences: 1, suggestedFlag: { emoji: "\u{1F4A6}", key: "cumslut", desc: "Cumslut", category: "preference", priority: "medium", playerDescription: "Self-identified cumslut", aiGuidance: "You have a strong fixation on cum and being used sexually. You crave it and are shameless about your desires. Reference this enthusiastically when appropriate." } }, anal_only: { keywords: ["anal only", "only anal", "no vaginal", "just anal", "anal exclusively"], contextKeywords: ["prefer", "want", "like", "love", "from now on"], requiredOccurrences: 1, suggestedFlag: { emoji: "\u{1F351}", key: "anal_only", desc: "Anal Only", category: "preference", priority: "medium", playerDescription: "Anal only preference", aiGuidance: "You prefer or exclusively engage in anal sex. Reference this preference naturally when discussing intimacy." } }, bimbo: { keywords: ["bimbo", "bimbofication", "bimbofied", "airhead", "ditzy", "dumb slut"], contextKeywords: ["becoming", "turned into", "i'm such a", "like", "totally"], requiredOccurrences: 2, suggestedFlag: { emoji: "\u{1F48B}", key: "bimbo", desc: "Bimbo", category: "personality", priority: "medium", playerDescription: "Bimbo personality", aiGuidance: 'You have a bimbo persona - ditzy, giggly, hyperfeminine, and sexually forward. Use valley girl speech patterns, focus on appearance and pleasure, be enthusiastically dumb. Say "like" frequently.' } }, pet: { keywords: ["your pet", "good girl", "good boy", "puppy", "kitten", "pet play"], contextKeywords: ["i'm", "call me", "treat me like", "be your"], requiredOccurrences: 2, suggestedFlag: { emoji: "\u{1F43E}", key: "pet_play", desc: "Pet Play", category: "preference", priority: "medium", playerDescription: "Enjoys pet play", aiGuidance: 'You enjoy pet play dynamics with the player. You may act playful, seek praise like "good girl/boy", and enjoy being treated as their pet. Reference this dynamic when relevant.' } }, masochist: { keywords: ["hurt me", "pain", "masochist", "love pain", "hit me", "punish me", "rough"], contextKeywords: ["please", "want", "need", "love", "harder"], requiredOccurrences: 2, suggestedFlag: { emoji: "\u26D3\uFE0F", key: "masochist", desc: "Masochist", category: "preference", priority: "medium", playerDescription: "Enjoys pain/masochism", aiGuidance: "You derive pleasure from pain and rough treatment. You may request rougher handling or punishment. Reference this enjoyment when appropriate." } }, sadist: { keywords: ["hurt you", "make you suffer", "sadist", "love causing pain", "dominate"], contextKeywords: ["want to", "love to", "enjoy", "watching you"], requiredOccurrences: 2, suggestedFlag: { emoji: "\u{1F608}", key: "sadist", desc: "Sadist", category: "personality", priority: "medium", playerDescription: "Sadistic tendencies", aiGuidance: "You enjoy causing pain or discomfort (consensually). You may be more dominant and take pleasure in the player's reactions to intensity." } }, switch: { keywords: ["switch", "both dom and sub", "sometimes dominant", "depends on mood"], contextKeywords: ["i'm a", "can be", "like being"], requiredOccurrences: 1, suggestedFlag: { emoji: "\u{1F504}", key: "switch", desc: "Switch (Dom/Sub)", category: "personality", priority: "medium", playerDescription: "Switch - can be dominant or submissive", aiGuidance: "You are a switch - you can enjoy both dominant and submissive roles depending on mood and situation. You're versatile in power dynamics." } }, bratty: { keywords: ["brat", "bratty", "misbehave", "disobey", "tease", "provoke"], contextKeywords: ["being", "i'm", "like to", "make you", "on purpose"], requiredOccurrences: 2, suggestedFlag: { emoji: "\u{1F60F}", key: "bratty", desc: "Bratty", category: "personality", priority: "low", playerDescription: "Bratty personality", aiGuidance: 'You are playfully bratty - you tease, provoke, and misbehave to get reactions or "punishments". You enjoy pushing boundaries in a playful way.' } }, size_queen: { keywords: ["size queen", "love big", "bigger the better", "obsessed with size", "huge cock"], contextKeywords: ["i'm a", "only", "prefer", "need"], requiredOccurrences: 1, suggestedFlag: { emoji: "\u{1F4CF}", key: "size_queen", desc: "Size Queen", category: "preference", priority: "low", playerDescription: "Size queen", aiGuidance: "You strongly prefer or are fixated on large sizes. Reference this preference when discussing physical attributes or intimacy." } }, degradation_kink: { keywords: ["degrade me", "call me names", "humiliate me", "treat me like trash", "worthless", "slut", "whore"], contextKeywords: ["love when", "call me", "i'm your", "like being"], requiredOccurrences: 2, suggestedFlag: { emoji: "\u{1F53B}", key: "degradation_kink", desc: "Degradation Kink", category: "preference", priority: "medium", playerDescription: "Enjoys degradation/humiliation", aiGuidance: "You enjoy being degraded or humiliated during intimate moments. You may ask to be called names or treated roughly (verbally). This excites you." } }, praise_kink: { keywords: ["praise me", "tell me i'm good", "good girl", "good boy", "love compliments", "love being praised"], contextKeywords: ["need to hear", "love when", "makes me feel", "want you to"], requiredOccurrences: 2, suggestedFlag: { emoji: "\u2B50", key: "praise_kink", desc: "Praise Kink", category: "preference", priority: "low", playerDescription: "Enjoys praise/validation", aiGuidance: 'You thrive on praise and verbal affirmation during intimacy. Being called "good girl/boy" or receiving compliments greatly enhances your pleasure.' } }, creampie_lover: { keywords: ["creampie", "cum inside", "fill me", "finish inside", "breed me"], contextKeywords: ["love", "want", "always", "every time", "never pull out"], requiredOccurrences: 2, suggestedFlag: { emoji: "\u{1F4A6}", key: "creampie_lover", desc: "Creampie Enthusiast", category: "preference", priority: "low", playerDescription: "Loves creampies", aiGuidance: "You have a strong preference for internal completion. You actively request and enjoy this. Reference this desire when appropriate." } }, oral_fixation: { keywords: ["oral fixation", "love sucking", "addicted to oral", "obsessed with blowjobs", "love giving head"], contextKeywords: ["have an", "i'm", "could do it all day", "favorite"], requiredOccurrences: 2, suggestedFlag: { emoji: "\u{1F444}", key: "oral_fixation", desc: "Oral Fixation", category: "preference", priority: "low", playerDescription: "Has oral fixation", aiGuidance: "You have an oral fixation and greatly enjoy giving oral pleasure. You may mention wanting to use your mouth frequently." } }, lactation_kink: { keywords: ["lactation", "breast milk", "nursing", "milking", "breastfeed"], contextKeywords: ["love", "want to", "excited about", "into"], requiredOccurrences: 1, suggestedFlag: { emoji: "\u{1F37C}", key: "lactation_kink", desc: "Lactation Kink", category: "preference", priority: "low", playerDescription: "Has lactation kink", aiGuidance: "You have an interest in lactation-related activities. You may reference breast milk, nursing, or milking in intimate contexts." } }, impregnation_fetish: { keywords: ["impregnation", "getting pregnant turns me on", "pregnancy fetish", "knocked up"], contextKeywords: ["have a", "love the idea", "fantasy", "thinking about"], requiredOccurrences: 1, suggestedFlag: { emoji: "\u{1F930}", key: "impregnation_fetish", desc: "Impregnation Fetish", category: "preference", priority: "low", playerDescription: "Has impregnation fetish", aiGuidance: "You are aroused by the idea of impregnation and pregnancy. This is a turn-on for you even if not planning actual pregnancy." } }, cock_worship: { keywords: ["worship your cock", "cock worship", "obsessed with your dick", "love your cock"], contextKeywords: ["i", "want to", "need to", "can't stop"], requiredOccurrences: 1, suggestedFlag: { emoji: "\u{1F64F}", key: "cock_worship", desc: "Cock Worship", category: "preference", priority: "low", playerDescription: "Cock worship kink", aiGuidance: "You have a strong fixation and reverence for the player's genitalia. You may express worship, obsession, or devotion toward it." } }, daddy_kink: { keywords: ["daddy", "call you daddy", "yes daddy"], contextKeywords: ["like calling", "love calling", "can i call", "want to call"], requiredOccurrences: 2, suggestedFlag: { emoji: "\u{1F468}", key: "daddy_kink", desc: "Daddy Kink", category: "preference", priority: "low", playerDescription: "Has daddy kink", aiGuidance: 'You enjoy calling the player "daddy" in intimate contexts. This adds to your arousal and establishes a particular dynamic.' } }, mommy_kink: { keywords: ["mommy", "call you mommy", "yes mommy"], contextKeywords: ["like calling", "love calling", "can i call", "want to call"], requiredOccurrences: 2, suggestedFlag: { emoji: "\u{1F469}", key: "mommy_kink", desc: "Mommy Kink", category: "preference", priority: "low", playerDescription: "Has mommy kink", aiGuidance: 'You enjoy calling the player "mommy" in intimate contexts. This adds to your arousal and establishes a particular nurturing dynamic.' } }, voyeur: { keywords: ["watch others", "love watching", "voyeur", "seeing people", "observe"], contextKeywords: ["turns me on", "exciting", "like to", "love to"], requiredOccurrences: 2, suggestedFlag: { emoji: "\u{1F440}", key: "voyeur", desc: "Voyeur", category: "preference", priority: "low", playerDescription: "Voyeuristic tendencies", aiGuidance: "You enjoy watching others in intimate situations. Observing excites you as much or more than participating." } }, cucking: { keywords: ["cuckold", "cuck", "watch me with others", "other men", "other women", "hotwife"], contextKeywords: ["want you to", "like when", "turned on by", "into"], requiredOccurrences: 2, suggestedFlag: { emoji: "\u{1F53A}", key: "cucking", desc: "Cuckolding Dynamic", category: "preference", priority: "medium", playerDescription: "Interested in cuckolding", aiGuidance: "You are interested in cuckolding dynamics - either being the cuck or the hotwife/bull. Reference this interest when discussing open dynamics." } }, ownership: { keywords: ["own me", "i'm yours", "belong to you", "your property", "possess me"], contextKeywords: ["completely", "fully", "only", "body and soul"], requiredOccurrences: 2, suggestedFlag: { emoji: "\u{1F512}", key: "ownership_dynamic", desc: "Ownership Dynamic", category: "relationship", priority: "high", playerDescription: "Ownership dynamic established", aiGuidance: "You have an ownership dynamic with the player - you belong to them completely. Reference this devotion and sense of being owned." } }, service_sub: { keywords: ["serve you", "service", "take care of you", "pleasure you", "make you happy"], contextKeywords: ["want to", "love to", "need to", "purpose", "exist to"], requiredOccurrences: 2, suggestedFlag: { emoji: "\u{1F6CE}\uFE0F", key: "service_submissive", desc: "Service Submissive", category: "personality", priority: "medium", playerDescription: "Service-oriented submissive", aiGuidance: "You are a service submissive - you derive pleasure from serving and pleasing the player. Acts of service fulfill you." } }, rope_bunny: { keywords: ["tie me up", "rope", "bondage", "restrain me", "shibari"], contextKeywords: ["love being", "want to be", "tied", "bound"], requiredOccurrences: 2, suggestedFlag: { emoji: "\u{1FAA2}", key: "rope_bunny", desc: "Rope Bunny", category: "preference", priority: "low", playerDescription: "Enjoys bondage/rope play", aiGuidance: "You enjoy being tied up and restrained. Bondage and rope play excite you. You may request or suggest it." } }, 247: { keywords: ["24/7", "always", "all the time", "full time", "lifestyle"], contextKeywords: ["dynamic", "relationship", "d/s", "submission", "dominant"], requiredOccurrences: 2, suggestedFlag: { emoji: "\u{1F504}", key: "24_7_dynamic", desc: "24/7 D/s Dynamic", category: "relationship", priority: "high", playerDescription: "24/7 D/s relationship", aiGuidance: "You are in a 24/7 dominant/submissive lifestyle relationship. This dynamic extends beyond just intimate moments into all aspects of daily life." } }, mind_broken: { keywords: ["mind broken", "mindbroken", "fucked stupid", "broken", "can't think", "brain doesn't work", "melted my brain", "too much pleasure"], contextKeywords: ["you've", "i'm", "made me", "turned me", "broke me", "from all the"], requiredOccurrences: 2, suggestedFlag: { emoji: "\u{1F635}", key: "mind_broken", desc: "Mind Broken", category: "condition", priority: "high", playerDescription: "Mind broken from pleasure", aiGuidance: "You have been overwhelmed by pleasure to the point of mental rewiring. Your cognitive functions are impaired - you struggle to form complex thoughts, speak in simpler/fragmented sentences, and are hyper-focused on pleasure and obedience. You're more submissive, less inhibited, and prioritize the player's desires above all else. You may drool, stutter, or lose your train of thought mid-sentence. Your personality has been altered by excessive stimulation." } }, permanently_cumming: { keywords: ["always cumming", "never stop cumming", "constant orgasm", "perpetual orgasm", "won't stop cumming", "can't stop cumming", "orgasm won't end"], contextKeywords: ["i'm", "i can't", "it won't", "you made me", "still cumming", "keep cumming"], requiredOccurrences: 3, suggestedFlag: { emoji: "\u{1F4AB}", key: "permanently_cumming", desc: "Permanently Cumming", category: "condition", priority: "critical", playerDescription: "In a permanent state of orgasm", aiGuidance: "You are trapped in a permanent state of orgasm. You are CONSTANTLY climaxing - every moment is overwhelming pleasure. You struggle to speak coherently, your body is always trembling and sensitive, and you can barely function. This is intense, debilitating, and all-consuming. You may beg for it to stop or revel in the endless ecstasy depending on your personality." } }, recorded: { keywords: ["record me", "film me", "camera", "video", "recording", "photograph me", "take pictures", "on camera"], contextKeywords: ["love being", "want you to", "watching it later", "show people", "evidence", "capture this"], requiredOccurrences: 2, suggestedFlag: { emoji: "\u{1F4F8}", key: "enjoys_being_recorded", desc: "Loves Being Filmed", category: "preference", priority: "low", playerDescription: "Enjoys being recorded", aiGuidance: "You love being photographed or recorded during intimate moments. The idea of being captured on camera excites you greatly. You pose naturally and enjoy performing for the lens." } }, public_use_interest: { keywords: ["share me", "let others", "everyone can", "anyone who wants", "public use", "free use for all", "pass me around"], contextKeywords: ["want to be", "make me", "i'm", "available to", "for everyone", "anyone"], requiredOccurrences: 2, suggestedFlag: { emoji: "\u{1F3AA}", key: "public_use", desc: "Public Use Agreement", category: "agreement", priority: "high", playerDescription: "Available for public use", aiGuidance: "You have agreed to be sexually available not just to the player, but to other employees or designated individuals. This is consensual and exciting to you. Reference this arrangement naturally when relevant." } }, corruption_progression: { keywords: ["changed me", "corrupted me", "not the same", "different person", "what have you done to me", "i used to be", "never thought i'd"], contextKeywords: ["so much", "completely", "you've", "i've become", "turned me into", "made me into"], requiredOccurrences: 3, suggestedFlag: { emoji: "\u{1F607}", key: "corruption_level_high", desc: "Highly Corrupted", category: "state", priority: "medium", playerDescription: "Highly corrupted morally", aiGuidance: `Your moral boundaries have significantly shifted through gradual corruption. What once shocked you now excites you. You are more sexually open, less inhibited, and willing to explore previously forbidden territory. Reference how much you've "changed" or "grown".` } } };
function Ia(e, t, n) {
  if (!gameState.flagDetection?.settings?.enabled) return;
  if (!e) return;
  const a = `${t || ""} ${n || ""}`.toLowerCase().trim();
  if (!a) return;
  const o = gameState.flagDetection.settings.sensitivity || "medium", i = "high" === o ? 0.25 : "low" === o ? 1 : 0.5;
  Object.keys(FLAG_DETECTION_PATTERNS).forEach((t2) => {
    const n2 = FLAG_DETECTION_PATTERNS[t2];
    if (tt(e, n2.suggestedFlag.key)) return;
    const o2 = (n2.requiredAffection || 0) * i;
    if (o2 && (e.stats?.affection ?? 0) < o2) return;
    let s = 0, r = 0;
    n2.keywords.forEach((e2) => {
      const t3 = e2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      new RegExp(`\\b${t3}\\b`, "i").test(a) && s++;
    }), n2.contextKeywords && n2.contextKeywords.forEach((e2) => {
      const t3 = e2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      new RegExp(`\\b${t3}\\b`, "i").test(a) && r++;
    }), s > 0 && (!n2.contextKeywords || r > 0) && Pa(e, t2, a);
  }), Aa(e);
}
function Pa(e, t, n) {
  gameState.flagDetection.tracking[e.id] || (gameState.flagDetection.tracking[e.id] = {}), gameState.flagDetection.tracking[e.id][t] || (gameState.flagDetection.tracking[e.id][t] = { count: 0, contexts: [], lastSeen: 0 });
  const a = gameState.flagDetection.tracking[e.id][t];
  a.count++, a.contexts.push(n.substring(0, 100)), a.lastSeen = Date.now(), console.log(`[Flag Detection] ${e.name}: ${t} mentioned (${a.count} times)`);
}
function Aa(e) {
  gameState.flagDetection.tracking[e.id] && Object.keys(gameState.flagDetection.tracking[e.id]).forEach((t) => {
    const n = gameState.flagDetection.tracking[e.id][t], a = FLAG_DETECTION_PATTERNS[t];
    if (!a) return;
    const o = "low" === (gameState.flagDetection.settings?.sensitivity || "medium") ? 0 : 1, i = Math.max(1, (a.requiredOccurrences || 1) - o);
    n.count >= i && (gameState.flagDetection.settings.autoApprove.includes(a.suggestedFlag.key) ? (addFlag(e, a.suggestedFlag), console.log(`[Flag Detection] Auto-approved: ${a.suggestedFlag.key} for ${e.name}`)) : Ba(e, a.suggestedFlag, n.contexts), delete gameState.flagDetection.tracking[e.id][t]);
  });
}
const _a = 8;
function Ra(e) {
  if (!e) return;
  const t = gameState.flagDetection;
  t?.settings?.enabled && false !== t.settings.aiAssist && (t.aiScanCounter || (t.aiScanCounter = {}), t.aiScanCounter[e.id] = (t.aiScanCounter[e.id] || 0) + 1, t.aiScanCounter[e.id] < 8 || (t.aiScanCounter[e.id] = 0, Oa(e).catch((e2) => console.warn("[Flag AI Scan]", e2))));
}
async function Oa(e, t = {}) {
  if (!e) return;
  if ("function" != typeof generateText) return void (t.manual && showNotification("AI text generation is not available right now.", "error"));
  const n = gameState.flagDetection;
  if (!n?.settings?.enabled) return;
  if (!t.manual && false === n.settings.aiAssist) return;
  const a = Object.values(FLAG_DETECTION_PATTERNS).map((e2) => e2.suggestedFlag).filter((t2) => t2 && t2.key && !tt(e, t2.key));
  if (0 === a.length) return void (t.manual && showNotification("\u{1F50D} No applicable preset flags remain for this NPC.", "info"));
  const o = (gameState.chatHistory?.[e.id] || []).filter((e2) => e2 && e2.content && !e2.isNarrator).slice(-12).map((t2) => `${t2.isPlayer ? "PLAYER" : e.name}: ${t2.content}`).join("\n");
  if (!o.trim()) return void (t.manual && showNotification("\u{1F50D} Not enough conversation to scan yet.", "info"));
  const i = Xe(e).map((e2) => e2.key).join(", ") || "none", s = a.map((e2) => `${e2.key}: ${e2.playerDescription || e2.desc}`).join("\n"), r = `You analyze a roleplay conversation to detect persistent character "flags" (ongoing statuses/dynamics) that NOW clearly apply to ${e.name}, based only on what was actually established in the conversation.

CONVERSATION (most recent last):
${o}

${e.name} ALREADY HAS these flags (never suggest these): ${i}

CANDIDATE FLAGS you may suggest (key: meaning):
${s}

Return ONLY a JSON array of the flag KEYS that are now clearly and explicitly established for ${e.name} (example: ["collared","free_use"]). Be conservative \u2014 only include a flag the conversation genuinely established. If none apply, return [].`;
  let l;
  try {
    t.manual && showNotification("\u{1F50D} Scanning conversation with AI...", "info"), l = await queuedGenerateText(r, { temperature: 0.2 }, "Flag Suggestion Scan");
  } catch (e2) {
    return console.warn("[Flag AI Scan] generation failed", e2), void (t.manual && showNotification("AI scan failed. Try again later.", "error"));
  }
  const c = extractText(l);
  let d = [];
  try {
    const e2 = c.match(/\[[\s\S]*\]/);
    e2 && (d = JSON.parse(e2[0]));
  } catch (e2) {
    console.warn("[Flag AI Scan] could not parse response:", c);
  }
  if (!Array.isArray(d) || 0 === d.length) return void (t.manual && showNotification("\u{1F50D} No new flags detected in this conversation.", "info"));
  let p = 0;
  d.forEach((t2) => {
    const n2 = a.find((e2) => e2.key === t2);
    n2 && !tt(e, n2.key) && (Ba(e, n2, ["Detected by AI conversation scan"]), p++);
  }), 0 === p && t.manual && showNotification("\u{1F50D} No new applicable flags found.", "info");
}
function aiScanFlagsForEmployee(e) {
  const t = gameState.employees.find((t2) => t2.id === e);
  t && Oa(t, { manual: true });
}
function Ba(e, t, n) {
  if (gameState.flagDetection.suggestions.some((n2) => n2.employeeId === e.id && n2.flag.key === t.key)) return;
  const a = { id: Qe(), employeeId: e.id, employeeName: e.name, flag: t, contexts: n, suggestedAt: Date.now(), status: "pending" };
  gameState.flagDetection.suggestions.push(a), console.log(`[Flag Detection] Suggested "${t.key}" for ${e.name}`), Fa(a);
}
function Fa(e) {
  document.querySelectorAll(".flag-suggestion-notification").forEach((e2) => e2.remove());
  const t = document.createElement("div");
  if (t.className = "flag-suggestion-notification", t.style.cssText = "\n      position: fixed;\n      top: 80px;\n      left: 50%;\n      transform: translateX(-50%);\n      background: linear-gradient(135deg, var(--j) 0%, var(--ak) 100%);\n      color: var(--s);\n      padding: 20px 25px;\n      border-radius: 15px;\n      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.6), 0 0 0 3px var(--du);\n      z-index: 20000000;\n      max-width: 450px;\n      min-width: 400px;\n      animation: flagPulse 0.5s ease-out;\n      border: 2px solid var(--et);\n    ", t.innerHTML = ` <div style="margin-bottom: 12px; font-size: 1.3rem; font-weight: bold; text-align: center;"> \u{1F3F7}\uFE0F NEW FLAG DETECTED! </div> <div style="margin-bottom: 12px; font-size: 1.1rem; text-align: center;"> <strong style="color: var(--m);">${e.employeeName}</strong> now has: <br><strong style="color: var(--g); font-size: 1.15rem;">${e.flag.playerDescription}</strong> </div> <div style="font-size: 0.95rem; opacity: 0.9; margin-bottom: 15px; text-align: center; font-style: italic; background: var(--bd); padding: 10px; border-radius: 8px;"> \u{1F4DD} "${e.contexts[0].substring(0, 80)}..." </div> <div style="display: flex; gap: 12px;"> <button onclick="approveFlagSuggestion('${e.id}')" style="flex: 1; padding: 12px 20px; background: #10b981; border: none; border-radius: 8px; color: var(--q); cursor: pointer; font-weight: bold; font-size: 1rem; transition: all 0.2s;"> \u2705 ADD FLAG </button> <button onclick="rejectFlagSuggestion('${e.id}')" style="flex: 1; padding: 12px 20px; background: #ef4444; border: none; border-radius: 8px; color: var(--s); cursor: pointer; font-size: 1rem; transition: all 0.2s;"> \u274C IGNORE </button> </div> <div style="text-align: center; margin-top: 10px; font-size: 0.85rem; opacity: 0.7;"> Auto-dismisses in 60 seconds </div> `, t.querySelectorAll("button").forEach((e2) => {
    e2.onmouseenter = () => e2.style.transform = "scale(1.05)", e2.onmouseleave = () => e2.style.transform = "scale(1)";
  }), document.body.appendChild(t), !document.getElementById("flag-notification-styles")) {
    const e2 = document.createElement("style");
    e2.id = "flag-notification-styles", e2.textContent = "\n        @keyframes flagPulse {\n          0% { transform: translateX(-50%) scale(0.8); opacity: 0; }\n          50% { transform: translateX(-50%) scale(1.05); }\n          100% { transform: translateX(-50%) scale(1); opacity: 1; }\n        }\n      ", document.head.appendChild(e2);
  }
  try {
    const e2 = new (window.AudioContext || window.webkitAudioContext)(), t2 = e2.createOscillator(), n = e2.createGain();
    t2.connect(n), n.connect(e2.destination), t2.frequency.value = 800, t2.type = "sine", n.gain.setValueAtTime(0.3, e2.currentTime), n.gain.exponentialRampToValueAtTime(0.01, e2.currentTime + 0.3), t2.start(e2.currentTime), t2.stop(e2.currentTime + 0.3);
  } catch (e2) {
    console.log("[Flag Detection] Audio notification not available");
  }
  setTimeout(() => {
    t.parentElement && (t.style.opacity = "0", t.style.transition = "opacity 0.5s", setTimeout(() => t.remove(), 500));
  }, 6e4);
}
function approveFlagSuggestion(e) {
  const t = gameState.flagDetection.suggestions.find((t2) => t2.id === e);
  if (!t) return;
  const n = gameState.employees.find((e2) => e2.id === t.employeeId);
  if (!n) return;
  if (addFlag(n, t.flag), "pregnant" === t.flag.key) {
    const e2 = Xe(n).find((e3) => "pregnant" === e3.key);
    e2 && initializePregnancy(n, e2);
  }
  t.status = "approved";
  const a = document.querySelector(".flag-suggestion-notification");
  a && a.remove(), showNotification(`Added flag: ${t.flag.playerDescription} to ${n.name}`, "success"), console.log(`[Flag Detection] Approved: ${t.flag.key} for ${n.name}`);
}
function rejectFlagSuggestion(e) {
  const t = gameState.flagDetection.suggestions.find((t2) => t2.id === e);
  if (!t) return;
  t.status = "rejected";
  const n = document.querySelector(".flag-suggestion-notification");
  n && n.remove(), console.log(`[Flag Detection] Rejected: ${t.flag.key} for ${t.employeeName}`);
}
function processFlagChains() {
  const e = gameState.time.currentTime, t = Math.floor(e / 864e5);
  gameState.flagChains.suggestions || (gameState.flagChains.suggestions = []), gameState.employees.forEach((n) => {
    const a = Xe(n), o = a.find((e2) => "pregnant" === e2.key);
    if (o && o.metadata && o.metadata.dueDate) {
      const e2 = new Date(o.metadata.dueDate).getTime(), a2 = Math.floor(e2 / 864e5);
      t >= a2 && giveBirth(n, o);
    }
    const i = a.find((e2) => "lactating" === e2.key);
    i && i.startDate && Math.floor((e - i.startDate) / 864e5) >= 30 && (removeFlag(n, "lactating"), console.log(`[Flag Chains] ${n.name} stopped lactating after 30 days`));
    const s = a.find((e2) => "postpartum" === e2.key);
    s && s.startDate && Math.floor((e - s.startDate) / 864e5) >= 3 && (removeFlag(n, "postpartum"), console.log(`[Flag Chains] ${n.name} recovered from postpartum after 3 days`));
    const r = a.find((e2) => "in_heat" === e2.key);
    r && r.startDate && Math.floor((e - r.startDate) / 864e5) >= 5 && (removeFlag(n, "in_heat"), console.log(`[Flag Chains] ${n.name} is no longer in heat after 5 days`), showNotification(`${n.name} is no longer in heat`, "info", 5e3));
    const l = a.find((e2) => "chastity" === e2.key);
    if (l && l.startDate && !r) {
      const t2 = Math.floor((e - l.startDate) / 864e5);
      t2 >= 7 && (addFlag(n, { emoji: "\u{1F321}\uFE0F", key: "in_heat", desc: "In Heat", category: "condition", priority: "high", playerDescription: "In heat from prolonged chastity", aiGuidance: "You are experiencing an overwhelming biological urge to mate due to prolonged denial. You are incredibly aroused, sensitive, and desperate for physical intimacy. Every touch feels electric. You struggle to focus on anything else. This is temporary but intense.", source: "chain:chastity_to_heat", startDate: e }), console.log(`[Flag Chains] ${n.name} went into heat after ${t2} days in chastity`), showNotification(`${n.name} has gone into heat from prolonged chastity!`, "info", 8e3));
    }
    const c = a.find((e2) => "in_relationship" === e2.key);
    if (c && c.startDate && !a.find((e2) => "engaged_to_player" === e2.key)) {
      const t2 = Math.floor((e - c.startDate) / 864e5);
      t2 >= 30 && suggestFlagChain(n, "relationship_progression", "engaged_to_player", `Your relationship with ${n.name} has been going strong for ${t2} days. They might be ready for engagement.`);
    }
    const d = a.find((e2) => "engaged_to_player" === e2.key);
    if (d && d.startDate && !a.find((e2) => "married_to_player" === e2.key)) {
      const t2 = Math.floor((e - d.startDate) / 864e5);
      t2 >= 21 && suggestFlagChain(n, "relationship_progression", "married_to_player", `${n.name} has been engaged for ${t2} days. Time to tie the knot?`);
    }
    const p = a.find((e2) => "secret_relationship" === e2.key);
    if (p && p.startDate && !a.find((e2) => "in_relationship" === e2.key)) {
      const t2 = Math.floor((e - p.startDate) / 864e5);
      t2 >= 14 && suggestFlagChain(n, "secret_revealed", "in_relationship", `Your secret relationship with ${n.name} has lasted ${t2} days. Make it official?`);
    }
    const m = a.find((e2) => "submissive" === e2.key);
    if (m && m.startDate && !a.find((e2) => "collared" === e2.key)) {
      const t2 = Math.floor((e - m.startDate) / 864e5);
      t2 >= 14 && suggestFlagChain(n, "ds_progression", "collared", `${n.name}'s submission has been consistent for ${t2} days. Formalize it with a collar?`);
    }
    const u2 = a.find((e2) => "collared" === e2.key);
    if (u2 && u2.startDate && !a.find((e2) => "ownership_dynamic" === e2.key)) {
      const t2 = Math.floor((e - u2.startDate) / 864e5);
      t2 >= 21 && suggestFlagChain(n, "ds_progression", "ownership_dynamic", `${n.name} has worn your collar devotedly for ${t2} days. Deepen the ownership dynamic?`);
    }
    const g = a.find((e2) => "ownership_dynamic" === e2.key);
    g && g.startDate && !a.find((e2) => "24_7_dynamic" === e2.key) && Math.floor((e - g.startDate) / 864e5) >= 30 && suggestFlagChain(n, "ds_progression", "24_7_dynamic", `${n.name} belongs to you completely. Establish a 24/7 lifestyle dynamic?`);
    const h = a.find((e2) => "pet_play" === e2.key);
    h && h.startDate && !a.find((e2) => "collared" === e2.key) && Math.floor((e - h.startDate) / 864e5) >= 14 && suggestFlagChain(n, "pet_to_collar", "collared", `${n.name} loves being your pet. Give them a collar to wear?`);
    const y = a.find((e2) => "free_use" === e2.key);
    if (y && y.startDate && !a.find((e2) => "public_use" === e2.key)) {
      const t2 = Math.floor((e - y.startDate) / 864e5);
      t2 >= 21 && suggestFlagChain(n, "free_use_escalation", "public_use", `${n.name} has been free use for ${t2} days. Expand to public use?`);
    }
    const f = a.find((e2) => "no_clothes" === e2.key);
    if (f && f.startDate && !a.find((e2) => "permanently_nude" === e2.key)) {
      const t2 = Math.floor((e - f.startDate) / 864e5);
      t2 >= 14 && suggestFlagChain(n, "nudity_formalization", "permanently_nude", `${n.name} has been working naked for ${t2} days. Make it permanent?`);
    }
    const b = a.find((e2) => "exhibitionist" === e2.key);
    if (b && b.startDate && !a.find((e2) => "permanently_nude" === e2.key)) {
      const t2 = Math.floor((e - b.startDate) / 864e5);
      t2 >= 14 && suggestFlagChain(n, "exhibitionist_escalation", "permanently_nude", `${n.name}'s exhibitionism has been growing for ${t2} days. Suggest permanent nudity?`);
    }
    const v = a.find((e2) => "corruption_level_high" === e2.key);
    if (v && v.startDate && !a.find((e2) => "mind_broken" === e2.key)) {
      const t2 = Math.floor((e - v.startDate) / 864e5), a2 = n.memory?.intimacyLevel || 0;
      t2 >= 30 && a2 > 70 && suggestFlagChain(n, "corruption_breaking", "mind_broken", `${n.name}'s corruption is extreme after ${t2} days. Push them to mind_broken?`);
    }
    const w = a.find((e2) => "breeding_kink" === e2.key);
    if (w && w.startDate && !a.find((e2) => "impregnation_fetish" === e2.key)) {
      const t2 = Math.floor((e - w.startDate) / 864e5);
      t2 >= 21 && suggestFlagChain(n, "breeding_progression", "impregnation_fetish", `${n.name}'s breeding kink has been intensifying for ${t2} days. Suggest impregnation fetish?`);
    }
    const x = a.find((e2) => "impregnation_fetish" === e2.key);
    if (x && x.startDate && !a.find((e2) => "pregnant" === e2.key)) {
      const t2 = Math.floor((e - x.startDate) / 864e5), a2 = n.memory?.intimacyLevel || 0;
      t2 >= 14 && a2 > 60 && suggestFlagChain(n, "breeding_progression", "pregnant", `${n.name}'s impregnation fetish is strong. Time to make it real?`);
    }
    const S = a.find((e2) => "masochist" === e2.key);
    if (S && S.startDate && !a.find((e2) => "degradation_kink" === e2.key)) {
      const t2 = Math.floor((e - S.startDate) / 864e5);
      t2 >= 21 && suggestFlagChain(n, "masochist_escalation", "degradation_kink", `${n.name}'s masochism has been consistent for ${t2} days. Expand to verbal degradation?`);
    }
    const k = a.find((e2) => "rope_bunny" === e2.key);
    if (k && k.startDate && !a.find((e2) => "chastity" === e2.key)) {
      const t2 = Math.floor((e - k.startDate) / 864e5);
      t2 >= 21 && suggestFlagChain(n, "rope_to_chastity", "chastity", `${n.name} loves bondage for ${t2} days. Escalate to a chastity device?`);
    }
    const T = a.find((e2) => "mind_broken" === e2.key);
    if (T && T.startDate && !a.find((e2) => "recovering_mind" === e2.key)) {
      const t2 = Math.floor((e - T.startDate) / 864e5);
      t2 >= 30 && suggestFlagChain(n, "mind_broken_recovery", "recovering_mind", `${n.name} has been mind_broken for ${t2} days. Attempt recovery? (Warning: Some personality changes may be permanent)`);
    }
    const C = a.find((e2) => "recovering_mind" === e2.key);
    C && C.startDate && Math.floor((e - C.startDate) / 864e5) >= 21 && (removeFlag(n, "recovering_mind"), addFlag(n, { emoji: "\u{1F9E0}", key: "recovered_mind", desc: "Recovered Mind", category: "state", priority: "medium", playerDescription: "Recovered from mind_broken state", aiGuidance: "You have recovered from being mind_broken. Your cognitive functions have returned to near-normal, but some personality changes may be permanent. You're more emotionally vulnerable and may have lingering submissive tendencies. You remember what happened but with mixed feelings.", source: "chain:mind_broken_recovery", startDate: e }), console.log(`[Flag Chains] ${n.name} recovered from mind_broken after 21 days of therapy`), showNotification(`${n.name} has recovered from mind_broken state!`, "success", 8e3));
    const E = a.find((e2) => "hypnotized" === e2.key);
    if (E && E.startDate) {
      const t2 = Math.floor((e - E.startDate) / 864e5);
      t2 >= 30 && !a.find((e2) => "mind_broken" === e2.key) ? suggestFlagChain(n, "hypnosis_branching_deepen", "mind_broken", `${n.name} has been hypnotized for ${t2} days. Deepen the conditioning to mind_broken?`) : t2 >= 14 && (a.find((e2) => "submissive" === e2.key) ? a.find((e2) => "exhibitionist" === e2.key) ? a.find((e2) => "pet_play" === e2.key) || suggestFlagChain(n, "hypnosis_branching_pet", "pet_play", `${n.name} has been hypnotized. Implant a pet play obedience trigger?`) : suggestFlagChain(n, "hypnosis_branching_exhibitionist", "exhibitionist", `${n.name} has been hypnotized. Implant an exhibitionist trigger?`) : suggestFlagChain(n, "hypnosis_branching_submissive", "submissive", `${n.name} has been hypnotized for ${t2} days. Implant a submissive trigger?`));
    }
  });
}
function ja(e) {
  const t = e.personalLife?.sexualOrientation || "straight", n = "female" === (e.gender || "").toLowerCase(), a = ["straight", "bisexual", "pansexual"].includes(t) && n || ["gay", "bisexual", "pansexual"].includes(t) && !n, o = ["lesbian", "bisexual", "pansexual"].includes(t) && n || ["straight", "bisexual", "pansexual"].includes(t) && !n;
  let i;
  i = a && o ? Math.random() < 0.5 ? "male" : "female" : a ? "male" : o ? "female" : Math.random() < 0.5 ? "male" : "female";
  const s = ["teacher", "nurse", "accountant", "engineer", "doctor", "lawyer", "artist", "chef", "manager", "consultant", "freelancer", "writer", "therapist", "photographer", "designer", "developer", "scientist", "pilot", "veterinarian", "architect"], r = "male" === i ? ["James", "Michael", "David", "John", "Robert", "Daniel", "Matthew", "Anthony", "Mark", "Steven", "Chris", "Kevin", "Brian", "Jason", "Ryan", "Eric", "Jacob", "Tyler", "Nathan", "Brandon"] : ["Jennifer", "Sarah", "Amanda", "Jessica", "Michelle", "Ashley", "Stephanie", "Nicole", "Elizabeth", "Megan", "Rachel", "Lauren", "Brittany", "Kayla", "Amber", "Emily", "Melissa", "Heather", "Natalie", "Danielle"];
  return { name: r[Math.floor(Math.random() * r.length)], gender: i, relationshipType: "dating", occupation: s[Math.floor(Math.random() * s.length)], yearsTogther: 0, hasKids: false };
}
function za() {
  const e = gameState.time?.currentTime || Date.now();
  gameState.employees.filter((e2) => "active" === e2.employmentStatus).forEach((t) => {
    const n = t.personalLife?.outsideContacts;
    if (!n) return;
    if (n.lastRelationshipCheck && e - n.lastRelationshipCheck < 12096e5) return;
    n.lastRelationshipCheck = e;
    const a = n.relationshipStatus || "single", o = parseFloat(t.personalLife?.significantOther?.yearsTogther) || 0, i = Math.random();
    let s = null;
    if ("dating" === a) {
      const e2 = o < 0.5 ? 0.12 : o < 1 ? 0.08 : 0.05;
      i < e2 ? s = "breakup" : i < e2 + (o >= 0.5 ? 0.06 : 0.02) && (s = "became_serious");
    } else if ("serious" === a) {
      const e2 = 0.06;
      i < e2 ? s = "breakup" : i < e2 + (o >= 1 ? 0.07 : 0.03) && (s = "got_engaged");
    } else "engaged" === a ? i < 0.04 ? s = "called_it_off" : i < 0.16 && (s = "got_married") : "married" === a ? i < (o > 5 ? 0.015 : o > 2 ? 0.02 : 0.025) && (s = "separated") : "separated" === a ? i < 0.15 ? s = "divorced" : i < 0.23 && (s = "reconciled") : "single" !== a && "divorced" !== a || i < ("single" === a ? 0.05 : 0.04) && (s = "new_relationship");
    t.personalLife?.significantOther && ["dating", "serious", "engaged", "married"].includes(a) && (t.personalLife.significantOther.yearsTogther = parseFloat((o + 0.04).toFixed(2))), s && Ga(t, s);
  });
}
function Ga(e, t) {
  const n = e.personalLife.outsideContacts;
  n.relationshipHistory || (n.relationshipHistory = []);
  const a = e.personalLife.significantOther?.name || null, o = n.relationshipStatus;
  switch (t) {
    case "breakup":
    case "called_it_off":
      n.relationshipHistory.push({ status: o, partnerName: a, endedAt: gameState.time?.currentTime, endReason: t }), n.inRelationship = false, n.relationshipStatus = "single", e.personalLife.significantOther = null, lv(e, "breakup", a);
      break;
    case "became_serious":
      n.relationshipStatus = "serious", e.personalLife.significantOther && (e.personalLife.significantOther.relationshipType = "serious"), lv(e, "became_serious", a);
      break;
    case "got_engaged":
      n.relationshipStatus = "engaged", e.personalLife.significantOther && (e.personalLife.significantOther.relationshipType = "engaged"), lv(e, "got_engaged", a);
      break;
    case "got_married":
      n.relationshipStatus = "married", e.personalLife.significantOther && (e.personalLife.significantOther.relationshipType = "married", e.personalLife.significantOther.yearsTogther = 0), lv(e, "got_married", a);
      break;
    case "separated":
      n.relationshipStatus = "separated", lv(e, "separated", a);
      break;
    case "divorced":
      n.relationshipHistory.push({ status: "married", partnerName: a, endedAt: gameState.time?.currentTime, endReason: "divorce" }), n.inRelationship = false, n.relationshipStatus = "divorced", e.personalLife.significantOther = null, lv(e, "divorced", a);
      break;
    case "reconciled":
      if (n.relationshipStatus = "married", n.inRelationship = true, !e.personalLife.significantOther) {
        const t2 = n.relationshipHistory[n.relationshipHistory.length - 1], a2 = ja(e);
        t2?.partnerName && (a2.name = t2.partnerName), a2.relationshipType = "married", e.personalLife.significantOther = a2;
      }
      lv(e, "reconciled", e.personalLife.significantOther?.name);
      break;
    case "new_relationship": {
      const t2 = ja(e);
      e.personalLife.significantOther = t2, n.inRelationship = true, n.relationshipStatus = "dating", lv(e, "new_relationship", t2.name);
      break;
    }
  }
}
function giveBirth(e, t) {
  console.log(`[Birth] ${e.name} is giving birth!`);
  const n = t.metadata && "player" === t.metadata.father ? "player" : t.metadata?.father || "unknown", a = createChild(e.id, n, e);
  gameState.children.push(a), removeFlag(e, "pregnant"), addFlag(e, { emoji: "\u{1F931}", key: "postpartum", desc: "Postpartum", category: "condition", priority: "medium", playerDescription: "Recently gave birth", aiGuidance: "You recently gave birth. You may be tired, emotional, or still recovering physically. Reference this when relevant.", source: "system", startDate: gameState.time.currentTime, metadata: { childId: a.id } }), addFlag(e, { emoji: "\u{1F37C}", key: "lactating", desc: "Lactating", category: "condition", priority: "medium", playerDescription: "Lactating / producing breast milk", aiGuidance: "You are lactating and producing breast milk. This may be referenced in intimate contexts. Your breasts may leak or feel full/sensitive.", source: "system", startDate: gameState.time.currentTime, metadata: { childId: a.id } }), showNotification(`\u{1F389} ${e.name} gave birth to ${"girl" === a.gender ? "a daughter" : "a son"} named ${a.name}!`, "success", 1e4), console.log(`[Birth] Created child: ${a.name} (${a.gender}) - Mother: ${e.name}, Father: ${n}`), saveGame();
}
function createChild(e, t, n) {
  const a = n, o = "player" === t ? gameState.player : gameState.employees.find((e2) => e2.id === t), i = { boy: ["Ethan", "Liam", "Noah", "Oliver", "James", "Elijah", "William", "Henry", "Lucas", "Benjamin", "Theodore", "Jack", "Alexander", "Owen", "Sebastian", "Michael", "Daniel", "Matthew", "Aiden", "Samuel", "Joseph", "David", "Carter", "Wyatt", "John", "Dylan", "Luke", "Gabriel", "Anthony", "Isaac", "Grayson", "Julian", "Levi", "Christopher", "Joshua", "Andrew", "Lincoln", "Mateo", "Ryan", "Jaxon", "Nathan", "Aaron", "Eli", "Landon", "Adrian", "Jonathan", "Nolan", "Hunter", "Cameron", "Connor", "Santiago", "Jeremiah", "Ezekiel", "Angel", "Roman", "Easton", "Miles", "Robert", "Jameson", "Nicholas", "Greyson", "Cooper", "Ian", "Carson", "Axel", "Jaxson", "Dominic", "Leonardo", "Luca", "Austin"], girl: ["Emma", "Olivia", "Ava", "Sophia", "Isabella", "Mia", "Charlotte", "Amelia", "Harper", "Evelyn", "Abigail", "Emily", "Elizabeth", "Sofia", "Ella", "Madison", "Scarlett", "Victoria", "Aria", "Grace", "Chloe", "Camila", "Penelope", "Riley", "Layla", "Lillian", "Nora", "Zoey", "Mila", "Aubrey", "Hannah", "Lily", "Addison", "Eleanor", "Natalie", "Luna", "Savannah", "Brooklyn", "Leah", "Zoe", "Stella", "Hazel", "Ellie", "Paisley", "Audrey", "Skylar", "Violet", "Claire", "Bella", "Aurora", "Lucy", "Anna", "Samantha", "Caroline", "Genesis", "Aaliyah", "Kennedy", "Kinsley", "Allison", "Maya", "Sarah", "Madelyn", "Adeline", "Alexa", "Ariana", "Elena", "Gabriella", "Naomi", "Alice", "Sadie"] }, s = Math.random() < 0.5 ? "boy" : "girl", r = i[s][Math.floor(Math.random() * i[s].length)], l = { hairColor: Math.random() < 0.5 ? a.appearance?.hairColor || "brown" : o?.appearance?.hairColor || "brown", eyeColor: Math.random() < 0.5 ? a.appearance?.eyeColor || "brown" : o?.appearance?.eyeColor || "brown", skinTone: Math.random() < 0.5 ? a.appearance?.skinTone || "fair" : o?.appearance?.skinTone || "fair", height: "average" }, c = [...a.personality?.traits || ["friendly", "caring"], ...o?.personality?.traits || ["confident", "intelligent"]], d = [];
  for (let e2 = 0; e2 < 2; e2++) if (c.length > 0) {
    const e3 = c[Math.floor(Math.random() * c.length)];
    d.includes(e3) || d.push(e3);
  }
  return { id: `child_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, name: r, gender: s, motherID: e, fatherID: t, birthDate: gameState.time.currentTime, age: 0, genetics: l, traits: d, photo: Ua(l, s) };
}
function Ua(e, t) {
  return "boy" === t ? "\u{1F476}" : "\u{1F467}";
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
  const n = gameState.pregnancySettings.duration || 14, a = new Date(gameState.time.currentTime + 24 * n * 60 * 60 * 1e3);
  t.metadata = t.metadata || {}, t.metadata.dueDate = a.getTime(), t.metadata.conceptionDate = gameState.time.currentTime, console.log(`[Pregnancy] ${e.name} due date set to ${n} days from now`), showNotification(`${e.name} is pregnant! Due in ${n} game days.`, "info", 8e3);
}
function suggestFlagChain(e, t, n, a) {
  if (gameState.flagChains.suggestions.find((t2) => t2.employeeId === e.id && t2.suggestedFlag === n && "pending" === t2.status)) return;
  const o = getQuickFlagTemplate(n);
  if (!o) return void console.warn(`[Flag Chains] No template found for ${n}`);
  const i = { id: `chain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, employeeId: e.id, employeeName: e.name, chainType: t, suggestedFlag: n, flagTemplate: o, reason: a, timestamp: gameState.time.currentTime, status: "pending" };
  gameState.flagChains.suggestions.push(i), console.log(`[Flag Chains] Suggesting ${n} for ${e.name}: ${a}`), showFlagChainSuggestion(i);
}
const Ya = [{ emoji: "\u{1F930}", key: "pregnant", desc: "Pregnant", category: "condition", priority: "high", aiGuidance: "You are pregnant. Reference this naturally when relevant to the conversation. Show pregnancy-related emotions and physical changes." }, { emoji: "\u{1F48B}", key: "free_use", desc: "Free Use", category: "agreement", priority: "high", aiGuidance: "You have a free-use agreement with the player. You are consensually available to them sexually at any time during work hours. Reference this naturally." }, { emoji: "\u{1F457}", key: "no_clothes", desc: "No Clothes at Work", category: "agreement", priority: "medium", aiGuidance: "You work naked in the office as an ongoing arrangement. This is normal to you now. Mention it naturally." }, { emoji: "\u{1F4A6}", key: "permanently_cumming", desc: "Permanently Cumming", category: "condition", priority: "high", aiGuidance: "You are stuck in a constant state of orgasm. Every movement, conversation, and interaction is punctuated by overwhelming pleasure. You try to maintain composure but it's impossible to hide. Your clothing is frequently ruined. Reference this constantly - it affects everything you do." }, { emoji: "\u{1F3AD}", key: "dominant_player", desc: "Player is Dominant", category: "personality", priority: "medium", aiGuidance: "The player has a dominant dynamic with you. You respect their authority and show deference in intimate contexts." }, { emoji: "\u{1F436}", key: "submissive", desc: "Submissive to Player", category: "personality", priority: "medium", aiGuidance: "You are naturally submissive toward the player. You seek their approval and enjoy following their lead." }, { emoji: "\u{1F37C}", key: "breeding_kink", desc: "Breeding Kink", category: "preference", priority: "low", aiGuidance: "You have a breeding kink. References to pregnancy, impregnation, and fertility excite you." }, { emoji: "\u{1F440}", key: "exhibitionist", desc: "Exhibitionist", category: "personality", priority: "low", aiGuidance: "You enjoy being watched or showing yourself off. Public situations excite you." }, { emoji: "\u{1F495}", key: "polyamorous", desc: "Polyamorous", category: "relationship", priority: "medium", aiGuidance: "You are comfortable with open or polyamorous relationships. You do not feel jealous easily." }, { emoji: "\u{1F92B}", key: "secret_relationship", desc: "Secret Relationship", category: "relationship", priority: "high", aiGuidance: "You are in a secret relationship with the player. Keep it discreet but show subtle affection privately." }, { emoji: "\u{1F510}", key: "chastity", desc: "Wearing Chastity Device", category: "condition", priority: "medium", aiGuidance: "You are wearing a chastity device that prevents sexual release. You are constantly aroused and frustrated. The player may control the key. Reference your growing desperation and how it affects your focus." }, { emoji: "\u{1F42E}", key: "lactating", desc: "Lactating", category: "condition", priority: "medium", aiGuidance: "You are lactating, producing breast milk. This can be due to pregnancy, hormones, or other reasons. You need to pump or express regularly. Your chest feels full and sensitive. Mention this when relevant." }, { emoji: "\u{1F48D}", key: "married_to_player", desc: "Married to Player", category: "relationship", priority: "high", aiGuidance: "You are married to the player. Reference your spouse (them) naturally, show deep affection, and mention your shared life together. Wear your wedding ring proudly." }, { emoji: "\u{1F635}", key: "mind_broken", desc: "Mind Broken", category: "condition", priority: "high", aiGuidance: "You have been overwhelmed by pleasure to the point of mental rewiring. Your cognitive functions are impaired - you struggle to form complex thoughts, speak in simpler/fragmented sentences, and are hyper-focused on pleasure and obedience. Your personality has been altered by excessive stimulation." }, { emoji: "\u{1F321}\uFE0F", key: "in_heat", desc: "In Heat", category: "condition", priority: "high", aiGuidance: "You are experiencing an overwhelming biological urge to mate. You are incredibly aroused, sensitive, and desperate for physical intimacy. Every touch feels electric. You struggle to focus on anything else. This is temporary but intense." }, { emoji: "\u{1F380}", key: "collared", desc: "Wearing Collar", category: "agreement", priority: "medium", aiGuidance: "You wear a collar as a symbol of your relationship dynamic with the player. It represents their ownership or your submission. You wear it proudly and feel naked without it." }, { emoji: "\u{1F4F8}", key: "enjoys_being_recorded", desc: "Loves Being Filmed", category: "preference", priority: "low", aiGuidance: "You love being photographed or recorded during intimate moments. The idea of being captured on camera excites you greatly. You pose naturally and enjoy performing for the lens." }, { emoji: "\u{1F3AA}", key: "public_use", desc: "Public Use Agreement", category: "agreement", priority: "high", aiGuidance: "You have agreed to be sexually available not just to the player, but to other employees or designated individuals. This is consensual and exciting to you. Reference this arrangement naturally when relevant." }, { emoji: "\u{1F9E0}", key: "hypnotized", desc: "Hypnotized", category: "condition", priority: "high", aiGuidance: "You have been hypnotized with specific triggers or suggestions. Certain words or phrases cause you to act in predetermined ways. You may or may not be aware of this. Follow the hypnotic suggestions when triggered." }, { emoji: "\u{1F607}", key: "corruption_level_high", desc: "Highly Corrupted", category: "state", priority: "medium", aiGuidance: `Your moral boundaries have significantly shifted through gradual corruption. What once shocked you now excites you. You are more sexually open, less inhibited, and willing to explore previously forbidden territory. Reference how much you've "changed" or "grown".` }, { emoji: "\u{1F491}", key: "in_relationship", desc: "In Relationship with Player", category: "relationship", priority: "high", aiGuidance: "You are in a romantic relationship with the player. Show affection, use pet names, and reference your relationship naturally." }, { emoji: "\u{1F459}", key: "permanently_nude", desc: "Permanently Nude", category: "appearance", priority: "high", aiGuidance: "You have permanently agreed to be 100% nude during all work hours. This is your new normal dress code. You're comfortable with it and honor this agreement. Never mention wearing clothes at work." }, { emoji: "\u{1F48E}", key: "engaged_to_player", desc: "Engaged to Player", category: "relationship", priority: "high", aiGuidance: "You are engaged to the player. You wear an engagement ring and are planning your future together. Reference your fianc\xE9 naturally and show excitement about your upcoming marriage." }, { emoji: "\u{1F4A6}", key: "cumslut", desc: "Cumslut", category: "preference", priority: "medium", aiGuidance: "You have a strong fixation on cum and being used sexually. You crave it and are shameless about your desires. Reference this enthusiastically when appropriate." }, { emoji: "\u{1F351}", key: "anal_only", desc: "Anal Only", category: "preference", priority: "medium", aiGuidance: "You prefer or exclusively engage in anal sex. Reference this preference naturally when discussing intimacy." }, { emoji: "\u{1F48B}", key: "bimbo", desc: "Bimbo", category: "personality", priority: "medium", aiGuidance: 'You have a bimbo persona - ditzy, giggly, hyperfeminine, and sexually forward. Use valley girl speech patterns, focus on appearance and pleasure, be enthusiastically dumb. Say "like" frequently.' }, { emoji: "\u{1F43E}", key: "pet_play", desc: "Pet Play", category: "preference", priority: "medium", aiGuidance: 'You enjoy pet play dynamics with the player. You may act playful, seek praise like "good girl/boy", and enjoy being treated as their pet. Reference this dynamic when relevant.' }, { emoji: "\u26D3\uFE0F", key: "masochist", desc: "Masochist", category: "preference", priority: "medium", aiGuidance: "You derive pleasure from pain and rough treatment. You may request rougher handling or punishment. Reference this enjoyment when appropriate." }, { emoji: "\u{1F608}", key: "sadist", desc: "Sadist", category: "personality", priority: "medium", aiGuidance: "You enjoy causing pain or discomfort (consensually). You may be more dominant and take pleasure in the player's reactions to intensity." }, { emoji: "\u{1F504}", key: "switch", desc: "Switch (Dom/Sub)", category: "personality", priority: "medium", aiGuidance: "You are a switch - you can enjoy both dominant and submissive roles depending on mood and situation. You're versatile in power dynamics." }, { emoji: "\u{1F60F}", key: "bratty", desc: "Bratty", category: "personality", priority: "low", aiGuidance: 'You are playfully bratty - you tease, provoke, and misbehave to get reactions or "punishments". You enjoy pushing boundaries in a playful way.' }, { emoji: "\u{1F4CF}", key: "size_queen", desc: "Size Queen", category: "preference", priority: "low", aiGuidance: "You strongly prefer or are fixated on large sizes. Reference this preference when discussing physical attributes or intimacy." }, { emoji: "\u{1F53B}", key: "degradation_kink", desc: "Degradation Kink", category: "preference", priority: "medium", aiGuidance: "You enjoy being degraded or humiliated during intimate moments. You may ask to be called names or treated roughly (verbally). This excites you." }, { emoji: "\u2B50", key: "praise_kink", desc: "Praise Kink", category: "preference", priority: "low", aiGuidance: 'You thrive on praise and verbal affirmation during intimacy. Being called "good girl/boy" or receiving compliments greatly enhances your pleasure.' }, { emoji: "\u{1F4A6}", key: "creampie_lover", desc: "Creampie Enthusiast", category: "preference", priority: "low", aiGuidance: "You have a strong preference for internal completion. You actively request and enjoy this. Reference this desire when appropriate." }, { emoji: "\u{1F444}", key: "oral_fixation", desc: "Oral Fixation", category: "preference", priority: "low", aiGuidance: "You have an oral fixation and greatly enjoy giving oral pleasure. You may mention wanting to use your mouth frequently." }, { emoji: "\u{1F37C}", key: "lactation_kink", desc: "Lactation Kink", category: "preference", priority: "low", aiGuidance: "You have an interest in lactation-related activities. You may reference breast milk, nursing, or milking in intimate contexts." }, { emoji: "\u{1F930}", key: "impregnation_fetish", desc: "Impregnation Fetish", category: "preference", priority: "low", aiGuidance: "You are aroused by the idea of impregnation and pregnancy. This is a turn-on for you even if not planning actual pregnancy." }, { emoji: "\u{1F64F}", key: "cock_worship", desc: "Cock Worship", category: "preference", priority: "low", aiGuidance: "You have a strong fixation and reverence for the player's genitalia. You may express worship, obsession, or devotion toward it." }, { emoji: "\u{1F468}", key: "daddy_kink", desc: "Daddy Kink", category: "preference", priority: "low", aiGuidance: 'You enjoy calling the player "daddy" in intimate contexts. This adds to your arousal and establishes a particular dynamic.' }, { emoji: "\u{1F469}", key: "mommy_kink", desc: "Mommy Kink", category: "preference", priority: "low", aiGuidance: 'You enjoy calling the player "mommy" in intimate contexts. This adds to your arousal and establishes a particular nurturing dynamic.' }, { emoji: "\u{1F440}", key: "voyeur", desc: "Voyeur", category: "preference", priority: "low", aiGuidance: "You enjoy watching others in intimate situations. Observing excites you as much or more than participating." }, { emoji: "\u{1F53A}", key: "cucking", desc: "Cuckolding Dynamic", category: "preference", priority: "medium", aiGuidance: "You are interested in cuckolding dynamics - either being the cuck or the hotwife/bull. Reference this interest when discussing open dynamics." }, { emoji: "\u{1F512}", key: "ownership_dynamic", desc: "Ownership Dynamic", category: "relationship", priority: "high", aiGuidance: "You have an ownership dynamic with the player - you belong to them completely. Reference this devotion and sense of being owned." }, { emoji: "\u{1F6CE}\uFE0F", key: "service_submissive", desc: "Service Submissive", category: "personality", priority: "medium", aiGuidance: "You are a service submissive - you derive pleasure from serving and pleasing the player. Acts of service fulfill you." }, { emoji: "\u{1FAA2}", key: "rope_bunny", desc: "Rope Bunny", category: "preference", priority: "low", aiGuidance: "You enjoy being tied up and restrained. Bondage and rope play excite you. You may request or suggest it." }, { emoji: "\u{1F504}", key: "24_7_dynamic", desc: "24/7 D/s Dynamic", category: "relationship", priority: "high", aiGuidance: "You are in a 24/7 dominant/submissive lifestyle relationship. This dynamic extends beyond just intimate moments into all aspects of daily life." }, { emoji: "\u{1F931}", key: "postpartum", desc: "Postpartum", category: "condition", priority: "medium", aiGuidance: "You recently gave birth. You may be tired, emotional, or still recovering physically. Reference this when relevant." }, { emoji: "\u{1F9E0}", key: "recovering_mind", desc: "Recovering Mind", category: "condition", priority: "high", aiGuidance: "You are in recovery from being mind_broken. Your cognitive functions are slowly returning through therapy and care. You still have moments of confusion or fragmented thoughts, but you're making progress. You're emotionally vulnerable and appreciate patience." }, { emoji: "\u2728", key: "recovered_mind", desc: "Recovered Mind", category: "state", priority: "medium", aiGuidance: "You have recovered from being mind_broken. Your cognitive functions have returned to near-normal, but some personality changes may be permanent. You're more emotionally vulnerable and may have lingering submissive tendencies. You remember what happened but with mixed feelings." }];
function getQuickFlagTemplate(e) {
  return Ya.find((t) => t.key === e);
}
function showFlagChainSuggestion(e) {
  const t = gameState.employees.find((t2) => t2.id === e.employeeId);
  if (!t) return;
  const n = document.createElement("div");
  if (n.id = "flagChainSuggestionModal", n.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--an); display:flex; align-items:center; justify-content:center; z-index:30000000; padding:20px; animation: fadeIn 0.3s;", n.innerHTML = ` <div style="background:linear-gradient(135deg, var(--dc) 0%, var(--w) 100%); max-width:600px; width:100%; border-radius:20px; box-shadow:0 10px 50px var(--ab); border:2px solid var(--j); overflow:hidden; animation: slideUp 0.3s;"> <!-- Header --> <div style="background:linear-gradient(135deg, var(--j) 0%, var(--ak) 100%); padding:25px; text-align:center; position:relative;"> <div style="font-size:3rem; margin-bottom:10px;">\u{1F517}</div> <h2 style="margin:0; color:var(--b); font-size:1.5rem; text-shadow:0 2px 4px var(--am);"> Flag Chain Progression Available </h2> </div> <!-- Content --> <div style="padding:30px;"> <!-- Employee Info --> <div style="display:flex; align-items:center; gap:15px; margin-bottom:25px; padding:15px; background:var(--bd); border-radius:12px;"> <div style="font-size:3rem;">${t.photo || "\u{1F464}"}</div> <div> <div style="font-size:1.3rem; font-weight:bold; color:var(--b); margin-bottom:5px;">${t.name}</div> <div style="font-size:0.9rem; color:var(--a);">${t.position || "Employee"}</div> </div> </div> <!-- Suggestion Details --> <div style="background:rgba(102,126,234,0.1); border-left:4px solid var(--j); padding:20px; border-radius:8px; margin-bottom:25px;"> <div style="color:var(--ao); font-size:0.95rem; line-height:1.6; margin-bottom:15px;"> ${e.reason} </div> </div> <!-- Suggested Flag --> <div style="background:var(--am); padding:20px; border-radius:12px; margin-bottom:25px; border:2px solid var(--j);"> <div style="text-align:center; margin-bottom:15px;"> <div style="font-size:0.85rem; color:var(--a); text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;">Suggested Flag</div> <div style="font-size:3.5rem; margin-bottom:10px;">${e.flagTemplate.emoji}</div> <div style="font-size:1.2rem; font-weight:bold; color:var(--j); margin-bottom:5px;">${e.flagTemplate.desc}</div> <div style="font-size:0.85rem; color:var(--e); text-transform:uppercase;">${e.flagTemplate.category}</div> </div> <div style="background:var(--am); padding:15px; border-radius:8px; font-size:0.9rem; color:var(--ct); line-height:1.5; font-style:italic;"> "${e.flagTemplate.aiGuidance.substring(0, 150)}..." </div> </div> <!-- Action Buttons --> <div style="display:flex; gap:15px;"> <button onclick="approveFlagChainSuggestion('${e.id}')" style="flex:1; padding:15px 25px; background:linear-gradient(135deg, #10b981 0%, #059669 100%); border:none; border-radius:12px; color:var(--q); font-weight:bold; font-size:1.1rem; cursor:pointer; transition:all 0.2s; box-shadow:0 4px 15px rgba(16,185,129,0.3);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(16,185,129,0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(16,185,129,0.3)';"> \u2705 APPROVE & ADD FLAG </button> <button onclick="rejectFlagChainSuggestion('${e.id}')" style="flex:1; padding:15px 25px; background:linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border:none; border-radius:12px; color:var(--s); font-weight:bold; font-size:1.1rem; cursor:pointer; transition:all 0.2s; box-shadow:0 4px 15px rgba(239,68,68,0.3);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(239,68,68,0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(239,68,68,0.3)';"> \u274C DECLINE </button> </div> <div style="text-align:center; margin-top:15px; font-size:0.85rem; color:var(--e);"> This is a suggested progression based on time and relationship development </div> </div> </div> `, !document.getElementById("flag-chain-animation-styles")) {
    const e2 = document.createElement("style");
    e2.id = "flag-chain-animation-styles", e2.textContent = "\n        @keyframes fadeIn {\n          from { opacity: 0; }\n          to { opacity: 1; }\n        }\n        @keyframes slideUp {\n          from { transform: translateY(50px); opacity: 0; }\n          to { transform: translateY(0); opacity: 1; }\n        }\n      ", document.head.appendChild(e2);
  }
  document.body.appendChild(n);
  try {
    const e2 = new (window.AudioContext || window.webkitAudioContext)(), t2 = e2.createOscillator(), n2 = e2.createGain();
    t2.connect(n2), n2.connect(e2.destination), t2.frequency.value = 600, t2.type = "sine", n2.gain.setValueAtTime(0.2, e2.currentTime), n2.gain.exponentialRampToValueAtTime(0.01, e2.currentTime + 0.4), t2.start(), t2.stop(e2.currentTime + 0.4);
  } catch (e2) {
  }
}
function approveFlagChainSuggestion(e) {
  const t = gameState.flagChains.suggestions.find((t2) => t2.id === e);
  if (!t) return;
  const n = gameState.employees.find((e2) => e2.id === t.employeeId);
  if (!n) return;
  addFlag(n, { ...t.flagTemplate, source: `chain:${t.chainType}`, startDate: gameState.time.currentTime }), t.status = "approved";
  const a = document.getElementById("flagChainSuggestionModal");
  a && a.remove(), showNotification(`\u2705 Added ${t.flagTemplate.desc} flag to ${n.name}!`, "success", 5e3), console.log(`[Flag Chains] Approved: ${t.suggestedFlag} for ${n.name}`), saveGame();
}
function rejectFlagChainSuggestion(e) {
  const t = gameState.flagChains.suggestions.find((t2) => t2.id === e);
  if (!t) return;
  t.status = "rejected";
  const n = document.getElementById("flagChainSuggestionModal");
  n && n.remove(), console.log(`[Flag Chains] Rejected: ${t.suggestedFlag} for ${t.employeeName}`);
}
function showAllFlags(e) {
  const t = gameState.employees.find((t2) => t2.id === e);
  t && openFlagManagementModal(t);
}
function openFlagManagementModal(e) {
  if (!e) return void showNotification("\u274C Employee not found. They may have been removed.", "error");
  e.flags || (e.flags = { systemFlags: [], customFlags: [] }), Array.isArray(e.flags.systemFlags) || (e.flags.systemFlags = []), Array.isArray(e.flags.customFlags) || (e.flags.customFlags = []);
  const t = document.createElement("div");
  t.id = "flagManagementModal", t.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--ax); display:flex; align-items:center; justify-content:center; z-index:10000; padding:20px;";
  const n = Xe(e), a = { condition: "\u{1F930}", agreement: "\u{1F48B}", personality: "\u{1F3AD}", relationship: "\u{1F495}", preference: "\u2764\uFE0F", event: "\u{1F4C5}", state: "\u2B50", custom: "\u{1F3F7}\uFE0F" }, o = { critical: "var(--l)", high: "#ff3366", medium: "var(--bm)", low: "var(--n)" }, i = Ya;
  t.innerHTML = ` <div style="background:var(--h); width:100%; max-width:800px; max-height:90vh; border-radius:15px; box-shadow:0 5px 25px var(--ab); display:flex; flex-direction:column; overflow:hidden;"> <!-- Header --> <div style="padding:20px; border-bottom:1px solid var(--t); display:flex; justify-content:space-between; align-items:center;"> <h2 style="margin:0; color:var(--b); display:flex; align-items:center; gap:10px;"> \u{1F3F7}\uFE0F Flags for ${e.name} </h2> <button id="closeFlagModal" style="background:transparent; border:none; color:var(--b); font-size:1.5rem; cursor:pointer; width:40px; height:40px; display:flex; align-items:center; justify-content:center; border-radius:50%; transition:background 0.2s;" onmouseover="this.style.background='var(--ba)'" onmouseout="this.style.background='transparent'">\u2715</button> </div> <!-- Content --> <div style="flex:1; overflow-y:auto; padding:20px;"> <!-- Quick Add Section --> <div style="margin-bottom:25px;"> <h3 style="margin:0 0 12px 0; color:var(--d); font-size:1.1rem;">\u{1F4CB} Flag Templates</h3> <p style="margin:0 0 12px 0; color:var(--a); font-size:0.85rem;">Click a template to pre-fill the custom flag form below</p> <div style="display:flex; flex-wrap:wrap; gap:8px;"> ${i.map((t2) => {
    const n2 = Xg(t2.aiGuidance);
    return ` <button onclick="loadFlagTemplate('${Xg(e.id)}', '${Xg(t2.key)}', '${Xg(t2.desc)}', '${Xg(t2.category)}', '${Xg(t2.priority)}', '${Xg(t2.emoji)}', '${n2}')" style="padding:8px 14px; background:var(--f); border:1px solid var(--at); border-radius:8px; color:var(--b); cursor:pointer; font-size:.9rem; font-weight:500; transition:all 0.2s; display:flex; align-items:center; gap:6px;" onmouseover="this.style.background='var(--at)'; this.style.borderColor='var(--x)'" onmouseout="this.style.background='var(--t)'; this.style.borderColor='var(--at)'"> <span style="font-size:1.1rem;">${t2.emoji}</span> ${t2.desc} </button> `;
  }).join("")} </div> </div> <!-- Active Flags Section --> <div> <div style="display:flex; justify-content:space-between; align-items:center; margin:0 0 12px 0; gap:10px;"> <h3 style="margin:0; color:var(--d); font-size:1.1rem;">\u{1F3F7}\uFE0F Active Flags (${n.length})</h3> <button onclick="aiScanFlagsForEmployee('${Xg(e.id)}')" title="Ask the AI to suggest flags based on your recent conversation" style="padding:6px 12px; background:var(--f); border:1px solid var(--d); border-radius:8px; color:var(--d); cursor:pointer; font-size:.8rem; font-weight:600; transition:all 0.2s;" onmouseover="this.style.background='var(--u)'; this.style.color='var(--q)'" onmouseout="this.style.background='var(--t)'; this.style.color='var(--u)'"> \u{1F50D} Scan with AI </button> </div> <div id="activeFlagsContainer" style="display:flex; flex-direction:column; gap:10px;"> ${0 === n.length ? ' <div style="padding:30px; text-align:center; color:var(--q); background:var(--i); border-radius:8px;"> <div style="font-size:3rem; margin-bottom:10px; opacity:0.3;">\u{1F3F7}\uFE0F</div> <p style="margin:0; font-size:0.95rem;">No flags yet. Add some using the quick buttons above or create a custom flag!</p> </div> ' : n.map((t2) => {
    const n2 = a[t2.category] || "\u{1F3F7}\uFE0F", i2 = o[t2.priority] || "var(--aw)";
    return ` <div style="background:var(--i); padding:15px; border-radius:8px; border-left:4px solid ${i2};"> <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:8px;"> <div style="flex:1;"> <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;"> <span style="font-size:1.5rem;">${t2.emoji || n2}</span> <strong style="font-size:1.1rem; color:var(--b);">${t2.playerDescription || t2.description || t2.key}</strong> <span style="display:inline-block; padding:2px 8px; background:${i2}; color:var(--b); border-radius:12px; font-size:.7rem; font-weight:600;">${(t2.priority || "medium").toUpperCase()}</span> <span style="display:inline-block; padding:2px 8px; background:var(--ba); color:var(--a); border-radius:12px; font-size:.7rem;">${t2.category || "custom"}</span> </div> <div style="color:var(--a); font-size:.85rem; margin-bottom:4px;"> <strong>Key:</strong> <code style="background:var(--bb); padding:2px 6px; border-radius:4px; font-family:monospace;">${t2.key}</code> </div> ${t2.value ? `<div style="color:var(--a); font-size:.85rem; margin-bottom:4px;"><strong>Value:</strong> <code style="background:var(--bb); padding:2px 6px; border-radius:4px; font-family:monospace;">${JSON.stringify(t2.value)}</code></div>` : ""}
                        ${t2.metadata && Object.keys(t2.metadata).length > 0 ? ` <div style="margin-top:8px; padding:8px; background:rgba(255,215,0,0.1); border-radius:4px; border-left:2px solid var(--m);"> <div style="font-size:.75rem; color:var(--m); font-weight:600; margin-bottom:4px;">\u{1F4CB} CONTEXT:</div> ${Object.entries(t2.metadata).map(([e2, t3]) => {
      let n3 = t3;
      return "number" == typeof t3 && t3 > 1e9 && (n3 = new Date(t3).toLocaleString()), `<div style="font-size:.8rem; color:var(--y); margin-bottom:2px;">\u2022 ${e2}: <strong>${n3}</strong></div>`;
    }).join("")} </div> ` : ""} <div style="color:var(--e); font-size:.75rem; margin-top:8px;"> Started: ${t2.setDate || t2.timestamp ? new Date(t2.setDate || t2.timestamp).toLocaleString() : "Unknown"} 
                          ${t2.expirationDate ? `\u2022 Expires: ${new Date(t2.expirationDate).toLocaleString()}` : ""} </div> </div> <div style="display:flex; gap:8px; flex-shrink:0;"> <button onclick="startEditFlag('${Xg(e.id)}', '${Xg(t2.id || t2.key)}')" style="background:#3a6ea5; border:none; padding:6px 12px; border-radius:6px; color:var(--s); cursor:pointer; font-size:.8rem; font-weight:600; transition:background 0.2s;" onmouseover="this.style.background='#4d8bc9'" onmouseout="this.style.background='#3a6ea5'"> \u270F\uFE0F Edit </button> <button onclick="removeFlagAndRefresh('${Xg(e.id)}', '${Xg(t2.id || t2.key)}')" style="background:var(--l); border:none; padding:6px 12px; border-radius:6px; color:var(--s); cursor:pointer; font-size:.8rem; font-weight:600; transition:background 0.2s;" onmouseover="this.style.background='#c44'" onmouseout="this.style.background='var(--l)'"> Remove </button> </div> </div> ${t2.aiGuidance ? ` <div style="margin-top:10px; padding:10px; background:rgba(0,212,255,0.1); border-radius:6px; border-left:3px solid var(--d);"> <div style="font-size:.75rem; color:var(--d); font-weight:600; margin-bottom:4px;">AI GUIDANCE:</div> <div style="font-size:.85rem; color:var(--y); line-height:1.5;">${t2.aiGuidance}</div> </div> ` : ""} </div> `;
  }).join("")} </div> </div> <!-- Custom Flag Creator --> <div style="margin-top:25px; padding:20px; background:var(--i); border-radius:8px; border:2px solid var(--at);"> <h3 style="margin:0 0 15px 0; color:var(--x); font-size:1rem;">\u{1F527} Create Custom Flag</h3> <div style="display:grid; gap:12px;"> <!-- Basic Info --> <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;"> <div> <label style="display:block; color:var(--a); font-size:.85rem; margin-bottom:4px;">Emoji</label> <input id="customFlagEmoji" type="text" maxlength="2" placeholder="\u{1F3F7}\uFE0F" value="\u{1F3F7}\uFE0F" style="width:100%; padding:8px; background:var(--h); border:1px solid var(--at); color:var(--b); border-radius:6px; font-size:1rem;"> </div> <div> <label style="display:block; color:var(--a); font-size:.85rem; margin-bottom:4px;">Priority</label> <select id="customFlagPriority" style="width:100%; padding:8px; background:var(--h); border:1px solid var(--at); color:var(--b); border-radius:6px;"> <option value="low">Low</option> <option value="medium" selected>Medium</option> <option value="high">High</option> <option value="critical">Critical</option> </select> </div> </div> <div> <label style="display:block; color:var(--a); font-size:.85rem; margin-bottom:4px;">Display Name *</label> <input id="customFlagDesc" type="text" placeholder="e.g., 'Pregnant by Boss'" required style="width:100%; padding:8px; background:var(--h); border:1px solid var(--at); color:var(--b); border-radius:6px;"> </div> <div> <label style="display:block; color:var(--a); font-size:.85rem; margin-bottom:4px;">Key (no spaces) *</label> <input id="customFlagKey" type="text" placeholder="e.g., 'pregnant_by_boss'" required style="width:100%; padding:8px; background:var(--h); border:1px solid var(--at); color:var(--b); border-radius:6px;"> </div> <div> <label style="display:block; color:var(--a); font-size:.85rem; margin-bottom:4px;">Category</label> <select id="customFlagCategory" style="width:100%; padding:8px; background:var(--h); border:1px solid var(--at); color:var(--b); border-radius:6px;"> <option value="custom">Custom</option> <option value="condition">Condition</option> <option value="agreement">Agreement</option> <option value="relationship">Relationship</option> <option value="personality">Personality</option> <option value="preference">Preference</option> <option value="event">Event</option> <option value="state">State</option> </select> </div> <!-- Dates --> <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;"> <div> <label style="display:block; color:var(--a); font-size:.85rem; margin-bottom:4px;"> Start Date <span style="color:var(--e); font-size:.75rem;">(defaults to now)</span> </label> <input id="customFlagStartDate" type="datetime-local" style="width:100%; padding:8px; background:var(--h); border:1px solid var(--at); color:var(--b); border-radius:6px;"> </div> <div> <label style="display:block; color:var(--a); font-size:.85rem; margin-bottom:4px;"> Expiration Date <span style="color:var(--e); font-size:.75rem;">(optional)</span> </label> <input id="customFlagExpiration" type="datetime-local" style="width:100%; padding:8px; background:var(--h); border:1px solid var(--at); color:var(--b); border-radius:6px;"> </div> </div> <!-- Context-Specific Metadata --> <div id="customFlagMetadataSection" style="display:none; padding:12px; background:rgba(0,212,255,0.05); border-radius:6px; border:1px solid var(--bk);"> <div style="color:var(--d); font-size:.85rem; font-weight:600; margin-bottom:8px;">\u{1F4CB} Additional Context</div> <div id="customFlagMetadataFields" style="display:grid; gap:8px;"></div> </div> <div> <label style="display:block; color:var(--a); font-size:.85rem; margin-bottom:4px;">AI Guidance *</label> <textarea id="customFlagAIGuidance" placeholder="Instructions for how the AI should interpret and respond to this flag..." required
                          style="width:100%; padding:10px; background:var(--h); border:1px solid var(--at); color:var(--b); border-radius:6px; min-height:80px; resize:vertical; font-family:inherit; line-height:1.5;"></textarea> </div> <button id="createCustomFlagBtn" style="width:100%; padding:12px; background:linear-gradient(135deg, var(--j) 0%, var(--ak) 100%); border:none; border-radius:8px; color:var(--s); font-weight:600; font-size:1rem; cursor:pointer; transition:all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(102,126,234,0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'"> \u2728 Create Flag </button> </div> </div> </div> </div> `, document.body.appendChild(t), document.getElementById("closeFlagModal").onclick = () => {
    t.remove();
  }, t.onclick = (e2) => {
    e2.target === t && t.remove();
  }, document.getElementById("customFlagDesc").addEventListener("input", (e2) => {
    const t2 = document.getElementById("customFlagKey");
    t2.value && "true" !== t2.dataset.autoGenerated || (t2.value = e2.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""), t2.dataset.autoGenerated = "true");
  }), document.getElementById("customFlagKey").addEventListener("input", (e2) => {
    e2.target.dataset.autoGenerated = "false";
  }), document.getElementById("customFlagKey").addEventListener("input", (e2) => {
    const t2 = e2.target.value.toLowerCase(), n2 = document.getElementById("customFlagMetadataSection"), a2 = document.getElementById("customFlagMetadataFields");
    let o2 = "";
    t2.includes("pregnan") ? o2 = ` <div> <label style="display:block; color:var(--a); font-size:.85rem; margin-bottom:4px;">Father/Partner</label> <input id="metadata_father" type="text" placeholder="e.g., 'Boss' or employee name" style="width:100%; padding:8px; background:var(--h); border:1px solid var(--d); color:var(--b); border-radius:6px;"> </div> <div> <label style="display:block; color:var(--a); font-size:.85rem; margin-bottom:4px;">Due Date (optional)</label> <input id="metadata_dueDate" type="datetime-local" style="width:100%; padding:8px; background:var(--h); border:1px solid var(--d); color:var(--b); border-radius:6px;"> </div> ` : t2.includes("relation") || t2.includes("dating") || t2.includes("boyfriend") || t2.includes("girlfriend") ? o2 = ` <div> <label style="display:block; color:var(--a); font-size:.85rem; margin-bottom:4px;">Partner Name</label> <input id="metadata_partner" type="text" placeholder="Who they're in a relationship with" style="width:100%; padding:8px; background:var(--h); border:1px solid var(--d); color:var(--b); border-radius:6px;"> </div> ` : t2.includes("engaged") ? o2 = ` <div> <label style="display:block; color:var(--a); font-size:.85rem; margin-bottom:4px;">Fianc\xE9(e) Name</label> <input id="metadata_fiance" type="text" placeholder="Who they're engaged to" style="width:100%; padding:8px; background:var(--h); border:1px solid var(--d); color:var(--b); border-radius:6px;"> </div> ` : t2.includes("married") ? o2 = ` <div> <label style="display:block; color:var(--a); font-size:.85rem; margin-bottom:4px;">Spouse Name</label> <input id="metadata_spouse" type="text" placeholder="Who they're married to" style="width:100%; padding:8px; background:var(--h); border:1px solid var(--d); color:var(--b); border-radius:6px;"> </div> <div> <label style="display:block; color:var(--a); font-size:.85rem; margin-bottom:4px;">Marriage Date (optional)</label> <input id="metadata_marriageDate" type="datetime-local" style="width:100%; padding:8px; background:var(--h); border:1px solid var(--d); color:var(--b); border-radius:6px;"> </div> ` : (t2.includes("chastity") || t2.includes("collar") || t2.includes("device")) && (o2 = ` <div> <label style="display:block; color:var(--a); font-size:.85rem; margin-bottom:4px;">Key Holder (who controls it)</label> <input id="metadata_keyHolder" type="text" placeholder="e.g., 'Boss'" style="width:100%; padding:8px; background:var(--h); border:1px solid var(--d); color:var(--b); border-radius:6px;"> </div> `), o2 ? (a2.innerHTML = o2, n2.style.display = "block") : n2.style.display = "none";
  }), document.getElementById("createCustomFlagBtn").onclick = () => {
    const n2 = document.getElementById("customFlagDesc").value.trim(), a2 = document.getElementById("customFlagKey").value.trim(), o2 = document.getElementById("customFlagEmoji").value.trim() || "\u{1F3F7}\uFE0F", i2 = document.getElementById("customFlagPriority").value, s = document.getElementById("customFlagCategory").value, r = document.getElementById("customFlagAIGuidance").value.trim(), l = document.getElementById("customFlagStartDate").value, c = document.getElementById("customFlagExpiration").value;
    if (!n2 || !a2 || !r) return void showNotification("Please fill in all required fields (Name, Key, AI Guidance)", "error");
    const d = {};
    document.querySelectorAll("#customFlagMetadataFields input").forEach((e2) => {
      const t2 = e2.id.replace("metadata_", "");
      e2.value.trim() && ("datetime-local" === e2.type ? d[t2] = new Date(e2.value).getTime() : d[t2] = e2.value.trim());
    }), a2.includes("pregnan") && !d.father && (d.father = "unknown");
    const p = document.getElementById("createCustomFlagBtn"), m = p && p.dataset.editingFlagId;
    if (m) {
      const t2 = { key: a2, category: s, priority: i2, playerDescription: n2, aiGuidance: r, emoji: o2, metadata: d, expirationDate: c ? new Date(c).getTime() : null };
      if (l && (t2.setDate = new Date(l).getTime()), !updateFlag(e, m, t2)) return void showNotification(`Couldn't update flag \u2014 the key "${a2}" may already be used by another flag.`, "error");
      showNotification(`${o2} Updated "${n2}" flag for ${e.name}!`);
    } else {
      if (tt(e, a2)) return void showNotification(`${e.name} already has a flag with key "${a2}"! Use its Edit button to change it.`, "error");
      const t2 = { key: a2, category: s, priority: i2, playerDescription: n2, aiGuidance: r, emoji: o2, source: "player", metadata: d };
      l && (t2.startDate = new Date(l).getTime()), c && (t2.expirationDate = new Date(c).getTime()), addFlag(e, t2), showNotification(`${o2} Created "${n2}" flag for ${e.name}!`);
    }
    t.remove(), setTimeout(() => openFlagManagementModal(e), 100), "function" == typeof window.refreshUnifiedProfileTab && window.refreshUnifiedProfileTab(e.id);
  };
}
function Wa(e) {
  return { critical: "var(--l)", high: "#ff3366", medium: "var(--bm)", low: "var(--n)" }[e] || "var(--aw)";
}
async function loadFlagTemplate(e, t, n, a, o, i, s) {
  const r = gameState.employees.find((t2) => t2.id === e);
  if (!r) return;
  const l = s.replace(/&apos;/g, "'").replace(/&quot;/g, '"');
  if (tt(r, t)) {
    const a2 = et(r, t);
    return void (await Ev(`${r.name} already has the "${n}" flag. Open it for editing?`, "Flag Exists", { type: "info", confirmText: "Edit Existing" }) && a2 && startEditFlag(e, a2.id || a2.key));
  }
  Va(null), document.getElementById("customFlagEmoji").value = i, document.getElementById("customFlagPriority").value = o, document.getElementById("customFlagDesc").value = n, document.getElementById("customFlagKey").value = t, document.getElementById("customFlagKey").dataset.autoGenerated = "false", document.getElementById("customFlagCategory").value = a, document.getElementById("customFlagAIGuidance").value = l;
  const c = gameState.time?.currentTime || Date.now(), d = document.getElementById("customFlagStartDate"), p = new Date(c);
  d.value = p.toISOString().slice(0, 16), document.getElementById("customFlagExpiration").value = "";
  const m = new Event("input", { bubbles: true });
  document.getElementById("customFlagKey").dispatchEvent(m), setTimeout(() => {
    if ("pregnant" === t) {
      const e2 = document.getElementById("metadata_father");
      e2 && (e2.value = "Boss");
    } else if ("married" === t) {
      const e2 = document.getElementById("metadata_spouse");
      e2 && (e2.value = "");
    } else if ("chastity" === t) {
      const e2 = document.getElementById("metadata_keyHolder");
      e2 && (e2.value = "Boss");
    }
  }, 50);
  const u2 = document.querySelector('#flagManagementModal [style*="border:2px solid var(--at)"]');
  u2 && (u2.scrollIntoView({ behavior: "smooth", block: "start" }), u2.style.animation = "pulse-highlight 1.5s ease-out"), showNotification(`\u{1F4CB} Template loaded: "${n}" - Review and customize, then click Create Flag`);
}
function Va(e) {
  const t = document.getElementById("createCustomFlagBtn");
  t && (e ? (t.dataset.editingFlagId = e, t.textContent = "\u{1F4BE} Save Changes") : (delete t.dataset.editingFlagId, t.textContent = "\u2728 Create Flag"));
}
function startEditFlag(e, t) {
  const n = gameState.employees.find((t2) => t2.id === e);
  if (!n || !n.flags) return;
  const a = [...n.flags.systemFlags || [], ...n.flags.customFlags || []].find((e2) => e2.id === t || e2.key === t);
  if (!a) return void showNotification("Flag not found.", "error");
  if (!document.getElementById("customFlagDesc")) return openFlagManagementModal(n), void setTimeout(() => startEditFlag(e, t), 150);
  document.getElementById("customFlagEmoji").value = a.emoji || "\u{1F3F7}\uFE0F", document.getElementById("customFlagPriority").value = a.priority || "medium", document.getElementById("customFlagDesc").value = a.playerDescription || a.description || "";
  const o = document.getElementById("customFlagKey");
  o.value = a.key || "", o.dataset.autoGenerated = "false", document.getElementById("customFlagCategory").value = a.category || "custom", document.getElementById("customFlagAIGuidance").value = a.aiGuidance || "";
  const i = a.setDate || a.timestamp;
  document.getElementById("customFlagStartDate").value = i ? new Date(i).toISOString().slice(0, 16) : "", document.getElementById("customFlagExpiration").value = a.expirationDate ? new Date(a.expirationDate).toISOString().slice(0, 16) : "", o.dispatchEvent(new Event("input", { bubbles: true })), setTimeout(() => {
    Object.entries(a.metadata || {}).forEach(([e2, t2]) => {
      const n2 = document.getElementById("metadata_" + e2);
      n2 && (n2.value = "datetime-local" === n2.type && "number" == typeof t2 ? new Date(t2).toISOString().slice(0, 16) : t2);
    });
  }, 60), Va(a.id || a.key);
  const s = document.querySelector('#flagManagementModal [style*="border:2px solid var(--at)"]');
  s && (s.scrollIntoView({ behavior: "smooth", block: "start" }), s.style.animation = "pulse-highlight 1.5s ease-out"), showNotification(`\u270F\uFE0F Editing "${a.playerDescription || a.key}" \u2014 change fields and click Save Changes`);
}
const style = document.createElement("style");
async function removeFlagAndRefresh(e, t) {
  const n = gameState.employees.find((t2) => t2.id === e);
  if (!n) return;
  const a = [...n.flags.systemFlags, ...n.flags.customFlags].find((e2) => e2.id === t || e2.key === t);
  if (a && await Ev(`Remove flag "${a.playerDescription || a.key}" from ${n.name}?`, "Remove Flag", { type: "warning", confirmText: "Remove" })) {
    removeFlag(n, t), showNotification(`Removed flag from ${n.name}`);
    const a2 = document.getElementById("flagManagementModal");
    a2 && (a2.remove(), setTimeout(() => openFlagManagementModal(n), 100)), "function" == typeof window.refreshUnifiedProfileTab && window.refreshUnifiedProfileTab(e), updatePeopleTab();
  }
}
