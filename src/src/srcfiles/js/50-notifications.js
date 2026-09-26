// ============================================================================
// 50-notifications — Notifications: showNotification, confirm/input/prompt dialogs + export chain.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

function showNotification(e, t = "success") {
    const n = { success: "#4caf50", error: "var(--l-red)", warning: "var(--l-amber-4)", info: "#2196f3" },
        a = document.createElement("div");
    (a.style.cssText = `position:fixed; bottom:20px; right:20px; background:${n[t] || n.success}; color:var(--l-ink); padding:15px 20px; border-radius:8px; box-shadow:0 4px 15px var(--l-veil-30); z-index:3000; max-width:300px; animation: slideIn 0.3s;`),
        (a.textContent = e),
        document.body.appendChild(a),
        setTimeout(() => {
            (a.style.animation = "fadeOut 0.3s"), setTimeout(() => a.remove(), 300);
        }, 3e3);
}
function showAlert(e, t = "Notice", n = "info") {
    return new Promise((a) => {
        const o = {
                info: { bg: "var(--l-indigo)", icon: "ℹ️" },
                warning: { bg: "var(--l-amber-4)", icon: "⚠️" },
                error: { bg: "var(--l-red)", icon: "❌" },
                success: { bg: "var(--l-green)", icon: "✅" },
            },
            i = o[n] || o.info,
            s = document.createElement("div");
        (s.id = "elegantAlertOverlay"),
            (s.style.cssText =
                "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--l-veil-70); z-index:100000; display:flex; justify-content:center; align-items:center; animation:fadeIn 0.2s;"),
            (s.innerHTML = `\n        <div style="background:linear-gradient(135deg, var(--l-panel) 0%, var(--l-panel-2) 100%); border-radius:16px; padding:25px 30px; max-width:400px; width:90%; box-shadow:0 20px 60px var(--l-veil-50); border:1px solid ${i.bg}40; animation:slideIn 0.3s;">\n          <div style="display:flex; align-items:center; gap:12px; margin-bottom:15px;">\n            <span style="font-size:1.5rem;">${i.icon}</span>\n            <h3 style="margin:0; color:${i.bg}; font-size:1.2rem;">${t}</h3>\n          </div>\n          <p style="color:var(--text); margin:0 0 20px 0; line-height:1.5; white-space:pre-wrap;">${e}</p>\n          <div style="display:flex; justify-content:flex-end;">\n            <button id="elegantAlertOk" style="padding:10px 25px; background:${i.bg}; border:none; border-radius:8px; color:var(--l-ink); cursor:pointer; font-weight:600; font-size:0.95rem; transition:all 0.2s;">OK</button>\n          </div>\n        </div>\n      `),
            document.body.appendChild(s);
        const r = s.querySelector("#elegantAlertOk");
        r.focus();
        const l = () => {
            (s.style.animation = "fadeOut 0.2s"),
                setTimeout(() => {
                    s.remove(), a();
                }, 200);
        };
        r.addEventListener("click", l),
            s.addEventListener("click", (e) => {
                e.target === s && l();
            }),
            document.addEventListener("keydown", function e(t) {
                ("Enter" !== t.key && "Escape" !== t.key) || (l(), document.removeEventListener("keydown", e));
            });
    });
}
function showConfirm(e, t = "Confirm", n = {}) {
    return new Promise((a) => {
        const { confirmText: o = "Confirm", cancelText: i = "Cancel", type: s = "warning" } = n,
            r = {
                info: { bg: "var(--l-indigo)", icon: "ℹ️" },
                warning: { bg: "var(--l-amber-4)", icon: "⚠️" },
                error: { bg: "var(--l-red)", icon: "🗑️" },
                danger: { bg: "var(--l-red)", icon: "⚠️" },
                success: { bg: "var(--l-green)", icon: "✅" },
            },
            l = r[s] || r.warning,
            c = document.createElement("div");
        (c.id = "elegantConfirmOverlay"),
            (c.style.cssText =
                "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--l-veil-70); z-index:10000000; display:flex; justify-content:center; align-items:center; animation:fadeIn 0.2s;"),
            (c.innerHTML = `\n        <div style="background:linear-gradient(135deg, var(--l-panel) 0%, var(--l-panel-2) 100%); border-radius:16px; padding:25px 30px; max-width:450px; width:90%; box-shadow:0 20px 60px var(--l-veil-50); border:1px solid ${l.bg}40; animation:slideIn 0.3s;">\n          <div style="display:flex; align-items:center; gap:12px; margin-bottom:15px;">\n            <span style="font-size:1.5rem;">${l.icon}</span>\n            <h3 style="margin:0; color:${l.bg}; font-size:1.2rem;">${t}</h3>\n          </div>\n          <p style="color:var(--text); margin:0 0 25px 0; line-height:1.6; white-space:pre-wrap;">${e}</p>\n          <div style="display:flex; justify-content:flex-end; gap:10px;">\n            <button id="elegantConfirmCancel" style="padding:10px 20px; background:transparent; border:1px solid var(--border-strong); border-radius:8px; color:var(--text-dim); cursor:pointer; font-size:0.95rem; transition:all 0.2s;">${i}</button>\n            <button id="elegantConfirmOk" style="padding:10px 20px; background:${l.bg}; border:none; border-radius:8px; color:var(--l-ink); cursor:pointer; font-weight:600; font-size:0.95rem; transition:all 0.2s;">${o}</button>\n          </div>\n        </div>\n      `),
            document.body.appendChild(c);
        const d = c.querySelector("#elegantConfirmOk"),
            p = c.querySelector("#elegantConfirmCancel");
        d.focus();
        const m = (e) => {
            (c.style.animation = "fadeOut 0.2s"),
                setTimeout(() => {
                    c.remove(), a(e);
                }, 200);
        };
        d.addEventListener("click", () => m(!0)),
            p.addEventListener("click", () => m(!1)),
            c.addEventListener("click", (e) => {
                e.target === c && m(!1);
            }),
            document.addEventListener("keydown", function e(t) {
                "Enter" === t.key && (m(!0), document.removeEventListener("keydown", e)),
                    "Escape" === t.key && (m(!1), document.removeEventListener("keydown", e));
            });
    });
}
function showPrompt(e, t = "Input", n = {}) {
    return new Promise((a) => {
        const { defaultValue: o = "", placeholder: i = "", type: s = "text", multiline: r = !1 } = n,
            l = document.createElement("div");
        (l.id = "elegantPromptOverlay"),
            (l.style.cssText =
                "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--l-veil-70); z-index:100000; display:flex; justify-content:center; align-items:center; animation:fadeIn 0.2s;");
        const c = r
            ? `<textarea id="elegantPromptInput" placeholder="${i}" style="width:100%; height:100px; padding:12px; background:var(--l-bg); border:1px solid var(--border); border-radius:8px; color:var(--l-ink); font-size:0.95rem; resize:vertical; font-family:inherit;">${o}</textarea>`
            : `<input type="${s}" id="elegantPromptInput" value="${o}" placeholder="${i}" style="width:100%; padding:12px; background:var(--l-bg); border:1px solid var(--border); border-radius:8px; color:var(--l-ink); font-size:0.95rem;">`;
        (l.innerHTML = `\n        <div style="background:linear-gradient(135deg, var(--l-panel) 0%, var(--l-panel-2) 100%); border-radius:16px; padding:25px 30px; max-width:450px; width:90%; box-shadow:0 20px 60px var(--l-veil-50); border:1px solid #667eea40; animation:slideIn 0.3s;">\n          <div style="display:flex; align-items:center; gap:12px; margin-bottom:15px;">\n            <span style="font-size:1.5rem;">✏️</span>\n            <h3 style="margin:0; color:var(--l-indigo); font-size:1.2rem;">${t}</h3>\n          </div>\n          <p style="color:var(--text); margin:0 0 15px 0; line-height:1.5; white-space:pre-wrap;">${e}</p>\n          ${c}\n          <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">\n            <button id="elegantPromptCancel" style="padding:10px 20px; background:transparent; border:1px solid var(--border-strong); border-radius:8px; color:var(--text-dim); cursor:pointer; font-size:0.95rem; transition:all 0.2s;">Cancel</button>\n            <button id="elegantPromptOk" style="padding:10px 20px; background:var(--l-indigo); border:none; border-radius:8px; color:var(--l-ink-on-fill); cursor:pointer; font-weight:600; font-size:0.95rem; transition:all 0.2s;">OK</button>\n          </div>\n        </div>\n      `),
            document.body.appendChild(l);
        const d = l.querySelector("#elegantPromptInput"),
            p = l.querySelector("#elegantPromptOk"),
            m = l.querySelector("#elegantPromptCancel");
        d.focus(), r || d.select();
        const u = (e) => {
            (l.style.animation = "fadeOut 0.2s"),
                setTimeout(() => {
                    l.remove(), a(e);
                }, 200);
        };
        p.addEventListener("click", () => u(d.value)),
            m.addEventListener("click", () => u(null)),
            l.addEventListener("click", (e) => {
                e.target === l && u(null);
            }),
            d.addEventListener("keydown", (e) => {
                "Enter" !== e.key || r || u(d.value), "Escape" === e.key && u(null);
            });
    });
}
(window.togglePostActionsMenu = togglePostActionsMenu),
    (window.closePostActionsMenu = closePostActionsMenu),
    (window.tipOnPost = tipOnPost),
    (window.giftOnPost = giftOnPost),
    (window.handlePostGiftGiven = handlePostGiftGiven);
