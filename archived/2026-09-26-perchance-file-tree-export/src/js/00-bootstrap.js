// ============================================================================
// 00-bootstrap — Boot & settings panel init — debug helpers, closeHiringModal, settings/log categories IIFE.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

function u() {
  const e = document.getElementById("hiringModal");
  if (!e) return void console.warn("No #hiringModal in DOM");
  const t = getComputedStyle(e);
  console.table({ display: t.display, visibility: t.visibility, opacity: t.opacity, position: t.position, zIndex: t.zIndex, pointerEvents: t.pointerEvents }), console.log("Modal rect:", e.getBoundingClientRect());
}
function closeHiringModal() {
  const e = document.getElementById("hiringModal");
  e && e.remove();
  const t = window.__hiringEscHandler__;
  t && (window.removeEventListener("keydown", t), window.__hiringEscHandler__ = null), modalRegistry.delete("hiring");
}
!function() {
  const u2 = "fuoc_log_settings", G2 = [{ id: "imagesai", label: "Images & AI", icon: "\u{1F5BC}\uFE0F", tags: ["Prompt", "AI Queue", "Image Queue", "IMAGE GEN", "Image Request", "Request Image", "Image Mentions", "Auto-Vis", "Scene Visualization", "AI Optimization", "AI Training", "Nuclear Context"] }, { id: "saveboot", label: "Save & Boot", icon: "\u{1F4BE}", tags: ["BOOT", "SaveManager", "LoadGame", "Snapshot"] }, { id: "story", label: "Story & Events", icon: "\u{1F4D6}", tags: ["StoryEngine", "Stories", "Event", "Dynamic Events", "Drama", "Chain"] }, { id: "social", label: "Social", icon: "\u{1F4AC}", tags: ["Social", "Comments", "Comment Dynamics", "PostModal", "Algorithm", "Feed Update", "Notification", "Mention", "Mentions", "DeletePost", "Proactive DM", "Sanitize"] }, { id: "npc", label: "NPC & Gossip", icon: "\u{1F9E0}", tags: ["GossipEngine", "Gossip Created", "CompanyContext", "Autonomous"] }, { id: "economy", label: "Economy", icon: "\u{1F381}", tags: ["Gift", "Gift Price", "Gift Consequences", "Payroll", "AFK"] }, { id: "hr", label: "HR & People", icon: "\u{1F454}", tags: ["Hire", "Rehire", "Fire", "Promotion", "Pyramid", "Names", "Gender", "Race", "Ethnicity", "Custom Employee", "Birth", "Pregnancy"] }, { id: "systems", label: "Systems", icon: "\u2699\uFE0F", tags: ["Schedule", "Performance", "Perspective", "Groups", "Flags", "Skills", "Chat", "Enc"] }, { id: "uncategorized", label: "Uncategorized", icon: "\u2753", tags: [] }], U2 = {};
  G2.forEach(function(c) {
    c.tags.forEach(function(t) {
      U2[t.toLowerCase()] = c.id;
    });
  });
  const J2 = function() {
    const G3 = { masterOn: true, suppressWarn: false, suppressError: false, tags: {}, cats: {} };
    try {
      const raw = localStorage.getItem(u2);
      if (!raw) return G3;
      const parsed = JSON.parse(raw) || {};
      return { masterOn: false !== parsed.masterOn, suppressWarn: true === parsed.suppressWarn, suppressError: true === parsed.suppressError, tags: Object.assign({}, parsed.tags), cats: Object.assign({}, parsed.cats) };
    } catch (u3) {
      return G3;
    }
  }();
  function save() {
    try {
      localStorage.setItem(u2, JSON.stringify(J2));
    } catch (u3) {
    }
  }
  window.__logCfg = J2, window.__logSeen = window.__logSeen || {};
  const ee2 = /^.{0,6}?\[([^\]]+)\]/u;
  function effective(u3, G3) {
    return null != u3 && Object.prototype.hasOwnProperty.call(J2.tags, u3) ? false !== J2.tags[u3] : !Object.prototype.hasOwnProperty.call(J2.cats, G3) || false !== J2.cats[G3];
  }
  function te2(u3) {
    let G3 = "uncategorized", J3 = null;
    if ("string" == typeof u3) {
      const m = u3.match(ee2);
      if (m) {
        const u4 = function(raw) {
          let t = String(raw).trim();
          return /^BOOT\b/i.test(t) && (t = "BOOT"), t;
        }(m[1]);
        J3 = u4.toLowerCase(), window.__logSeen[J3] = u4, G3 = U2[J3] || "uncategorized";
      }
    }
    return effective(J3, G3);
  }
  const ne2 = console.log.bind(console), oe2 = console.warn.bind(console), ae2 = console.error.bind(console), ie2 = console.info ? console.info.bind(console) : ne2, se2 = console.debug ? console.debug.bind(console) : ne2, le2 = 1e3;
  function ce2(level, args) {
    let text;
    try {
      text = Array.isArray(args) || args && "number" == typeof args.length ? function(args2) {
        const out = [];
        for (let i = 0; i < args2.length; i++) {
          const a = args2[i];
          if ("string" == typeof a) out.push(a);
          else if (a instanceof Error) out.push(a.stack || a.message || String(a));
          else if (null === a) out.push("null");
          else if (void 0 === a) out.push("undefined");
          else if ("object" == typeof a) try {
            out.push(JSON.stringify(a));
          } catch (u4) {
            try {
              out.push(String(a));
            } catch (u5) {
              out.push("[Unserializable]");
            }
          }
          else out.push(String(a));
        }
        return out.join(" ");
      }(args) : String(args);
    } catch (u4) {
      text = "[Unserializable log]";
    }
    const entry = { t: Date.now(), level, text }, u3 = window.__logMirror;
    if (u3.push(entry), u3.length > le2 && u3.splice(0, u3.length - le2), window.__onMirror) try {
      window.__onMirror(entry);
    } catch (u4) {
    }
  }
  function de2(u3, level) {
    return function() {
      if (false !== J2.masterOn) return te2(arguments[0]) ? (ce2(level, arguments), u3.apply(console, arguments)) : void 0;
    };
  }
  function ue2(u3, G3, level) {
    return function() {
      if (true !== J2[G3] || te2(arguments[0])) return ce2(level, arguments), u3.apply(console, arguments);
    };
  }
  function pe2(u3) {
    const set = {}, cat = G2.find(function(c) {
      return c.id === u3;
    });
    return cat && cat.tags.forEach(function(t) {
      set[t.toLowerCase()] = t;
    }), Object.keys(window.__logSeen).forEach(function(k) {
      (U2[k] || "uncategorized") === u3 && (set[k] = window.__logSeen[k]);
    }), set;
  }
  window.__logMirror = window.__logMirror || [], console.log = de2(ne2, "log"), console.info = de2(ie2, "info"), console.debug = de2(se2, "debug"), console.warn = ue2(oe2, "suppressWarn", "warn"), console.error = ue2(ae2, "suppressError", "error"), window.addEventListener("error", function(e) {
    ce2("error", ["Uncaught " + (e && e.error && e.error.stack || e && e.message || String(e))]);
  }), window.addEventListener("unhandledrejection", function(e) {
    const r = e && e.reason;
    ce2("error", ["Unhandled rejection: " + (r && r.stack || r && r.message || String(r))]);
  }), window.LogMirror = { buffer: window.__logMirror, CAP: le2, clear: function() {
    window.__logMirror.length = 0;
  } }, window.LogControl = { LS_KEY: u2, categories: G2, registry: U2, cfg: J2, seen: function() {
    return window.__logSeen;
  }, tagsForCategory: pe2, effective, save, setMaster: function(b) {
    J2.masterOn = !!b, save();
  }, setSuppressWarn: function(b) {
    J2.suppressWarn = !!b, save();
  }, setSuppressError: function(b) {
    J2.suppressError = !!b, save();
  }, setTag: function(u3, b) {
    J2.tags[u3] = !!b, save();
  }, setCategory: function(u3, b) {
    J2.cats[u3] = !!b, Object.keys(pe2(u3)).forEach(function(k) {
      delete J2.tags[k];
    }), save();
  }, setAll: function(b) {
    J2.tags = {}, b ? J2.cats = {} : G2.forEach(function(c) {
      J2.cats[c.id] = false;
    }), save();
  }, reset: function() {
    J2.masterOn = true, J2.suppressWarn = false, J2.suppressError = false, J2.tags = {}, J2.cats = {}, save();
  } };
}(), window.renderDisplaySettings = function() {
  const root = document.getElementById("displayPanelRoot");
  if (!root || !window.DisplaySettings) return;
  const u2 = window.DisplaySettings, G2 = u2.get(), U2 = "background:var(--f); border-radius:12px; padding:18px; margin-bottom:16px;", J2 = "margin:0 0 6px 0; font-size:1.05rem;", ee2 = "color:var(--a); font-size:0.85rem; margin:0 0 14px 0; line-height:1.45;", te2 = (t) => {
    const on = G2.theme === t.id, swatches = t.swatch.map((c) => `<span style="width:18px; height:18px; border-radius:4px; background:${c}; border:1px solid var(--o); display:inline-block;"></span>`).join("");
    return ` <button class="fuoc-theme-card${on ? " is-active" : ""}"
                    data-theme-id="${t.id}"
                    aria-pressed="${on ? "true" : "false"}"
                    title="${t.blurb}" > <span class="tc-head"> <span class="tc-name">${t.label}</span> ${on ? '<span class="tc-check">\u2713</span>' : ""} </span> <span class="tc-swatches">${swatches}</span> <span class="tc-blurb">${t.blurb}</span> </button>`;
  }, toggle = (key, label, note) => ` <label class="fuoc-a11y-row"> <input type="checkbox" data-display-toggle="${key}" ${G2[key] ? "checked" : ""} /> <span class="a11y-text"> <span class="a11y-label">${label}</span> <span class="a11y-note">${note}</span> </span> </label>`, pct = Math.round(100 * G2.scale);
  root.innerHTML = ` <div style="${U2}"> <h3 style="${J2}">\u{1F3A8} Theme</h3> <p style="${ee2}"> Changes apply instantly and are remembered on this device \u2014 they live outside your save, so resetting the game or importing a character won't undo them. </p> ${(() => {
    const order = ["Standard", "Easy on the eyes", "Flavour", "Other"], G3 = {};
    return u2.THEMES.forEach((t) => {
      const g = order.indexOf(t.group) > -1 ? t.group : "Other";
      (G3[g] = G3[g] || []).push(t);
    }), order.filter((g) => G3[g] && G3[g].length).map((g) => `<div class="fuoc-theme-group"> <span class="tg-label">${g}</span> <div class="fuoc-theme-grid">${G3[g].map(te2).join("")}</div> </div>`).join("");
  })()} </div> <div style="${U2}"> <h3 style="${J2}">\u{1F524} Text size</h3> <p style="${ee2}">Scales the interface text. Layouts reflow to match.</p> <div class="fuoc-scale-row"> <input type="range" id="displayScaleRange" min="90" max="140" step="5" value="${pct}" /> <output id="displayScaleOut" class="num">${pct}%</output> <button id="displayScaleReset" class="fuoc-mini-btn" type="button">Reset</button> </div> </div> <div style="${U2}"> <h3 style="${J2}">\u267F Accessibility</h3> <p style="${ee2}">Each of these works with any theme.</p> ${toggle("reduceGlow", "Reduce glow &amp; transparency", "Removes neon text-shadows, blur and see-through panels. The biggest help if bright text on dark looks smeared or doubled.")}
                ${toggle("reduceMotion", "Reduce motion", "Stops animations and transitions, without needing to change your device settings.")}
                ${toggle("bigTargets", "Larger buttons &amp; inputs", "Gives every control a 44px minimum tap area.")}
                ${toggle("focusRings", "Strong focus outline", "Makes the keyboard focus ring thicker and higher contrast.")}
                ${toggle("readableFont", "High-legibility font", "Switches the interface to a wider font with more distinct letter shapes.")} <div style="margin-top:14px;"> <button id="displayResetAll" class="fuoc-mini-btn" type="button">Reset all display settings</button> </div> </div>`, root.querySelectorAll("[data-theme-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      u2.setTheme(btn.dataset.themeId), window.renderDisplaySettings();
    });
  }), root.querySelectorAll("[data-display-toggle]").forEach((box) => {
    box.addEventListener("change", () => {
      const patch = {};
      patch[box.dataset.displayToggle] = box.checked, u2.set(patch);
    });
  });
  const range = document.getElementById("displayScaleRange"), out = document.getElementById("displayScaleOut");
  range && range.addEventListener("input", () => {
    out.textContent = range.value + "%", u2.setScale(Number(range.value) / 100);
  });
  const ne2 = document.getElementById("displayScaleReset");
  ne2 && ne2.addEventListener("click", () => {
    u2.setScale(1), window.renderDisplaySettings();
  });
  const oe2 = document.getElementById("displayResetAll");
  oe2 && oe2.addEventListener("click", () => {
    u2.reset(), window.renderDisplaySettings();
  });
}, window.renderLoggingSettings = function() {
  const root = document.getElementById("loggingPanelRoot");
  if (!root || !window.LogControl) return;
  const u2 = window.LogControl, G2 = u2.cfg, cats = u2.categories, ui = window.__logUIState = window.__logUIState || { collapsed: {}, search: "" };
  void 0 === ui.mirrorLevel && (ui.mirrorLevel = "all"), void 0 === ui.mirrorAutoscroll && (ui.mirrorAutoscroll = true);
  const U2 = "background:var(--f);border-radius:12px;padding:18px;margin-bottom:16px;", J2 = "display:flex;align-items:center;gap:10px;padding:6px 4px;", ee2 = (bg) => "padding:8px 14px;border:none;border-radius:8px;color:var(--b);cursor:pointer;font-weight:600;font-size:.82rem;background:" + bg + ";", te2 = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  function ne2(G3) {
    const map = u2.tagsForCategory(G3);
    return Object.keys(map).sort().map((k) => ({ key: k, disp: map[k], on: u2.effective(k, G3) }));
  }
  const oe2 = { log: "var(--a)", info: "#6db3f2", warn: "#e9a23b", error: "var(--au)", debug: "var(--br)" }, ae2 = (entry) => "all" === ui.mirrorLevel || entry.level === ui.mirrorLevel, ie2 = (t) => {
    const d = new Date(t), p = (n) => String(n).padStart(2, "0");
    return p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
  }, se2 = (entry) => `<div class="logMirrorRow" data-level="${entry.level}" style="padding:2px 6px;border-bottom:1px solid var(--bb);color:${oe2[entry.level] || "var(--y)"};white-space:pre-wrap;word-break:break-word"><span style="color:var(--q)">[${ie2(entry.t)}]</span> ${te2(entry.text)}</div>`, chip = (val, label) => {
    const on = ui.mirrorLevel === val;
    return `<button class="logMirrorChip" data-level="${val}" style="padding:4px 10px;border:1px solid ${on ? "var(--j)" : "var(--o)"};border-radius:14px;background:${on ? "rgba(102,126,234,.18)" : "transparent"};color:${on ? "#9db0ff" : "var(--a)"};cursor:pointer;font-size:.74rem">${label}</button>`;
  };
  let html = "";
  const le2 = window.__logMirror.filter(ae2).map(se2).join("");
  html += `<div style="${U2}"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px"><h3 style="margin:0;color:var(--d)">\u{1F5A5}\uFE0F Console Mirror</h3><span id="logMirrorCount" style="color:var(--a);font-size:.8rem"></span><span style="flex:1"></span><button id="logMirrorCopy" style="${ee2("#2e7d52")}">\u{1F4CB} Copy</button><button id="logMirrorClear" style="${ee2("#7a3b3b")}">Clear</button></div><p style="color:var(--a);font-size:.8rem;margin:0 0 10px 0">A live in-app copy of the dev console for reporting bugs. Volatile \u2014 cleared on refresh, never saved.</p><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:8px">` + chip("all", "All") + chip("log", "Log") + chip("warn", "Warn") + chip("error", "Error") + `<span style="flex:1"></span><label style="display:flex;align-items:center;gap:5px;cursor:pointer;color:var(--a);font-size:.78rem"><input type="checkbox" id="logMirrorAutoscroll" ${ui.mirrorAutoscroll ? "checked" : ""} style="accent-color:var(--j)"> Autoscroll</label></div><div id="logMirrorBody" style="height:300px;overflow:auto;background:var(--bi);border:1px solid var(--o);border-radius:8px;padding:6px 4px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.78rem;line-height:1.45">${le2}</div><textarea id="logMirrorCopyArea" readonly style="position:absolute;left:-9999px;top:-9999px;opacity:0" aria-hidden="true"></textarea></div>`, html += `<div style="${U2}"><h3 style="margin:0 0 6px 0;color:var(--d)">\u{1F50D} Console Logging</h3><p style="color:var(--a);font-size:.85rem;margin:0 0 14px 0">Quiet the dev console by category or individual tag. Errors and warnings stay visible unless you silence them below. Saved separately from your game.</p><label style="${J2}cursor:pointer"><input type="checkbox" id="logMaster" ${G2.masterOn ? "checked" : ""} style="width:18px;height:18px;accent-color:var(--j)"> <strong>Enable all console logging</strong></label><label style="${J2}cursor:pointer"><input type="checkbox" id="logSupWarn" ${G2.suppressWarn ? "checked" : ""} style="width:16px;height:16px;accent-color:#e9a23b"> Silence warnings <span style="color:var(--q);font-size:.78rem">(then category toggles apply to warnings)</span></label><label style="${J2}cursor:pointer"><input type="checkbox" id="logSupErr" ${G2.suppressError ? "checked" : ""} style="width:16px;height:16px;accent-color:var(--l)"> Silence errors <span style="color:var(--q);font-size:.78rem">(not recommended)</span></label></div>`, html += `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:14px"><input id="logSearch" type="text" placeholder="\u{1F50E} Filter tags\u2026" value="${te2(ui.search)}" style="flex:1;min-width:160px;padding:8px 10px;border-radius:8px;border:1px solid var(--o);background:var(--i);color:var(--y)"><button id="logEnableAll" style="${ee2("#2e7d52")}">Enable all</button><button id="logDisableAll" style="${ee2("#7a3b3b")}">Disable all</button><button id="logReset" style="${ee2("var(--av)")}">Reset</button></div>`, cats.forEach((cat) => {
    const children = ne2(cat.id), u3 = children.filter((c) => c.on).length, total = children.length, G3 = total > 0 && u3 === total, collapsed = !!ui.collapsed[cat.id], J3 = "uncategorized" === cat.id && total > 0 ? '<div style="color:var(--q);font-size:.78rem;padding:2px 0 8px 0">Includes tags discovered this session.</div>' : "";
    html += `<div class="logCat" style="${U2}padding:0;overflow:hidden"><div style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:var(--h)"><input type="checkbox" class="logCatBox" data-cat="${cat.id}" ${G3 ? "checked" : ""} style="width:17px;height:17px;accent-color:var(--j)"><span class="logCatToggle" data-cat="${cat.id}" style="flex:1;cursor:pointer;font-weight:600">${cat.icon} ${te2(cat.label)} <span style="color:var(--a);font-weight:400;font-size:.8rem">(${u3}/${total} on)</span></span><span class="logCatToggle" data-cat="${cat.id}" style="cursor:pointer;color:var(--a);font-size:.9rem">${collapsed ? "\u25B8" : "\u25BE"}</span></div><div class="logCatBody" data-cat="${cat.id}" style="display:${collapsed ? "none" : "block"};padding:8px 16px 12px 38px">` + J3 + (0 === total ? '<div style="color:var(--q);font-size:.82rem;padding:6px 0">No tags seen yet this session.</div>' : children.map((c) => `<label class="logTagRow" data-tagtext="${te2(c.disp.toLowerCase())}" style="display:flex;align-items:center;gap:9px;padding:4px 0;cursor:pointer"><input type="checkbox" class="logTagBox" data-tag="${te2(c.key)}" ${c.on ? "checked" : ""} style="width:15px;height:15px;accent-color:var(--j)"><span style="font-size:.88rem">[${te2(c.disp)}]</span></label>`).join("")) + "</div></div>";
  }), root.innerHTML = html, cats.forEach((cat) => {
    const children = ne2(cat.id), u3 = children.filter((c) => c.on).length, box = root.querySelector('.logCatBox[data-cat="' + cat.id + '"]');
    box && (box.indeterminate = children.length > 0 && u3 > 0 && u3 < children.length);
  });
  const ce2 = () => window.renderLoggingSettings();
  root.querySelector("#logMaster").addEventListener("change", (e) => u2.setMaster(e.target.checked)), root.querySelector("#logSupWarn").addEventListener("change", (e) => u2.setSuppressWarn(e.target.checked)), root.querySelector("#logSupErr").addEventListener("change", (e) => u2.setSuppressError(e.target.checked)), root.querySelector("#logEnableAll").addEventListener("click", () => {
    u2.setAll(true), ce2();
  }), root.querySelector("#logDisableAll").addEventListener("click", () => {
    u2.setAll(false), ce2();
  }), root.querySelector("#logReset").addEventListener("click", () => {
    ui.search = "", u2.reset(), ce2();
  });
  const search = root.querySelector("#logSearch"), de2 = () => {
    const q = (search.value || "").toLowerCase().trim();
    ui.search = q, root.querySelectorAll(".logTagRow").forEach((r) => {
      r.style.display = q && -1 === r.getAttribute("data-tagtext").indexOf(q) ? "none" : "flex";
    });
  };
  search.addEventListener("input", de2), root.querySelectorAll(".logCatToggle").forEach((u3) => u3.addEventListener("click", () => {
    const id = u3.getAttribute("data-cat");
    ui.collapsed[id] = !ui.collapsed[id], ce2();
  })), root.querySelectorAll(".logCatBox").forEach((box) => box.addEventListener("change", () => {
    u2.setCategory(box.getAttribute("data-cat"), box.checked), ce2();
  })), root.querySelectorAll(".logTagBox").forEach((box) => box.addEventListener("change", () => {
    u2.setTag(box.getAttribute("data-tag"), box.checked), ce2();
  }));
  const ue2 = root.querySelector("#logMirrorBody"), pe2 = root.querySelector("#logMirrorCount"), ge2 = () => {
    pe2 && (pe2.textContent = window.__logMirror.filter(ae2).length + " lines");
  }, ye2 = () => {
    ue2 && ui.mirrorAutoscroll && (ue2.scrollTop = ue2.scrollHeight);
  };
  ge2(), ye2(), window.__onMirror = (entry) => {
    if (!ue2 || !ue2.isConnected) return;
    if (!ae2(entry)) return void ge2();
    ue2.insertAdjacentHTML("beforeend", se2(entry));
    const cap = window.LogMirror && window.LogMirror.CAP || 1e3;
    for (; ue2.childElementCount > cap; ) ue2.removeChild(ue2.firstChild);
    ge2(), ye2();
  }, root.querySelectorAll(".logMirrorChip").forEach((b) => b.addEventListener("click", () => {
    ui.mirrorLevel = b.getAttribute("data-level"), ce2();
  }));
  const fe2 = root.querySelector("#logMirrorAutoscroll");
  fe2 && fe2.addEventListener("change", () => {
    ui.mirrorAutoscroll = fe2.checked, ye2();
  });
  const xe2 = root.querySelector("#logMirrorClear");
  xe2 && xe2.addEventListener("click", () => {
    window.LogMirror && window.LogMirror.clear(), ue2 && (ue2.innerHTML = ""), ge2();
  });
  const ke2 = root.querySelector("#logMirrorCopy");
  ke2 && ke2.addEventListener("click", () => {
    const text = window.__logMirror.filter(ae2).map((e) => "[" + ie2(e.t) + "] [" + e.level.toUpperCase() + "] " + e.text).join("\n"), done = () => "function" == typeof showNotification && showNotification("\u{1F4CB} Console copied to clipboard", "success"), fallback = () => {
      const u3 = root.querySelector("#logMirrorCopyArea");
      if (!u3) return;
      u3.value = text, u3.style.position = "static", u3.style.left = "auto", u3.style.top = "auto", u3.style.opacity = "1", u3.style.width = "100%", u3.style.height = "120px", u3.focus(), u3.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (u4) {
      }
      ok ? (u3.style.cssText = "position:absolute;left:-9999px;top:-9999px;opacity:0", done()) : "function" == typeof showNotification && showNotification("Select the text below and copy manually", "info");
    };
    navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(text).then(done, fallback) : fallback();
  }), de2();
}, window.modalRegistry = window.modalRegistry || /* @__PURE__ */ new Map();
