// ============================================================================
// 18-skills — Skill XP/specialization system + duplicate `$` helper.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

function gainSkillXP(e, t, n, a = "unknown") {
  if (!e.skills || !e.skills[t]) return void console.warn(`Skill ${t} not found for ${e.name}`);
  const o = e.skills[t], i = o.level;
  for (o.xp += n; o.xp >= o.maxXp && o.level < 10; ) o.xp -= o.maxXp, o.level++, o.maxXp = Math.floor(1.5 * o.maxXp), showNotification(`${e.name} leveled up ${t} skill to level ${o.level}! \u{1F389}`), Ka(e, t, o.level), console.log(`[Skills] ${e.name} leveled up ${t}: ${i} \u2192 ${o.level} (source: ${a})`);
  o.level >= 10 && (o.level = 10, o.xp = 0), debouncedSave();
}
function Ka(e, t, n) {
  e.specializations || (e.specializations = []);
  const a = { technical: { 3: "Code Wizard", 5: "System Architect", 7: "Tech Lead", 10: "Engineering Master" }, creative: { 3: "Creative Thinker", 5: "Design Expert", 7: "Art Director", 10: "Creative Genius" }, social: { 3: "People Person", 5: "Charisma Expert", 7: "Influencer", 10: "Master Communicator" }, management: { 3: "Team Coordinator", 5: "Project Manager", 7: "Department Head", 10: "Strategic Leader" }, intimate: { 3: "Experienced Lover", 5: "Passionate Partner", 7: "Intimate Expert", 10: "Master of Seduction" } };
  if (a[t] && a[t][n]) {
    const o = a[t][n];
    e.specializations.includes(o) || (e.specializations.push(o), showNotification(`${e.name} earned: ${o}! \u2B50`));
  }
}
function Ja(e) {
  return { work_hour: 5, complete_task: 15, solve_problem: 25, innovation: 50, chat_message: 2, deep_conversation: 10, successful_negotiation: 30, network_event: 20, create_content: 15, brainstorm: 10, present_idea: 25, campaign_launch: 50, delegate_task: 10, resolve_conflict: 30, strategic_decision: 40, team_success: 50, flirt: 5, kiss: 10, intimate_moment: 20, deep_connection: 30 }[e] || 0;
}
function Qa(e, t) {
  if (!e.skills || !e.skills[t]) return 0;
  const n = e.skills[t];
  return 5 * ("number" == typeof n ? n : n.level || 0);
}
function Za(e) {
  if (!e.skills) return null;
  let t = { name: "none", level: 0 };
  for (const [n, a] of Object.entries(e.skills)) {
    const e2 = "number" == typeof a ? a : a.level || 0;
    e2 > t.level && (t = { name: n, level: e2 });
  }
  return t;
}
function ei(e, t, n) {
  const a = t.toLowerCase(), o = n.toLowerCase();
  if (gainSkillXP(e, "social", 2, "chat_message"), (a.length > 100 || o.length > 150) && gainSkillXP(e, "social", 5, "deep_conversation"), ["beautiful", "gorgeous", "sexy", "attractive", "hot", "cute", "stunning"].some((e2) => a.includes(e2) || o.includes(e2)) && e.stats.affection > 40 && gainSkillXP(e, "intimate", 5, "flirt"), ["project", "task", "deadline", "client", "meeting", "report"].some((e2) => a.includes(e2) || o.includes(e2))) {
    const t2 = Za(e);
    "none" !== t2.name && "intimate" !== t2.name && gainSkillXP(e, t2.name, 3, "work_discussion");
  }
}
function $(e) {
  return document.getElementById(e);
}
