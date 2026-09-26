// ============================================================================
// 50-notifications — Notifications: showNotification, confirm/input/prompt dialogs + export chain.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

function showNotification(e, t = "success") {
  const n = { success: "#4caf50", error: "var(--l)", warning: "var(--dn)", info: "#2196f3" }, a = document.createElement("div");
  a.style.cssText = `position:fixed; bottom:20px; right:20px; background:${n[t] || n.success}; color:var(--b); padding:15px 20px; border-radius:8px; box-shadow:0 4px 15px var(--am); z-index:3000; max-width:300px; animation: slideIn 0.3s;`, a.textContent = e, document.body.appendChild(a), setTimeout(() => {
    a.style.animation = "fadeOut 0.3s", setTimeout(() => a.remove(), 300);
  }, 3e3);
}
function Cv(e, t = "Notice", n = "info") {
  return new Promise((a) => {
    const o = { info: { bg: "var(--j)", icon: "\u2139\uFE0F" }, warning: { bg: "var(--dn)", icon: "\u26A0\uFE0F" }, error: { bg: "var(--l)", icon: "\u274C" }, success: { bg: "var(--n)", icon: "\u2705" } }, i = o[n] || o.info, s = document.createElement("div");
    s.id = "elegantAlertOverlay", s.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--bp); z-index:100000; display:flex; justify-content:center; align-items:center; animation:fadeIn 0.2s;", s.innerHTML = ` <div style="background:linear-gradient(135deg, var(--ad) 0%, var(--w) 100%); border-radius:16px; padding:25px 30px; max-width:400px; width:90%; box-shadow:0 20px 60px var(--ab); border:1px solid ${i.bg}40; animation:slideIn 0.3s;"> <div style="display:flex; align-items:center; gap:12px; margin-bottom:15px;"> <span style="font-size:1.5rem;">${i.icon}</span> <h3 style="margin:0; color:${i.bg}; font-size:1.2rem;">${t}</h3>
          </div>
          <p style="color:var(--y); margin:0 0 20px 0; line-height:1.5; white-space:pre-wrap;">${e}</p> <div style="display:flex; justify-content:flex-end;"> <button id="elegantAlertOk" style="padding:10px 25px; background:${i.bg}; border:none; border-radius:8px; color:var(--b); cursor:pointer; font-weight:600; font-size:0.95rem; transition:all 0.2s;">OK</button> </div> </div> `, document.body.appendChild(s);
    const r = s.querySelector("#elegantAlertOk");
    r.focus();
    const l = () => {
      s.style.animation = "fadeOut 0.2s", setTimeout(() => {
        s.remove(), a();
      }, 200);
    };
    r.addEventListener("click", l), s.addEventListener("click", (e2) => {
      e2.target === s && l();
    }), document.addEventListener("keydown", function e2(t2) {
      "Enter" !== t2.key && "Escape" !== t2.key || (l(), document.removeEventListener("keydown", e2));
    });
  });
}
function Ev(e, t = "Confirm", n = {}) {
  return new Promise((a) => {
    const { confirmText: o = "Confirm", cancelText: i = "Cancel", type: s = "warning" } = n, r = { info: { bg: "var(--j)", icon: "\u2139\uFE0F" }, warning: { bg: "var(--dn)", icon: "\u26A0\uFE0F" }, error: { bg: "var(--l)", icon: "\u{1F5D1}\uFE0F" }, danger: { bg: "var(--l)", icon: "\u26A0\uFE0F" }, success: { bg: "var(--n)", icon: "\u2705" } }, l = r[s] || r.warning, c = document.createElement("div");
    c.id = "elegantConfirmOverlay", c.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--bp); z-index:10000000; display:flex; justify-content:center; align-items:center; animation:fadeIn 0.2s;", c.innerHTML = ` <div style="background:linear-gradient(135deg, var(--ad) 0%, var(--w) 100%); border-radius:16px; padding:25px 30px; max-width:450px; width:90%; box-shadow:0 20px 60px var(--ab); border:1px solid ${l.bg}40; animation:slideIn 0.3s;"> <div style="display:flex; align-items:center; gap:12px; margin-bottom:15px;"> <span style="font-size:1.5rem;">${l.icon}</span> <h3 style="margin:0; color:${l.bg}; font-size:1.2rem;">${t}</h3>
          </div>
          <p style="color:var(--y); margin:0 0 25px 0; line-height:1.6; white-space:pre-wrap;">${e}</p> <div style="display:flex; justify-content:flex-end; gap:10px;"> <button id="elegantConfirmCancel" style="padding:10px 20px; background:transparent; border:1px solid var(--r); border-radius:8px; color:var(--a); cursor:pointer; font-size:0.95rem; transition:all 0.2s;">${i}</button> <button id="elegantConfirmOk" style="padding:10px 20px; background:${l.bg}; border:none; border-radius:8px; color:var(--b); cursor:pointer; font-weight:600; font-size:0.95rem; transition:all 0.2s;">${o}</button> </div> </div> `, document.body.appendChild(c);
    const d = c.querySelector("#elegantConfirmOk"), p = c.querySelector("#elegantConfirmCancel");
    d.focus();
    const m = (e2) => {
      c.style.animation = "fadeOut 0.2s", setTimeout(() => {
        c.remove(), a(e2);
      }, 200);
    };
    d.addEventListener("click", () => m(true)), p.addEventListener("click", () => m(false)), c.addEventListener("click", (e2) => {
      e2.target === c && m(false);
    }), document.addEventListener("keydown", function e2(t2) {
      "Enter" === t2.key && (m(true), document.removeEventListener("keydown", e2)), "Escape" === t2.key && (m(false), document.removeEventListener("keydown", e2));
    });
  });
}
function Iv(e, t = "Input", n = {}) {
  return new Promise((a) => {
    const { defaultValue: o = "", placeholder: i = "", type: s = "text", multiline: r = false } = n, l = document.createElement("div");
    l.id = "elegantPromptOverlay", l.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--bp); z-index:100000; display:flex; justify-content:center; align-items:center; animation:fadeIn 0.2s;";
    const c = r ? `<textarea id="elegantPromptInput" placeholder="${i}" style="width:100%; height:100px; padding:12px; background:var(--ae); border:1px solid var(--o); border-radius:8px; color:var(--b); font-size:0.95rem; resize:vertical; font-family:inherit;">${o}</textarea>` : `<input type="${s}" id="elegantPromptInput" value="${o}" placeholder="${i}" style="width:100%; padding:12px; background:var(--ae); border:1px solid var(--o); border-radius:8px; color:var(--b); font-size:0.95rem;">`;
    l.innerHTML = ` <div style="background:linear-gradient(135deg, var(--ad) 0%, var(--w) 100%); border-radius:16px; padding:25px 30px; max-width:450px; width:90%; box-shadow:0 20px 60px var(--ab); border:1px solid #667eea40; animation:slideIn 0.3s;"> <div style="display:flex; align-items:center; gap:12px; margin-bottom:15px;"> <span style="font-size:1.5rem;">\u270F\uFE0F</span> <h3 style="margin:0; color:var(--j); font-size:1.2rem;">${t}</h3>
          </div>
          <p style="color:var(--y); margin:0 0 15px 0; line-height:1.5; white-space:pre-wrap;">${e}</p> ${c} <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;"> <button id="elegantPromptCancel" style="padding:10px 20px; background:transparent; border:1px solid var(--r); border-radius:8px; color:var(--a); cursor:pointer; font-size:0.95rem; transition:all 0.2s;">Cancel</button> <button id="elegantPromptOk" style="padding:10px 20px; background:var(--j); border:none; border-radius:8px; color:var(--s); cursor:pointer; font-weight:600; font-size:0.95rem; transition:all 0.2s;">OK</button> </div> </div> `, document.body.appendChild(l);
    const d = l.querySelector("#elegantPromptInput"), p = l.querySelector("#elegantPromptOk"), m = l.querySelector("#elegantPromptCancel");
    d.focus(), r || d.select();
    const u2 = (e2) => {
      l.style.animation = "fadeOut 0.2s", setTimeout(() => {
        l.remove(), a(e2);
      }, 200);
    };
    p.addEventListener("click", () => u2(d.value)), m.addEventListener("click", () => u2(null)), l.addEventListener("click", (e2) => {
      e2.target === l && u2(null);
    }), d.addEventListener("keydown", (e2) => {
      "Enter" !== e2.key || r || u2(d.value), "Escape" === e2.key && u2(null);
    });
  });
}
window.togglePostActionsMenu = togglePostActionsMenu, window.closePostActionsMenu = closePostActionsMenu, window.tipOnPost = tipOnPost, window.giftOnPost = giftOnPost, window.handlePostGiftGiven = handlePostGiftGiven;
