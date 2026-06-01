setup.SexualActsDB = {
	// ===============================
	// 🔸 ORAL ACTIONS
	// ===============================
	
	// Player Giving Oral
	Oral_Penis_G_Tease: {
		label: "Tease Their Cock With Your Mouth",
		category: "Oral",
		actionType: "oral",
		stageGroup: "oral_penis",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["mouth"],
		objectParts: ["penis"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 1, object: 8 },
		preferenceTags: ["Oral_R", "Penis"],
		inclinationTags: ["tease", "service"],
		togglable: true
	},

	Oral_Penis_G_Suck: {
		label: "Suck Their Cock",
		category: "Oral",
		actionType: "oral",
		stageGroup: "oral_penis",
		stageLevel: 1,
		giver: "player",
		receiver: "npc",
		subjectParts: ["mouth"],
		objectParts: ["penis"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 2, object: 15 },
		preferenceTags: ["Oral_R", "Penis"],
		inclinationTags: ["submission", "service"],
		togglable: true
	},

	Oral_Penis_G_Deepthroat: {
		label: "Deepthroat Them",
		category: "Oral",
		actionType: "oral",
		stageGroup: "oral_penis",
		stageLevel: 2,
		giver: "player",
		receiver: "npc",
		subjectParts: ["mouth"],
		objectParts: ["penis"],
		canTakeVirginity: false,
		skillsRequired: { oral: 3 },
		baseExcitement: { subject: 3, object: 20 },
		preferenceTags: ["Oral_R", "Penis", "Throatplay", "SubPlay"],
		inclinationTags: ["submission", "service", "roughplay"],
		togglable: true
	},

	Oral_Vagina_G_Tease: {
		label: "Tease Their Pussy With Your Tongue",
		category: "Oral",
		actionType: "oral",
		stageGroup: "oral_vagina",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["mouth"],
		objectParts: ["vagina"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 1, object: 10 },
		preferenceTags: ["Oral_R", "Vagina"],
		inclinationTags: ["tease", "service"],
		togglable: true
	},

	Oral_Vagina_G: {
		label: "Eat Them Out",
		category: "Oral",
		actionType: "oral",
		stageGroup: "oral_vagina",
		stageLevel: 1,
		giver: "player",
		receiver: "npc",
		subjectParts: ["mouth"],
		objectParts: ["vagina"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 2, object: 16 },
		preferenceTags: ["Oral_R", "Vagina"],
		inclinationTags: ["service", "sensual"],
		togglable: true
	},

	Oral_Anal_G: {
		label: "Rim Their Ass",
		category: "Oral",
		actionType: "oral",
		stageGroup: "oral_anal",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["mouth"],
		objectParts: ["anus"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 1, object: 12 },
		preferenceTags: ["OralAnal_R"],
		inclinationTags: ["service", "submission"],
		togglable: true
	},

	FaceSit_G: {
		label: "Sit on Their Face",
		category: "Oral",
		actionType: "oral",
		stageGroup: "facesit",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["vagina"],
		objectParts: ["mouth"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 12, object: 8 },
		preferenceTags: ["Oral_R"],
		inclinationTags: ["domination", "exhibitionism"],
		togglable: true
	},

	// ===============================
	// 🔸 PENETRATION ACTIONS
	// ===============================

	Anal_G_Tease: {
		label: "Tease Their Asshole With Your Cock",
		category: "Anal",
		actionType: "anal",
		stageGroup: "anal_penis",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["penis"],
		objectParts: ["anus"],
		canTakeVirginity: true,
		skillsRequired: {},
		baseExcitement: { subject: 6, object: 10 },
		preferenceTags: ["Anal_P", "Dominate"],
		inclinationTags: ["penetration", "dominance"],
		togglable: true
	},

	Anal_G_Penetrate: {
		label: "Penetrate Their Ass",
		category: "Anal",
		actionType: "anal",
		stageGroup: "anal_penis",
		stageLevel: 1,
		giver: "player",
		receiver: "npc",
		subjectParts: ["penis"],
		objectParts: ["anus"],
		canTakeVirginity: true,
		skillsRequired: {},
		baseExcitement: { subject: 12, object: 18 },
		preferenceTags: ["Anal_P", "Rough"],
		inclinationTags: ["penetration", "dominance"],
		togglable: true
	},

	Anal_G_Pound: {
		label: "Pound Their Ass",
		category: "Anal",
		actionType: "anal",
		stageGroup: "anal_penis",
		stageLevel: 2,
		giver: "player",
		receiver: "npc",
		subjectParts: ["penis"],
		objectParts: ["anus"],
		canTakeVirginity: true,
		skillsRequired: { penetration: 2 },
		baseExcitement: { subject: 18, object: 25 },
		preferenceTags: ["Anal_P", "Rough"],
		inclinationTags: ["penetration", "dominance", "roughplay"],
		togglable: true
	},

	Vaginal_G_Tease: {
		label: "Tease Their Pussy With Your Cock",
		category: "Vaginal",
		actionType: "vaginal",
		stageGroup: "vaginal_penis",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["penis"],
		objectParts: ["vagina"],
		canTakeVirginity: true,
		skillsRequired: {},
		baseExcitement: { subject: 8, object: 12 },
		preferenceTags: ["Vaginal_P"],
		inclinationTags: ["penetration", "tease"],
		togglable: true
	},

	Vaginal_G_Penetrate: {
		label: "Penetrate Their Pussy",
		category: "Vaginal",
		actionType: "vaginal",
		stageGroup: "vaginal_penis",
		stageLevel: 1,
		giver: "player",
		receiver: "npc",
		subjectParts: ["penis"],
		objectParts: ["vagina"],
		canTakeVirginity: true,
		skillsRequired: {},
		baseExcitement: { subject: 15, object: 20 },
		preferenceTags: ["Vaginal_P"],
		inclinationTags: ["penetration", "vanilla"],
		togglable: true
	},

	Vaginal_G_Pound: {
		label: "Pound Their Pussy",
		category: "Vaginal",
		actionType: "vaginal",
		stageGroup: "vaginal_penis",
		stageLevel: 2,
		giver: "player",
		receiver: "npc",
		subjectParts: ["penis"],
		objectParts: ["vagina"],
		canTakeVirginity: true,
		skillsRequired: { penetration: 2 },
		baseExcitement: { subject: 22, object: 28 },
		preferenceTags: ["Vaginal_P", "Rough"],
		inclinationTags: ["penetration", "roughplay"],
		togglable: true
	},

	// ===============================
	// 🔸 MANUAL STIMULATION
	// ===============================

	Handjob_Penis_G_Tease: {
		label: "Tease Their Cock With Your Hand",
		category: "Manual",
		actionType: "handjob",
		stageGroup: "handjob_penis",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["hand"],
		objectParts: ["penis"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 1, object: 6 },
		preferenceTags: ["Penis", "Handplay"],
		inclinationTags: ["tease", "service"],
		togglable: true
	},

	Handjob_Penis_G: {
		label: "Stroke Their Cock",
		category: "Manual",
		actionType: "handjob",
		stageGroup: "handjob_penis",
		stageLevel: 1,
		giver: "player",
		receiver: "npc",
		subjectParts: ["hand"],
		objectParts: ["penis"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 2, object: 12 },
		preferenceTags: ["Penis", "Handplay"],
		inclinationTags: ["service", "vanilla"],
		togglable: true
	},

	Handjob_Clit_G_Tease: {
		label: "Tease Their Clit With Your Fingers",
		category: "Manual",
		actionType: "clitoral",
		stageGroup: "handjob_clit",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["hand"],
		objectParts: ["clitoris"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 1, object: 10 },
		preferenceTags: ["Clit_Rub", "Tease"],
		inclinationTags: ["gentle", "foreplay"],
		togglable: true
	},

	Handjob_Clit_G: {
		label: "Rub Their Clit",
		category: "Manual",
		actionType: "clitoral",
		stageGroup: "handjob_clit",
		stageLevel: 1,
		giver: "player",
		receiver: "npc",
		subjectParts: ["hand"],
		objectParts: ["clitoris"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 2, object: 14 },
		preferenceTags: ["Clit_Rub", "Stimulation"],
		inclinationTags: ["service", "direct"],
		togglable: true
	},

	Fingering_Vagina_G_Tease: {
		label: "Tease Their Pussy With Your Fingers",
		category: "Manual",
		actionType: "fingering",
		stageGroup: "fingering_vagina",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["hand"],
		objectParts: ["vagina"],
		canTakeVirginity: true,
		skillsRequired: {},
		baseExcitement: { subject: 1, object: 8 },
		preferenceTags: ["FingeringVag_R"],
		inclinationTags: ["tease", "service"],
		togglable: true
	},

	Fingering_Vagina_G: {
		label: "Finger Their Pussy",
		category: "Manual",
		actionType: "fingering",
		stageGroup: "fingering_vagina",
		stageLevel: 1,
		giver: "player",
		receiver: "npc",
		subjectParts: ["hand"],
		objectParts: ["vagina"],
		canTakeVirginity: true,
		skillsRequired: {},
		baseExcitement: { subject: 2, object: 14 },
		preferenceTags: ["FingeringVag_R"],
		inclinationTags: ["service", "sensual"],
		togglable: true
	},

	Fingering_Anal_G: {
		label: "Finger Their Ass",
		category: "Manual",
		actionType: "fingering",
		stageGroup: "fingering_anal",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["hand"],
		objectParts: ["anus"],
		canTakeVirginity: true,
		skillsRequired: {},
		baseExcitement: { subject: 1, object: 10 },
		preferenceTags: ["FingeringAnal_R"],
		inclinationTags: ["service", "submission"],
		togglable: true
	},

	BreastPlay_G: {
		label: "Touch Their Breasts",
		category: "Manual",
		actionType: "breast",
		stageGroup: "breastplay",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["hand"],
		objectParts: ["breasts"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 1, object: 6 },
		preferenceTags: ["BreastPlay_R"],
		inclinationTags: ["sensual", "vanilla"],
		togglable: true
	},

	NipplePlay_G: {
		label: "Play with Their Nipples",
		category: "Manual",
		actionType: "nipple",
		stageGroup: "nippleplay",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["hand"],
		objectParts: ["breasts"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 1, object: 8 },
		preferenceTags: ["NipplePlay_R"],
		inclinationTags: ["sensual", "tease"],
		togglable: true
	},

	// ===============================
	// 🔸 BREAST ACTIONS
	// ===============================

	Boobjob_G_Tease: {
		label: "Tease Their Cock With Your Breasts",
		category: "Breast",
		actionType: "boobjob",
		stageGroup: "boobjob_penis",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["breasts"],
		objectParts: ["penis"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 1, object: 9 },
		preferenceTags: ["BreastPlay_R", "Oral_G"],
		inclinationTags: ["tease", "visual"],
		togglable: true
	},

	Boobjob_G: {
		label: "Give Them a Boobjob",
		category: "Breast",
		actionType: "boobjob",
		stageGroup: "boobjob_penis",
		stageLevel: 1,
		giver: "player",
		receiver: "npc",
		subjectParts: ["breasts"],
		objectParts: ["penis"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 2, object: 16 },
		preferenceTags: ["BreastPlay_R", "Stimulation"],
		inclinationTags: ["visual", "submission"],
		togglable: true
	},

	// ===============================
	// 🔸 FEET ACTIONS
	// ===============================

	Footjob_Penis_G_Tease: {
		label: "Tease Their Cock With Your Feet",
		category: "Feet",
		actionType: "footjob",
		stageGroup: "footjob_penis",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["feet"],
		objectParts: ["penis"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 1, object: 8 },
		preferenceTags: ["Feet", "Penis"],
		inclinationTags: ["fetish", "tease"],
		togglable: true
	},

	Footjob_Penis_G: {
		label: "Give Them a Footjob",
		category: "Feet",
		actionType: "footjob",
		stageGroup: "footjob_penis",
		stageLevel: 1,
		giver: "player",
		receiver: "npc",
		subjectParts: ["feet"],
		objectParts: ["penis"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 2, object: 12 },
		preferenceTags: ["Feet", "Penis", "Stimulation"],
		inclinationTags: ["fetish", "playful"],
		togglable: true
	},

	Footjob_Vagina_G_Tease: {
		label: "Tease Their Pussy With Your Foot",
		category: "Feet",
		actionType: "footjob",
		stageGroup: "footjob_vagina",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["feet"],
		objectParts: ["vagina"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 1, object: 9 },
		preferenceTags: ["Feet", "Pussy"],
		inclinationTags: ["fetish", "control"],
		togglable: true
	},

	Footjob_Vagina_G: {
		label: "Rub Their Pussy With Your Foot",
		category: "Feet",
		actionType: "footjob",
		stageGroup: "footjob_vagina",
		stageLevel: 1,
		giver: "player",
		receiver: "npc",
		subjectParts: ["feet"],
		objectParts: ["vagina"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 2, object: 13 },
		preferenceTags: ["Feet", "Pussy", "Stimulation"],
		inclinationTags: ["fetish", "playful"],
		togglable: true
	},

	// ===============================
	// 🔸 POWER / DOM-SUB ACTIONS
	// ===============================

	Dominate: {
		label: "Take Control",
		category: "Power",
		actionType: "dominance",
		stageGroup: "power_dynamic",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["body"],
		objectParts: ["mind"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 5, object: 8 },
		preferenceTags: ["Submit"],
		inclinationTags: ["domination", "control"],
		togglable: true
	},

	Submit: {
		label: "Submit",
		category: "Power",
		actionType: "submission",
		stageGroup: "power_dynamic",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["body"],
		objectParts: ["mind"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 3, object: 10 },
		preferenceTags: ["Dominate"],
		inclinationTags: ["submission", "service"],
		togglable: true
	},

	Spank_G: {
		label: "Spank Them",
		category: "Power",
		actionType: "impact",
		stageGroup: "spanking",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["hand"],
		objectParts: ["anus"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 3, object: 8 },
		preferenceTags: ["Spank_R"],
		inclinationTags: ["domination", "roughplay"],
		togglable: true
	},

	HairPulling_G: {
		label: "Pull Their Hair",
		category: "Power",
		actionType: "control",
		stageGroup: "hairpulling",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["hand"],
		objectParts: ["head"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 2, object: 6 },
		preferenceTags: ["HairPulling_R"],
		inclinationTags: ["domination", "roughplay"],
		togglable: true
	},

	Choke_G: {
		label: "Choke Them",
		category: "Power",
		actionType: "breath",
		stageGroup: "choking",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["hand"],
		objectParts: ["neck"],
		canTakeVirginity: false,
		skillsRequired: { domination: 2 },
		baseExcitement: { subject: 4, object: 10 },
		preferenceTags: ["Choke_R"],
		inclinationTags: ["domination", "roughplay"],
		togglable: true
	},

	// ===============================
	// 🔸 BONDAGE & TOYS
	// ===============================

	Bondage_G: {
		label: "Bind Them",
		category: "Bondage",
		actionType: "restraint",
		stageGroup: "bondage",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["hand"],
		objectParts: ["wrists"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 3, object: 8 },
		preferenceTags: ["Bondage_R"],
		inclinationTags: ["bondage", "domination"],
		togglable: false
	},

	Gag_G: {
		label: "Gag Them",
		category: "Bondage",
		actionType: "silence",
		stageGroup: "gagging",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["hand"],
		objectParts: ["mouth"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 2, object: 6 },
		preferenceTags: ["Gag_R"],
		inclinationTags: ["bondage", "domination"],
		togglable: true
	},

	Blindfold_G: {
		label: "Blindfold Them",
		category: "Bondage",
		actionType: "sensory",
		stageGroup: "blindfolding",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["hand"],
		objectParts: ["eyes"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 2, object: 8 },
		preferenceTags: ["Blindfold_R"],
		inclinationTags: ["bondage", "sensory"],
		togglable: true
	},

	Toys_Use: {
		label: "Use a Toy on Them",
		category: "Toys",
		actionType: "toy",
		stageGroup: "toys",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["hand"],
		objectParts: ["vagina"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 2, object: 12 },
		preferenceTags: ["Toys_Receive"],
		inclinationTags: ["sensual", "service"],
		togglable: true
	},

	WaxPlay_G: {
		label: "Drip Wax on Them",
		category: "Toys",
		actionType: "sensation",
		stageGroup: "waxplay",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["hand"],
		objectParts: ["body"],
		canTakeVirginity: false,
		skillsRequired: { domination: 1 },
		baseExcitement: { subject: 3, object: 8 },
		preferenceTags: ["WaxPlay", "SensoryPlay", "SubPlay"],
		inclinationTags: ["sensory", "domination"],
		togglable: false
	},

	// ===============================
	// 🔸 VERBAL ACTIONS
	// ===============================

	DirtyTalk_G: {
		label: "Talk Dirty",
		category: "Verbal",
		actionType: "verbal",
		stageGroup: "dirtytalk",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["mouth"],
		objectParts: ["ears"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 2, object: 6 },
		preferenceTags: ["DirtyTalk_R"],
		inclinationTags: ["verbal", "domination"],
		togglable: false
	},

	Praise_G: {
		label: "Praise Them",
		category: "Verbal",
		actionType: "verbal",
		stageGroup: "praise",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["mouth"],
		objectParts: ["ears"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 1, object: 8 },
		preferenceTags: ["Praise"],
		inclinationTags: ["praise", "vanilla"],
		togglable: false
	},

	Degrade_G: {
		label: "Degrade Them",
		category: "Verbal",
		actionType: "verbal",
		stageGroup: "degradation",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["mouth"],
		objectParts: ["ears"],
		canTakeVirginity: false,
		skillsRequired: { domination: 1 },
		baseExcitement: { subject: 3, object: 6 },
		preferenceTags: ["Degrade_R"],
		inclinationTags: ["verbal", "domination", "roughplay"],
		togglable: false
	},

	// ===============================
	// 🔸 EMOTIONAL ACTIONS
	// ===============================

	Kissing: {
		label: "Kiss Them",
		category: "Emotional",
		actionType: "intimate",
		stageGroup: "kissing",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["mouth"],
		objectParts: ["mouth"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 3, object: 5 },
		preferenceTags: ["Kissing"],
		inclinationTags: ["vanilla", "sensual"],
		togglable: false
	},

	Cuddling: {
		label: "Cuddle Them",
		category: "Emotional",
		actionType: "intimate",
		stageGroup: "cuddling",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["body"],
		objectParts: ["body"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 1, object: 3 },
		preferenceTags: ["Cuddling"],
		inclinationTags: ["vanilla", "sensual"],
		togglable: false
	},

	// ===============================
	// 🔸 SCENE CONTROL
	// ===============================

	Edge_G: {
		label: "Edge Them",
		category: "SceneControl",
		actionType: "control",
		stageGroup: "edging",
		stageLevel: 0,
		giver: "player",
		receiver: "npc",
		subjectParts: ["hand"],
		objectParts: ["genitals"],
		canTakeVirginity: false,
		skillsRequired: { control: 2 },
		baseExcitement: { subject: 2, object: 15 },
		preferenceTags: ["Edging_R"],
		inclinationTags: ["domination", "control"],
		togglable: false
	},

	// ===============================
	// 🔸 ORGASM ACTIONS
	// ===============================

	Player_Cum_Anal_Inside: {
		label: "Cum Deep In Their Ass",
		category: "Orgasm",
		actionType: "orgasm",
		stageLevel: 0,
		isCumming: true,
		giver: "player",
		receiver: "npc",
		subjectParts: ["penis"],
		objectParts: ["anus"],
		orgasmTags: ["anal_internal", "penetration"],
		preferenceTags: ["Anal_P", "Orgasm_Inside"],
		inclinationTags: ["dominance", "release"],
		togglable: false
	},

	Player_Cum_Vaginal_Inside: {
		label: "Cum Deep In Their Pussy",
		category: "Orgasm",
		actionType: "orgasm",
		stageLevel: 0,
		isCumming: true,
		giver: "player",
		receiver: "npc",
		subjectParts: ["penis"],
		objectParts: ["vagina"],
		orgasmTags: ["vaginal_internal", "penetration"],
		preferenceTags: ["Vaginal_P", "Orgasm_Inside"],
		inclinationTags: ["intimacy", "release"],
		togglable: false
	},

	Player_Cum_On_Face: {
		label: "Cum On Their Face",
		category: "Orgasm",
		actionType: "orgasm",
		stageLevel: 0,
		isCumming: true,
		giver: "player",
		receiver: "npc",
		subjectParts: ["penis"],
		objectParts: ["face"],
		orgasmTags: ["facial", "external"],
		preferenceTags: ["Oral_G", "Face_Cum"],
		inclinationTags: ["control", "messy"],
		togglable: false
	},

	Player_Cum_On_Body: {
		label: "Cum On Their Body",
		category: "Orgasm",
		actionType: "orgasm",
		stageLevel: 0,
		isCumming: true,
		giver: "player",
		receiver: "npc",
		subjectParts: ["penis"],
		objectParts: ["body"],
		orgasmTags: ["external", "visual"],
		preferenceTags: ["Visual_Cum"],
		inclinationTags: ["control", "visual"],
		togglable: false
	},

	Player_Cum_In_Mouth: {
		label: "Cum In Their Mouth",
		category: "Orgasm",
		actionType: "orgasm",
		stageLevel: 0,
		isCumming: true,
		giver: "player",
		receiver: "npc",
		subjectParts: ["penis"],
		objectParts: ["mouth"],
		orgasmTags: ["oral_internal", "control"],
		preferenceTags: ["Oral_R", "Creampie"],
		inclinationTags: ["dominance", "release"],
		togglable: false
	},

	// ===============================
	// 🔸 NPC ACTIONS
	// ===============================

	// NPC Oral Actions
	Oral_Penis_NPC_Tease: {
		label: "Tease Your Cock With Their Mouth",
		category: "Oral",
		actionType: "oral",
		stageGroup: "oral_penis_npc",
		stageLevel: 0,
		giver: "npc",
		receiver: "player",
		subjectParts: ["mouth"],
		objectParts: ["penis"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 5, object: 10 },
		preferenceTags: ["Oral_G", "Penis"],
		inclinationTags: ["tease", "service"],
		togglable: false
	},

	Oral_Penis_NPC_Suck: {
		label: "Suck Your Cock",
		category: "Oral",
		actionType: "oral",
		stageGroup: "oral_penis_npc",
		stageLevel: 1,
		giver: "npc",
		receiver: "player",
		subjectParts: ["mouth"],
		objectParts: ["penis"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 8, object: 15 },
		preferenceTags: ["Oral_G", "Penis"],
		inclinationTags: ["submission", "service"],
		togglable: false
	},

	Oral_Vagina_NPC: {
		label: "Eat You Out",
		category: "Oral",
		actionType: "oral",
		stageGroup: "oral_vagina_npc",
		stageLevel: 0,
		giver: "npc",
		receiver: "player",
		subjectParts: ["mouth"],
		objectParts: ["vagina"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 6, object: 16 },
		preferenceTags: ["Oral_G", "Vagina"],
		inclinationTags: ["service", "sensual"],
		togglable: false
	},

	FaceSit_NPC: {
		label: "Sit On Your Face",
		category: "Oral",
		actionType: "oral",
		stageGroup: "facesit_npc",
		stageLevel: 0,
		giver: "npc",
		receiver: "player",
		subjectParts: ["vagina"],
		objectParts: ["mouth"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 12, object: 8 },
		preferenceTags: ["Oral_G"],
		inclinationTags: ["domination", "exhibitionism"],
		togglable: false
	},

	// NPC Manual Actions
	Handjob_Penis_NPC_Tease: {
		label: "Stroke Your Cock Teasingly",
		giver: "npc",
		receiver: "player",
		subjectParts: ["hand"],
		objectParts: ["penis"],
		stageGroup: "Handjob_NPC",
		stageLevel: 0,
		baseExcitement: { subject: 5, object: 10 },
		inclinationTags: ["tease"],
		togglable: false
	},

	Handjob_Penis_NPC: {
		label: "Stroke Your Cock",
		category: "Manual",
		actionType: "handjob",
		stageGroup: "handjob_penis_npc",
		stageLevel: 1,
		giver: "npc",
		receiver: "player",
		subjectParts: ["hand"],
		objectParts: ["penis"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 6, object: 12 },
		preferenceTags: ["Penis", "Handplay"],
		inclinationTags: ["service", "vanilla"],
		togglable: false
	},

	Fingering_Vagina_NPC: {
		label: "Finger Your Pussy",
		category: "Manual",
		actionType: "fingering",
		stageGroup: "fingering_vagina_npc",
		stageLevel: 0,
		giver: "npc",
		receiver: "player",
		subjectParts: ["hand"],
		objectParts: ["vagina"],
		canTakeVirginity: true,
		skillsRequired: {},
		baseExcitement: { subject: 4, object: 14 },
		preferenceTags: ["FingeringVag_G"],
		inclinationTags: ["service", "sensual"],
		togglable: false
	},

	Handjob_Clit_NPC: {
		label: "Rub Your Clit",
		category: "Manual",
		actionType: "clitoral",
		stageGroup: "handjob_clit_npc",
		stageLevel: 0,
		giver: "npc",
		receiver: "player",
		subjectParts: ["hand"],
		objectParts: ["clitoris"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 4, object: 14 },
		preferenceTags: ["Clit_Rub"],
		inclinationTags: ["service", "direct"],
		togglable: false
	},

	BreastPlay_NPC: {
		label: "Touch Your Breasts",
		category: "Manual",
		actionType: "breast",
		stageGroup: "breastplay_npc",
		stageLevel: 0,
		giver: "npc",
		receiver: "player",
		subjectParts: ["hand"],
		objectParts: ["breasts"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 3, object: 6 },
		preferenceTags: ["BreastPlay_G"],
		inclinationTags: ["sensual", "vanilla"],
		togglable: false
	},

	// NPC Penetration Actions
	Anal_NPC_Penetrate: {
		label: "Penetrate Your Ass",
		category: "Anal",
		actionType: "anal",
		stageGroup: "anal_penis_npc",
		stageLevel: 0,
		giver: "npc",
		receiver: "player",
		subjectParts: ["penis"],
		objectParts: ["anus"],
		canTakeVirginity: true,
		skillsRequired: {},
		baseExcitement: { subject: 15, object: 18 },
		preferenceTags: ["Anal_G"],
		inclinationTags: ["penetration", "dominance"],
		togglable: false
	},

	Vaginal_NPC_Penetrate: {
		label: "Penetrate Your Pussy",
		category: "Vaginal",
		actionType: "vaginal",
		stageGroup: "vaginal_penis_npc",
		stageLevel: 0,
		giver: "npc",
		receiver: "player",
		subjectParts: ["penis"],
		objectParts: ["vagina"],
		canTakeVirginity: true,
		skillsRequired: {},
		baseExcitement: { subject: 18, object: 20 },
		preferenceTags: ["Vaginal_G"],
		inclinationTags: ["penetration", "vanilla"],
		togglable: false
	},

	// NPC Power Actions
	Dominate_NPC: {
		label: "Take Control of You",
		category: "Power",
		actionType: "dominance",
		stageGroup: "power_dynamic_npc",
		stageLevel: 0,
		giver: "npc",
		receiver: "player",
		subjectParts: ["body"],
		objectParts: ["mind"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 8, object: 5 },
		preferenceTags: ["Dominate"],
		inclinationTags: ["domination", "control"],
		togglable: false
	},

	Spank_NPC: {
		label: "Spank You",
		category: "Power",
		actionType: "impact",
		stageGroup: "spanking_npc",
		stageLevel: 0,
		giver: "npc",
		receiver: "player",
		subjectParts: ["hand"],
		objectParts: ["anus"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 6, object: 8 },
		preferenceTags: ["Spank_G"],
		inclinationTags: ["domination", "roughplay"],
		togglable: false
	},

	HairPulling_NPC: {
		label: "Pull Your Hair",
		category: "Power",
		actionType: "control",
		stageGroup: "hairpulling_npc",
		stageLevel: 0,
		giver: "npc",
		receiver: "player",
		subjectParts: ["hand"],
		objectParts: ["head"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 4, object: 6 },
		preferenceTags: ["HairPulling_G"],
		inclinationTags: ["domination", "roughplay"],
		togglable: false
	},

	// NPC Verbal Actions
	DirtyTalk_NPC: {
		label: "Talk Dirty to You",
		category: "Verbal",
		actionType: "verbal",
		stageGroup: "dirtytalk_npc",
		stageLevel: 0,
		giver: "npc",
		receiver: "player",
		subjectParts: ["mouth"],
		objectParts: ["ears"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 4, object: 6 },
		preferenceTags: ["DirtyTalk_G"],
		inclinationTags: ["verbal", "domination"],
		togglable: false
	},

	Praise_NPC: {
		label: "Praise You",
		category: "Verbal",
		actionType: "verbal",
		stageGroup: "praise_npc",
		stageLevel: 0,
		giver: "npc",
		receiver: "player",
		subjectParts: ["mouth"],
		objectParts: ["ears"],
		canTakeVirginity: false,
		skillsRequired: {},
		baseExcitement: { subject: 3, object: 8 },
		preferenceTags: ["Praise_G"],
		inclinationTags: ["praise", "vanilla"],
		togglable: false
		},

		// Missing NPC Manual Action
		NipplePlay_NPC: {
				label: "Play With Your Nipples",
				category: "Manual",
				actionType: "nipple",
				stageGroup: "nippleplay_npc",
				stageLevel: 0,
				giver: "npc",
				receiver: "player",
				subjectParts: ["hand"],
				objectParts: ["breasts"],
				canTakeVirginity: false,
				skillsRequired: {},
				baseExcitement: { subject: 4, object: 8 },
				preferenceTags: ["NipplePlay_G"],
				inclinationTags: ["sensual", "vanilla"],
				togglable: false
		},

		// Generic Orgasm Acts
		Orgasm_Penis_Internal: {
			label: "Cum Inside Them",
			category: "Orgasm",
			actionType: "orgasm",
			stageLevel: 0,
			isCumming: true,
			giver: "player",
			receiver: "npc",
			subjectParts: ["penis"],
			objectParts: ["vagina"],
			orgasmTags: ["internal"],
			preferenceTags: ["Orgasm_Inside"],
			inclinationTags: ["release"],
			togglable: false
		},

		Orgasm_Penis_External: {
			label: "Cum On Them",
			category: "Orgasm",
			actionType: "orgasm",
			stageLevel: 0,
			isCumming: true,
			giver: "player",
			receiver: "npc",
			subjectParts: ["penis"],
			objectParts: ["body"],
			orgasmTags: ["external"],
			preferenceTags: ["Visual_Cum"],
			inclinationTags: ["release"],
			togglable: false
		},

		Orgasm_Vagina_Solo: {
			label: "Solo Orgasm",
			category: "Orgasm",
			actionType: "orgasm",
			stageLevel: 0,
			isCumming: true,
			giver: "player",
			receiver: "player",
			subjectParts: ["vagina"],
			objectParts: ["body"],
			orgasmTags: ["solo"],
			preferenceTags: [],
			inclinationTags: ["release"],
			togglable: false
		},

		// Receiving action aliases
		Oral_Vagina_R: {
			label: "Have Your Pussy Licked",
			category: "Oral",
			actionType: "oral",
			stageGroup: "oral_vagina_npc",
			stageLevel: 0,
			giver: "npc",
			receiver: "player",
			subjectParts: ["mouth"],
			objectParts: ["vagina"],
			canTakeVirginity: false,
			skillsRequired: {},
			baseExcitement: { subject: 6, object: 16 },
			preferenceTags: ["Oral_G", "Vagina"],
			inclinationTags: ["service", "sensual"],
			togglable: false
		},

		Oral_Penis_R: {
			label: "Receive Oral On Your Cock",
			category: "Oral",
			actionType: "oral",
			stageGroup: "oral_penis_npc",
			stageLevel: 1,
			giver: "npc",
			receiver: "player",
			subjectParts: ["mouth"],
			objectParts: ["penis"],
			canTakeVirginity: false,
			skillsRequired: {},
			baseExcitement: { subject: 8, object: 15 },
			preferenceTags: ["Oral_G", "Penis"],
			inclinationTags: ["submission", "service"],
			togglable: false
		},

		Deepthroat_R: {
			label: "Get Deepthroated",
			category: "Oral",
			actionType: "oral",
			stageGroup: "oral_penis_npc",
			stageLevel: 2,
			giver: "npc",
			receiver: "player",
			subjectParts: ["mouth"],
			objectParts: ["penis"],
			canTakeVirginity: false,
			skillsRequired: { oral: 3 },
			baseExcitement: { subject: 8, object: 20 },
			preferenceTags: ["Oral_G", "Penis", "Throatplay"],
			inclinationTags: ["submission", "service"],
			togglable: false
		},

		Handjob_Penis_R: {
			label: "Get a Handjob",
			category: "Manual",
			actionType: "handjob",
			stageGroup: "handjob_penis_npc",
			stageLevel: 1,
			giver: "npc",
			receiver: "player",
			subjectParts: ["hand"],
			objectParts: ["penis"],
			canTakeVirginity: false,
			skillsRequired: {},
			baseExcitement: { subject: 6, object: 12 },
			preferenceTags: ["Penis", "Handplay"],
			inclinationTags: ["service", "vanilla"],
			togglable: false
		},

		Handjob_Clit_R: {
			label: "Clit Rub",
			category: "Manual",
			actionType: "clitoral",
			stageGroup: "handjob_clit_npc",
			stageLevel: 0,
			giver: "npc",
			receiver: "player",
			subjectParts: ["hand"],
			objectParts: ["clitoris"],
			canTakeVirginity: false,
			skillsRequired: {},
			baseExcitement: { subject: 4, object: 14 },
			preferenceTags: ["Clit_Rub"],
			inclinationTags: ["service", "direct"],
			togglable: false
		},

		Fingering_Vagina_R: {
			label: "Get Fingered",
			category: "Manual",
			actionType: "fingering",
			stageGroup: "fingering_vagina_npc",
			stageLevel: 0,
			giver: "npc",
			receiver: "player",
			subjectParts: ["hand"],
			objectParts: ["vagina"],
			canTakeVirginity: true,
			skillsRequired: {},
			baseExcitement: { subject: 4, object: 14 },
			preferenceTags: ["FingeringVag_G"],
			inclinationTags: ["service", "sensual"],
			togglable: false
		},

		Fingering_Anal_R: {
			label: "Get Fingered In The Ass",
			category: "Manual",
			actionType: "fingering",
			stageGroup: "fingering_anal_npc",
			stageLevel: 0,
			giver: "npc",
			receiver: "player",
			subjectParts: ["hand"],
			objectParts: ["anus"],
			canTakeVirginity: true,
			skillsRequired: {},
			baseExcitement: { subject: 4, object: 10 },
			preferenceTags: ["FingeringAnal_R"],
			inclinationTags: ["service", "submission"],
			togglable: false
		},

		BreastPlay_R: {
			label: "Have Your Breasts Touched",
			category: "Manual",
			actionType: "breast",
			stageGroup: "breastplay_npc",
			stageLevel: 0,
			giver: "npc",
			receiver: "player",
			subjectParts: ["hand"],
			objectParts: ["breasts"],
			canTakeVirginity: false,
			skillsRequired: {},
			baseExcitement: { subject: 3, object: 6 },
			preferenceTags: ["BreastPlay_G"],
			inclinationTags: ["sensual", "vanilla"],
			togglable: false
		},

		NipplePlay_R: {
			label: "Have Your Nipples Played With",
			category: "Manual",
			actionType: "nipple",
			stageGroup: "nippleplay_npc",
			stageLevel: 0,
			giver: "npc",
			receiver: "player",
			subjectParts: ["hand"],
			objectParts: ["breasts"],
			canTakeVirginity: false,
			skillsRequired: {},
			baseExcitement: { subject: 4, object: 8 },
			preferenceTags: ["NipplePlay_G"],
			inclinationTags: ["sensual", "vanilla"],
			togglable: false
		},

		FaceSit_R: {
			label: "Be Sat On",
			category: "Oral",
			actionType: "oral",
			stageGroup: "facesit_npc",
			stageLevel: 0,
			giver: "npc",
			receiver: "player",
			subjectParts: ["vagina"],
			objectParts: ["mouth"],
			canTakeVirginity: false,
			skillsRequired: {},
			baseExcitement: { subject: 12, object: 8 },
			preferenceTags: ["Oral_G"],
			inclinationTags: ["domination", "exhibitionism"],
			togglable: false
		},

		Spank_R: {
			label: "Get Spanked",
			category: "Power",
			actionType: "impact",
			stageGroup: "spanking_npc",
			stageLevel: 0,
			giver: "npc",
			receiver: "player",
			subjectParts: ["hand"],
			objectParts: ["anus"],
			canTakeVirginity: false,
			skillsRequired: {},
			baseExcitement: { subject: 6, object: 8 },
			preferenceTags: ["Spank_G"],
			inclinationTags: ["domination", "roughplay"],
			togglable: false
		}

};
