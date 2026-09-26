// ============================================================================
// 11-accountants — Accountants: trait config Tn, candidate pool, hiring/onboarding, PayrollMinigames, payroll coverage logic.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

const Tn = { forensic: { label: "Forensic Eye", emoji: "\u{1F50D}", tone: "buff", desc: "Fraud pre-flagged in audits, at any level" }, networked: { label: "Networked", emoji: "\u{1F91D}", tone: "buff", desc: "\u221210% interest on new loans, at any level" }, spreadsheet: { label: "Spreadsheet Whisperer", emoji: "\u{1F4CA}", tone: "buff", desc: "+4 processing capacity" }, calm: { label: "Calm Under Audit", emoji: "\u{1F9D8}", tone: "buff", desc: "Halves payroll error penalties, at any level" }, rushes: { label: "Rushes Audits", emoji: "\u23E9", tone: "debuff", desc: "Never halves error penalties, even at L2+" }, expensive: { label: "Expensive Taste", emoji: "\u{1F48E}", tone: "debuff", desc: "Always asks 15\u201330% above market" }, hoarder: { label: "Paper Hoarder", emoji: "\u{1F5C4}\uFE0F", tone: "debuff", desc: "\u22124 processing capacity" }, bythebook: { label: "By-The-Book", emoji: "\u{1F4CF}", tone: "debuff", desc: "Doesn't contribute the payroll cost discount" } };
function $n(e) {
  const t = 4 + 4 * Sn(e), n = "spreadsheet" === e.accountantTrait ? 4 : "hoarder" === e.accountantTrait ? -4 : 0;
  return Math.max(4, t + n);
}
function Cn(e, t) {
  const n = e.accountantTrait;
  return (2 !== t || "rushes" !== n) && ((3 !== t || "bythebook" !== n) && (Sn(e) >= t || 2 === t && "calm" === n || 4 === t && "networked" === n || 5 === t && "forensic" === n));
}
function En(e) {
  const t = gameState.products?.find((t2) => e.productId && t2.id === e.productId || e.productManaged && t2.name === e.productManaged);
  return t?.locationId || e.locationId || "garage";
}
function Mn(e) {
  return kn().some((t) => Cn(t, e));
}
function Pn() {
  return Math.min(0.1, 0.02 * kn().filter((e) => Cn(e, 3)).length);
}
function Ln() {
  const e = gameState.employees.filter((e2) => "accountant" === e2.specialization && "Accountant" !== e2.position);
  0 !== e.length && (e.forEach((e2) => {
    delete e2.specialization, delete e2.accountant;
  }), showNotification(`\u{1F9EE} Accounting restructure: the train-on-the-job program was discontinued. ${e.map((e2) => e2.name).join(", ")} returned to their old role${e.length > 1 ? "s" : ""}. Hire dedicated accountants from the Payroll tab \u2014 coverage may have changed!`, "warning"));
}
function Nn() {
  Ln();
  const e = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus && (e2.career?.level || 1) < 7), t = {}, n = [];
  e.forEach((e2) => {
    const a = En(e2);
    t[a] || (t[a] = { total: 0, capacity: 0, accountants: [], employees: [] }), "accountant" === e2.specialization ? (t[a].accountants.push(e2), t[a].capacity += $n(e2)) : (t[a].total++, t[a].employees.push(e2));
  });
  for (const e2 in t) {
    const a = t[e2];
    a.covered = Math.min(a.total, a.capacity), a.total > a.capacity && n.push(...a.employees.slice(a.capacity));
  }
  return { byLocation: t, uncovered: n };
}
function _n() {
  const e = (gameState.locations || []).filter((e2) => e2.owned).length + 2 * (gameState.prestigeLevel || 0), t = Math.max(1, Math.min(5, 1 + Math.floor(e / 2))), n = 1 + Math.floor(Math.random() * t);
  if (n <= Math.ceil(t / 2)) return n;
  const a = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus && e2.career), o = a.length ? a.reduce((e2, t2) => e2 + (t2.career.salary || 1e5) / Math.max(1, getMarketRate(t2)), 0) / a.length : 1, i = Math.max(0.2, Math.min(1, o - 0.25));
  return Math.random() < i ? n : Math.max(1, Math.ceil(n / 2));
}
function Rn() {
  const e = (vc(null) || [])[0];
  if (!e) return null;
  e.position = "Accountant", e.productId = null;
  const t = _n(), n = gameState.hierarchyLevels?.[t] || {};
  e.career.level = t, e.career.title = n.title || "Staff";
  const a = Object.keys(Tn);
  e.accountantTrait = a[Math.floor(Math.random() * a.length)];
  const o = (gameState.locations || []).some((e2) => e2.owned && e2.id === gameState.activeLocationId) ? gameState.activeLocationId : "garage", i = getMarketRate({ ...e, locationId: o }, t);
  let s = 0.85 + 0.3 * Math.random();
  return "expensive" === e.accountantTrait && (s = 1.15 + 0.15 * Math.random()), e.salaryAsk = Math.floor(i * s), e.askDept = o, e;
}
function Dn() {
  gameState.payroll || (gameState.payroll = {}), Array.isArray(gameState.payroll.accountantPool) || (gameState.payroll.accountantPool = []);
  const e = gameState.time?.currentTime || Date.now(), t = gameState.payroll.accountantPool;
  if (gameState.payroll.acctPoolNextRefresh || (gameState.payroll.acctPoolNextRefresh = e + 6048e5), 0 === t.length) for (; t.length < 3; ) {
    const e2 = Rn();
    if (!e2) break;
    t.push(e2);
  }
  else for (let n = 0; e >= gameState.payroll.acctPoolNextRefresh && n < 10; n++) {
    gameState.payroll.acctPoolNextRefresh += 6048e5;
    const e2 = Rn();
    if (!e2) break;
    t.length < 3 || t.shift(), t.push(e2);
  }
}
function passAccountantCandidate(e) {
  gameState.payroll?.accountantPool && (gameState.payroll.accountantPool = gameState.payroll.accountantPool.filter((t) => t.id !== e), closeLoanProductModal(), updatePayrollTab());
}
async function recruitNewAccountantPool() {
  const e = void 0 !== StoryEngine && StoryEngine.calculateScaledCost ? StoryEngine.calculateScaledCost(5e3, "medium") : 5e3;
  gameState.cash < e ? showNotification(`\u274C Recruitment drive costs $${wu(e)}.`, "error") : await Ev(`Commission a recruitment drive?

Cost: $${wu(e)}
All 3 candidate slots are replaced immediately.`, "Recruit New Pool", { type: "info", confirmText: "Recruit" }) && (gameState.cash -= e, gameState.payroll.accountantPool = [], gameState.payroll.acctPoolNextRefresh = (gameState.time?.currentTime || Date.now()) + 6048e5, Dn(), showNotification("\u{1F9EE} Fresh candidates sourced. The staffing agency sends its regards.", "success"), updatePayrollTab());
}
function openAccountantProfile(e) {
  Dn();
  const t = gameState.payroll.accountantPool.find((t2) => t2.id === e);
  if (!t) return;
  const n = Tn[t.accountantTrait] || { label: "Unremarkable", emoji: "\u2022", tone: "mixed", desc: "" }, a = (gameState.locations || []).filter((e2) => e2.owned), o = a.some((e2) => e2.id === t.askDept) ? t.askDept : a[0]?.id || "garage", i = gameState.hierarchyLevels?.[t.career.level] || {}, s = (t.personalityTraits || []).slice(0, 3).join(", "), r = (t.hobbies || []).slice(0, 2).join(" and "), l = () => {
    const e2 = document.getElementById("acctProfDept")?.value || o, n2 = getMarketRate({ ...t, locationId: e2 }, t.career.level), a2 = t.salaryAsk / Math.max(1, n2), i2 = a2 > 1.05 ? '<span class="text-neg">\u25B2 above market</span>' : a2 >= 0.95 ? '<span class="text-dim">\u25C6 at market</span>' : '<span class="text-pos">\u25BC below market</span>', s2 = document.getElementById("acctProfMarket");
    s2 && (s2.innerHTML = `Market: <span class="num">$${wu(n2)}</span>/yr \xB7 ${i2}`);
  };
  wn(` <div class="neg-head"> <div class="neg-id"> <div class="neg-name">${yl(t)} <span class="pill">Accountant \xB7 Lv ${t.career.level}</span></div> <div class="neg-meta">${i.title || "Staff"} candidate</div> </div> <button class="btn btn--aj neg-x" onclick="closeLoanProductModal()">\u2715</button> </div> <div class="neg-head"> <div class="avatar-sm init" style="--cr:${i.color || "var(--d)"}">${(t.name || "?").charAt(0).toUpperCase()}</div> <div class="neg-id"> <div class="fs-sm">${(t.gender || "").charAt(0).toUpperCase() + (t.gender || "").slice(1)} \xB7 ${fl(t.ethnicity || t.race)} \xB7 ${t.age}</div> <div class="fs-xs text-dim">${s}${r ? ". Into " + r + "." : ""}</div> </div> </div> <div class="tile"> <div class="k">Capacity</div> <div class="big num">Handles ${$n(t)} employees</div> <div class="tile-sub">Assignment: <span id="acctProfDeptLabel">unassigned \u2014 choose below</span></div> </div> <div> <span class="chip ${"buff" === n.tone ? "chip--buff" : "chip--debuff"}"><span>${n.emoji}</span><span class="lbl">${n.label}</span></span> <div class="fs-xs text-dim mt-1">${n.desc}</div> </div> <div class="neg-preview"> Asking: <span class="num fw-600">$${wu(t.salaryAsk)}</span>/yr<br> <span class="fs-xs" id="acctProfMarket"></span> </div> <label class="neg-field"><span class="t">Department</span> <select id="acctProfDept" class="neg-select">${a.map((e2) => `<option value="${e2.id}" ${e2.id === o ? "selected" : ""}>${e2.name}</option>`).join("")}</select> </label> <div class="neg-actions"> <button class="btn btn--be" onclick="hireAccountantCandidate('${t.id}')">Hire \u2014 $${wu(t.salaryAsk)}/yr</button> <button class="btn btn--aj" onclick="passAccountantCandidate('${t.id}')">Pass</button> </div>`, (e2) => {
    const t2 = e2.querySelector("#acctProfDept"), n2 = () => {
      l();
      const e3 = document.getElementById("acctProfDeptLabel"), n3 = (gameState.locations || []).find((e4) => e4.id === t2?.value);
      e3 && n3 && (e3.textContent = n3.name);
    };
    t2 && t2.addEventListener("change", n2), n2();
  });
}
function hireAccountantCandidate(e) {
  Dn();
  const t = gameState.payroll.accountantPool.find((t2) => t2.id === e);
  if (!t) return;
  const n = document.getElementById("acctProfDept")?.value || t.askDept || "garage";
  t.locationId = n, t.location = n;
  const a = 4 * Math.floor(getScaledSalary(t.salaryAsk) / 52);
  gameState.cash < a ? showNotification(`\u274C Signing costs $${wu(a)} (4 weeks up front).`, "error") : (gameState.cash -= a, gameState.payroll.accountantPool = gameState.payroll.accountantPool.filter((t2) => t2.id !== e), t.position = "Accountant", t.specialization = "accountant", t.accountant = { assignedLocationId: n }, t.hired = true, t.onboarding = true, t.bioComplete = false, t.employmentStatus = "onboarding", t.hireDate = Date.now(), t.career.salary = t.salaryAsk || getMarketRate(t), gameState.usedEmployeeNames || (gameState.usedEmployeeNames = /* @__PURE__ */ new Set()), gameState.usedEmployeeNames.add && gameState.usedEmployeeNames.add(t.name), gameState.onboarding || (gameState.onboarding = []), gameState.onboarding.push(t), closeLoanProductModal(), showNotification(`\u{1F9EE} ${t.name} is onboarding as Accountant \u2014 building their profile\u2026`, "info"), updatePayrollTab(), "function" == typeof updatePeopleTab && updatePeopleTab(), finalizeAccountantOnboarding(t).catch((e2) => {
    console.error("[Accountant] Onboarding failed:", e2);
  }));
}
async function finalizeAccountantOnboarding(t) {
  const g = t.gender || "female", article = "male" === g || "transMan" === g ? "male" : "female";
  try {
    const prompt = `
  Create an in-world, adult ${article} NPC profile (no meta-talk) for: ${t.name}, age ${t.age}.
  Gender: ${g}.
  Role: Accountant (handles company payroll). Department: ${(gameState.locations || []).find((e) => e.id === t.locationId)?.name || t.locationId}.
  Personality traits: ${(t.personalityTraits || []).join(", ")}. Key trait: ${t.keyTrait || ""}.
  Hobbies: ${(t.hobbies || []).join(", ")}. Kink preferences: ${(t.kinks || []).join(", ")}.

  Respond as a compact JSON object with these keys ONLY:
  {
  "name": {"first":"", "last":""},
  "age": <number>,
  "gender": "${g}",
  "bio": "<2-3 sentence personality/background, world-grounded, references their work as an accountant>",
  "appearance": {
  "heightBuild": "",
  "hair": {"color":"","style":"","length":""},
  "eyes": {"color":"","shape":""},
  "skinTone": "",
  "bodyShape": "",
  "breastSize": "",
  "buttSize": "",
  "fashion": ""
  },
  "personalityTraits": [${(t.personalityTraits || []).map((e) => `"${e}"`).join(", ")}],
  "kinks": [${(t.kinks || []).map((e) => `"${e}"`).join(", ")}]
  }
  `, raw = "function" == typeof generateText ? await queuedGenerateText(prompt, {}, `Accountant Profile - ${t.name}`) : `{"name":{"first":"${t.name.split(" ")[0]}","last":"${t.name.split(" ")[1] || ""}"},"age":${t.age},"gender":"${g}","bio":"A meticulous accountant who keeps the company's books airtight and its auditors bored.","appearance":{"heightBuild":"average","hair":{"color":"brown","style":"neat","length":"medium"},"eyes":{"color":"brown","shape":"almond"},"skinTone":"medium","bodyShape":"average","breastSize":"medium","buttSize":"average","fashion":"business casual"},"personalityTraits":["${(t.personalityTraits || []).join('","')}"],"kinks":["${(t.kinks || []).join('","')}"]}`;
    let o;
    try {
      o = JSON.parse(raw);
    } catch {
      o = null;
    }
    if (o && o.name ? (t.name = `${o.name.first} ${o.name.last}`.trim() || t.name, t.age = o.age ?? t.age, t.bio = o.bio || "Keeps the ledgers clean and the audits short.", t.physical = ni(g, t.race || "human", t.ethnicity || null), (() => {
      const e = o.appearance || {};
      e.heightBuild && (t.physical.heightBuild = e.heightBuild), e.hair && (t.physical.hair = { ...t.physical.hair, ...e.hair }), e.eyes && (t.physical.eyes = { ...t.physical.eyes, ...e.eyes }), e.skinTone && t.physical.skin && (t.physical.skin.tone = e.skinTone), e.bodyShape && t.physical.body && (t.physical.body.shape = e.bodyShape), (e.breastSize || e.chestSize) && t.physical.body && (t.physical.body.chestSize = e.chestSize || e.breastSize, t.physical.body.breastSize = e.chestSize || e.breastSize), e.buttSize && t.physical.body && (t.physical.body.buttSize = e.buttSize), e.fashion && (t.physical.fashion = e.fashion), t.personalityTraits = o.personalityTraits || t.personalityTraits, t.kinks = o.kinks || t.kinks;
    })()) : (t.bio = "A meticulous accountant who keeps the company's books airtight and its auditors bored.", t.physical = ni(g, t.race || "human", t.ethnicity || null)), "function" == typeof generateImage && t.physical) try {
      const e = `Professional portrait photo: ${t.physical.shortDescription || ""}. ${t.physical.face?.full || ""}. ${t.physical.fashion || "business casual"} style outfit. Office setting, soft professional lighting, friendly expression, high quality`, n = await queuedGenerateImage(applyImageStyle(e), `Profile image for new accountant ${t.name}`);
      n && (t.profileImage = n, t.photos || (t.photos = []), t.photos.push({ url: n, source: "profile", caption: "Initial profile picture", timestamp: Date.now() }));
    } catch (u2) {
      console.warn("[Accountant] Profile image generation failed:", u2);
    }
  } catch (u2) {
    console.error("[Accountant] Profile generation error:", u2), t.physical || (t.physical = ni(g, t.race || "human", t.ethnicity || null)), t.bio || (t.bio = "A meticulous accountant who keeps the company's books airtight.");
  }
  t.onboarding = false, t.bioComplete = true, t.employmentStatus = "active", gameState.onboarding = (gameState.onboarding || []).filter((e) => e.id !== t.id), t.hireDate || (t.hireDate = Date.now()), "function" == typeof initializeEmployeeSocialData && (t.socialData || initializeEmployeeSocialData(t)), gameState.employees.some((e) => e.id === t.id) || gameState.employees.push(t), "function" == typeof updateCompanyAwareness && updateCompanyAwareness(), "function" == typeof generateRandomRelationships && generateRandomRelationships(t.id), "function" == typeof logCompanyEvent && logCompanyEvent({ type: "hire", involvedEmployees: [t.id], location: t.locationId, description: `${t.name} joined as Accountant`, sentiment: "positive", importance: 7 }), "function" == typeof generateFirstEmployeePost && generateFirstEmployeePost(t).catch((e) => {
    console.error("Accountant welcome post failed:", e);
  }), showNotification(`\u{1F9EE} ${t.name} joined as Accountant. The ledgers tremble.`, "success"), "function" == typeof saveGame && saveGame(false), updatePayrollTab(), "function" == typeof updatePeopleTab && updatePeopleTab();
}
function reassignAccountant(e) {
  const t = gameState.employees.find((t2) => t2.id === e);
  if (!t || "accountant" !== t.specialization) return;
  const n = (gameState.locations || []).filter((e2) => e2.owned);
  wn(` <div class="neg-head"> <div class="neg-id"> <div class="neg-name">\u2194 Reassign ${t.name}</div> <div class="neg-meta">Move this accountant to a different department.</div> </div> <button class="btn btn--aj neg-x" onclick="closeLoanProductModal()">\u2715</button> </div> <div class="scroll-y" style="max-height:50vh"> ${n.map((n2) => `<div class="subpanel row-between"><span class="fw-600">${n2.name}</span><button class="btn btn--outline" ${n2.id === t.locationId ? "disabled" : ""} onclick="assignAccountantTo('${e}','${n2.id}')">${n2.id === t.locationId ? "Current" : "Assign"}</button></div>`).join("")} </div>`);
}
function assignAccountantTo(e, t) {
  const n = gameState.employees.find((t2) => t2.id === e);
  n && "accountant" === n.specialization && (n.locationId = t, n.location = t, n.accountant && (n.accountant.assignedLocationId = t), closeLoanProductModal(), showNotification(`\u{1F9EE} ${n.name} reassigned.`, "success"), updatePayrollTab());
}
const PayrollMinigames = { _queue: [], _results: [], _onDone: null, EVENTS: ["checkrun", "audit", "crunch", "signature"], start(e, t) {
  const n = e > 8 ? 3 : 2, a = gameState.payroll?.lastRunLineup || [];
  let o = [...this.EVENTS].sort(() => Math.random() - 0.5).slice(0, n);
  JSON.stringify(o) === JSON.stringify(a) && o.push(o.shift()), gameState.payroll && (gameState.payroll.lastRunLineup = o), this._queue = [...o], this._results = [], this._onDone = t, this._next();
}, _next() {
  const e = this._queue.shift();
  if (!e) {
    const e2 = this._results, t = e2.every(Boolean) ? "clean" : e2.some(Boolean) ? "partial" : "failed", n = this._onDone;
    return this._onDone = null, void (n && n(t));
  }
  "checkrun" === e ? StoryMinigames.launchMinigame("precision", { title: "Check Run", themeText: "Stamp each paycheck while it's over the ink pad.", difficulty: "medium" }, (e2) => {
    this._results.push(!(!e2 || !e2.success)), this._next();
  }) : "signature" === e ? StoryMinigames.launchMinigame("intensity", { title: "Signature Sprint", themeText: "It is 4:54 PM on a Friday. Sign everything.", difficulty: "medium" }, (e2) => {
    this._results.push(!(!e2 || !e2.success)), this._next();
  }) : "audit" === e ? this._runAudit() : this._runCrunch();
}, _overlay(e) {
  const t = document.getElementById("payrollMgOverlay");
  t && t.remove();
  const n = document.createElement("div");
  return n.id = "payrollMgOverlay", n.className = "fuoc-ui neg-overlay", n.innerHTML = `<div class="neg-modal">${e}</div>`, document.body.appendChild(n), n;
}, _closeOverlay() {
  const e = document.getElementById("payrollMgOverlay");
  e && e.remove();
}, _runAudit() {
  const e = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus), t = () => e[Math.floor(Math.random() * e.length)]?.name || "An employee", n = [{ text: `${t()} \u2014 team lunch, $42`, fraud: false }, { text: `${t()} \u2014 client coffee, $18`, fraud: false }, { text: `${t()} \u2014 ergonomic chair (the old one 'left'), $230`, fraud: false }, { text: `${t()} \u2014 conference parking, $35`, fraud: false }, { text: `${t()} \u2014 'client dinner', Saturday, 2:00 AM, $480`, fraud: true }, { text: `${t()} \u2014 timesheet: 9 workdays this week`, fraud: true }, { text: `${t()} \u2014 printer ink, $1,250`, fraud: true }, { text: `${t()} \u2014 mileage: office to office, 600 mi`, fraud: true }].sort(() => Math.random() - 0.5).slice(0, 5), a = Mn(5);
  let o = 0, i = 0;
  const s = this._overlay(` <div class="neg-head"><div class="neg-id"><div class="neg-name">\u{1F9FE} Expense Audit</div><div class="neg-meta">Approve the legitimate. Flag the creative.${a ? " (Your L5 accountant pre-flagged the suspicious ones.)" : ""}</div></div></div> <div id="mgSlip" class="neg-quote"></div> <div class="neg-preview" id="mgAuditScore">Slip 1 of ${n.length}</div> <div class="neg-actions"> <button class="btn btn--be" id="mgApprove">\u2713 Approve</button> <button class="btn btn--outline" id="mgFlag">\u{1F6A9} Flag</button> </div>`), r = s.querySelector("#mgSlip"), l = s.querySelector("#mgAuditScore"), c = () => {
    const e2 = n[o];
    r.innerHTML = `${e2.fraud && a ? '<span class="text-neg">\u25CF</span> ' : ""}${e2.text}`, l.textContent = `Slip ${o + 1} of ${n.length} \xB7 ${i} correct`;
  }, d = (e2) => {
    const t2 = n[o];
    e2 !== t2.fraud ? i++ : t2.fraud && (gameState.cash = Math.max(0, gameState.cash - Math.max(500, Math.floor(0.01 * getWeeklyPayroll())))), o++, o >= n.length ? (this._closeOverlay(), this._results.push(i >= n.length - 1), this._next()) : c();
  };
  s.querySelector("#mgApprove").onclick = () => d(false), s.querySelector("#mgFlag").onclick = () => d(true), c();
}, _runCrunch() {
  const e = [], t = Math.floor(5 * Math.random());
  for (let n2 = 0; n2 < 5; n2++) {
    const a2 = 100 + Math.floor(900 * Math.random()), o2 = 100 + Math.floor(900 * Math.random()), i = 100 + Math.floor(900 * Math.random());
    let s = a2 + o2 + i;
    n2 === t && (s -= 10 + 10 * Math.floor(9 * Math.random())), e.push({ a: a2, b: o2, c: i, sum: s, wrong: n2 === t });
  }
  const n = this._overlay(` <div class="neg-head"><div class="neg-id"><div class="neg-name">\u{1F9EE} Number Crunch</div><div class="neg-meta">One total is wrong. It is, somehow, always in the company's favor. Tap it.</div></div></div> <div id="mgLedger">${e.map((e2, t2) => `<button class="subpanel row-between w-full num" data-row="${t2}" style="min-height:44px;cursor:pointer;border:1px solid var(--o);"><span>${e2.a} + ${e2.b} + ${e2.c}</span><span class="fw-600">= ${e2.sum}</span></button>`).join("")}</div> <div class="neg-preview" id="mgCrunchTimer">12s</div>`);
  let a = 12;
  const o = setInterval(() => {
    a--;
    const e2 = n.querySelector("#mgCrunchTimer");
    e2 && (e2.textContent = `${a}s`), a <= 0 && (clearInterval(o), this._closeOverlay(), this._results.push(false), this._next());
  }, 1e3);
  n.querySelectorAll("[data-row]").forEach((t2) => {
    t2.onclick = () => {
      clearInterval(o), this._closeOverlay(), this._results.push(e[parseInt(t2.dataset.row, 10)].wrong), this._next();
    };
  });
} };
function Bn() {
  if (dn()) return;
  const e = Nn().uncovered;
  0 !== e.length && void 0 !== StoryMinigames ? wn(` <div class="neg-head"> <div class="neg-id"> <div class="neg-name">\u{1F5C2}\uFE0F Friday Payroll Run</div> <div class="neg-meta">${e.length} employee${e.length > 1 ? "s" : ""} lack accountant coverage and need manual processing.</div> </div> </div> <div class="neg-preview">Run it yourself for a clean ledger (2% rebate), or wave it through and let the errors land where they land.</div> <div class="neg-actions"> <button class="btn btn--be" id="prRun">\u{1F579}\uFE0F Run Payroll</button> <button class="btn btn--aj" id="prSkip">Wave It Through</button> </div>`, (t) => {
    t.querySelector("#prRun").onclick = () => {
      closeLoanProductModal(), PayrollMinigames.start(e.length, (t2) => {
        processWeeklyPayroll(), Fn(t2, e);
      });
    }, t.querySelector("#prSkip").onclick = () => {
      closeLoanProductModal(), processWeeklyPayroll(), Fn("failed", e, true);
    };
  }) : processWeeklyPayroll();
}
function Fn(e, t, n = false) {
  if (gameState.payroll && (gameState.payroll.lastRunQuality = n ? "skipped" : e), "clean" === e) {
    const e2 = Math.floor(0.02 * (gameState.payroll?.totalPaidThisWeek || 0));
    e2 > 0 && (gameState.cash += e2, showNotification(`\u2728 Clean payroll run \u2014 $${wu(e2)} in processing efficiencies recovered.`, "success"));
  } else if ("failed" === e || n) {
    const e2 = Mn(2), a = Math.min(t.length, e2 ? 1 : 2), o = [...t].sort(() => Math.random() - 0.5).slice(0, a);
    o.forEach((t2) => {
      if (t2.stats || (t2.stats = {}), Math.random() < 0.5) t2.stats.trust = Math.max(0, (t2.stats.trust || 50) - (e2 ? 3 : 5)), qn(t2, { key: "payerror", emoji: "\u{1F9FE}", label: "Paycheck Error", tone: "debuff", durationDays: 7 }), Math.random() < 0.25 && sn([t2], "missed_payroll", 1);
      else {
        const n2 = Math.floor(getScaledSalary(t2.career?.salary || 1e5) / 52 / (e2 ? 4 : 2));
        gameState.cash = Math.max(0, gameState.cash - n2);
      }
    }), o.length > 0 && showNotification(`\u{1F9FE} Payroll errors hit ${o.length} paycheck${o.length > 1 ? "s" : ""}. HR apologizes 'for any inconvenience.'`, "warning");
  }
  updatePayrollTab();
}
