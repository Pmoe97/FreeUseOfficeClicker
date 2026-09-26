// ============================================================================
// 29-event-listeners — setupEventListeners (all tab/global wiring) + switchTab.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

function setupEventListeners() {
  document.querySelectorAll(".tab-btn").forEach((e2) => {
    e2.addEventListener("click", () => {
      switchTab(e2.dataset.tab);
    });
  });
  const e = $("upgradeMultiplierBtn");
  if (e && e.addEventListener("click", () => {
    const t2 = [1, 5, 10, 100, "max"], n2 = (t2.indexOf(gameState.upgradeMultiplier) + 1) % t2.length;
    gameState.upgradeMultiplier = t2[n2], e.textContent = `x${gameState.upgradeMultiplier}`, "business" === gameState.activeTab && updateProductsList();
  }), settingsBtn && settingsBtn.addEventListener("click", () => {
    settingsPanel && (settingsPanel.hidden = false);
  }), fullscreenBtn) {
    let t2 = function() {
      document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement ? (fullscreenBtn.textContent = "\u26F6", fullscreenBtn.classList.add("is-fullscreen"), fullscreenBtn.title = "Exit Fullscreen") : (fullscreenBtn.textContent = "\u26F6", fullscreenBtn.classList.remove("is-fullscreen"), fullscreenBtn.title = "Toggle Fullscreen");
    };
    var t = t2;
    fullscreenBtn.addEventListener("click", () => {
      if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen ? document.webkitExitFullscreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.msExitFullscreen && document.msExitFullscreen();
      else {
        const e2 = document.documentElement;
        e2.requestFullscreen ? e2.requestFullscreen() : e2.webkitRequestFullscreen ? e2.webkitRequestFullscreen() : e2.mozRequestFullScreen ? e2.mozRequestFullScreen() : e2.msRequestFullscreen && e2.msRequestFullscreen();
      }
    }), document.addEventListener("fullscreenchange", t2), document.addEventListener("webkitfullscreenchange", t2), document.addEventListener("mozfullscreenchange", t2);
  }
  const n = $("toggleHeaderBtn"), a = $("toggleHeaderIcon"), o = $("topBar"), i = $("newsTicker"), s = $("tabNav"), r = $("mainContent");
  let l = "true" === localStorage.getItem("headerCollapsed") || false, c = 50, d = 33;
  function p() {
    l || (o && (c = o.offsetHeight), i && (d = i.offsetHeight));
  }
  function m() {
    n && (n.style.top = l ? "0px" : c + "px");
  }
  function u2() {
    s && (s.style.top = l ? "0px" : c + d + "px");
  }
  function G2() {
    i && (i.style.top = l ? "0px" : c + "px");
  }
  window.addEventListener("resize", () => {
    p(), G2(), m(), u2();
  }), o && o.addEventListener("transitionend", (e2) => {
    "max-height" !== e2.propertyName || l || (p(), G2(), m(), u2());
  }), l ? (o && o.classList.add("collapsed"), i && i.classList.add("collapsed"), s && s.classList.add("icons-only"), a && (a.textContent = "\u25BC"), r && r.classList.add("header-collapsed")) : p(), G2(), m(), u2(), n && n.addEventListener("click", () => {
    l = !l, l ? (p(), o && o.classList.add("collapsed"), i && i.classList.add("collapsed"), s && s.classList.add("icons-only"), a && (a.textContent = "\u25BC"), r && r.classList.add("header-collapsed")) : (o && o.classList.remove("collapsed"), i && i.classList.remove("collapsed"), s && s.classList.remove("icons-only"), a && (a.textContent = "\u25B2"), r && r.classList.remove("header-collapsed")), G2(), m(), u2(), localStorage.setItem("headerCollapsed", l);
  }), window.ResizeObserver && o && new ResizeObserver(() => {
    p(), G2(), m(), u2();
  }).observe(o), closeSettingsBtn && closeSettingsBtn.addEventListener("click", () => {
    settingsPanel && (settingsPanel.hidden = true);
  });
  const g = $("settingsModal"), h = $("openFullSettingsBtn"), y = $("closeSettingsModalBtn"), f = document.querySelectorAll(".settings-tab-btn");
  h && h.addEventListener("click", () => {
    if (g) {
      g.style.display = "flex";
      const e2 = $("sfwModeToggleQuick"), t2 = $("sfwModeToggle");
      e2 && t2 && (t2.checked = e2.checked), k();
    }
  }), y && y.addEventListener("click", () => {
    g && (g.style.display = "none");
  }), g && g.addEventListener("click", (e2) => {
    e2.target === g && (g.style.display = "none");
  }), f.forEach((e2) => {
    e2.addEventListener("click", () => {
      const t2 = e2.dataset.settingsTab;
      f.forEach((e3) => {
        e3.classList.remove("active"), e3.style.borderBottomColor = "transparent", e3.style.color = "var(--ar)";
      }), e2.classList.add("active"), e2.style.borderBottomColor = "var(--j)", e2.style.color = "var(--j)", document.querySelectorAll(".settings-tab-content").forEach((e3) => {
        e3.style.display = "none";
      });
      const n2 = $("settingsTab-" + t2);
      n2 && (n2.style.display = "block"), "logging" === t2 && window.renderLoggingSettings && window.renderLoggingSettings(), "display" === t2 && window.renderDisplaySettings && window.renderDisplaySettings();
    });
  });
  const b = $("quickSaveBtn"), v = $("quickLoadBtn"), w = $("openCheatsQuickBtn"), x = $("openPatchNotesQuickBtn");
  b && b.addEventListener("click", () => saveGame(true)), v && v.addEventListener("click", async () => {
    const e2 = await Kv();
    if (0 === e2.length) return void showNotification("\u274C No saves found!", "error");
    const t2 = e2.filter((e3) => "quick" === e3.saveType), n2 = t2.length > 0 ? t2[0] : e2[0], a2 = n2.saveName || n2.slotName;
    await Ev(`Load "${a2}"?

Current progress will be lost.`, "Load Save", { type: "info", confirmText: "Load" }) && Vv(n2.slotName);
  }), w && w.addEventListener("click", () => {
    const e2 = $("cheatsModal");
    e2 && (e2.style.display = "flex");
  }), x && x.addEventListener("click", () => {
    const e2 = $("patchNotesModal");
    e2 && (e2.style.display = "flex"), $v();
  });
  const S = $("sfwModeToggleQuick");
  function k() {
    const e2 = $("aiQueueStatusModal"), t2 = $("aiQueueCountsModal"), n2 = $("aiTotalGeneratedModal"), a2 = $("aiQueueStatus"), o2 = $("aiQueueCounts"), i2 = $("aiTotalGenerated");
    e2 && a2 && (e2.textContent = a2.textContent), t2 && o2 && (t2.textContent = o2.textContent), n2 && i2 && (n2.textContent = i2.textContent);
    const s2 = $("imageQueueStatusModal"), r2 = $("imageQueueCountsModal"), l2 = $("imageTotalGeneratedModal"), c2 = $("imageQueueStatus"), d2 = $("imageQueueCounts"), p2 = $("imageTotalGenerated");
    s2 && c2 && (s2.textContent = c2.textContent), r2 && d2 && (r2.textContent = d2.textContent), l2 && p2 && (l2.textContent = p2.textContent);
    const m2 = $("autoVisualizeStatusQuick"), u3 = $("autoVisualizeCountQuick"), g2 = $("autoVisualizeStatus"), h2 = $("autoVisualizeCount");
    m2 && g2 && (m2.textContent = g2.textContent), u3 && h2 && (u3.textContent = h2.textContent);
  }
  S && (S.checked = gameState.settings?.sfwMode || false, S.addEventListener("change", (e2) => {
    gameState.settings.sfwMode = e2.target.checked;
    const t2 = $("sfwModeToggle");
    t2 && (t2.checked = e2.target.checked), I(), Ke(), saveGame(false), e2.target.checked ? showNotification("\u{1F6E1}\uFE0F SFW Mode enabled", "success") : showNotification("\u{1F513} SFW Mode disabled", "info");
  })), window.syncSettingsModalDisplays = k, autosaveToggle && autosaveToggle.addEventListener("change", (e2) => {
    gameState.settings.autosave = e2.target.checked, setupAutosave();
  });
  const T = $("enableStreamingToggle");
  function C() {
    const e2 = $("streamingStatusText");
    if (!e2) return;
    const t2 = gameState.settings?.enableStreamingResponses ?? true;
    e2.textContent = t2 ? "Streaming Enabled" : "Streaming Disabled", e2.style.color = t2 ? "var(--u)" : "var(--l)";
  }
  T && (T.checked = gameState.settings?.enableStreamingResponses ?? true, C(), T.addEventListener("change", (e2) => {
    gameState.settings.enableStreamingResponses = e2.target.checked, C(), saveGame(false), showNotification(e2.target.checked ? "\u{1F30A} Streaming enabled \u2014 AI responses now stream word-by-word" : "\u23F8\uFE0F Streaming disabled \u2014 AI responses appear all at once", "info");
  }));
  const E = $("sfwModeToggle");
  function I() {
    const e2 = $("sfwModeStatusText");
    e2 && (gameState.settings?.sfwMode ? (e2.textContent = "SFW Mode Active", e2.style.color = "var(--n)") : (e2.textContent = "NSFW Content Enabled", e2.style.color = "var(--l)"));
  }
  $("sfwModeStatusText"), E && (E.checked = gameState.settings?.sfwMode || false, I(), gameState.settings?.sfwMode && setTimeout(() => Ke(), 500), E.addEventListener("change", (e2) => {
    gameState.settings.sfwMode = e2.target.checked, I(), Ke(), saveGame(false), e2.target.checked ? showNotification("\u{1F6E1}\uFE0F SFW Mode enabled - All NSFW content has been hidden", "success") : showNotification("\u{1F513} SFW Mode disabled - Full content unlocked", "info");
  }));
  const M = $("disableStoryEventsToggle");
  function P() {
    const e2 = $("storyModeStatusText");
    e2 && (gameState.settings?.disableStoryEvents ? (e2.textContent = "Story & Events Disabled", e2.style.color = "var(--l)") : (e2.textContent = "Story & Events Enabled", e2.style.color = "var(--n)"));
  }
  function A() {
    const e2 = gameState.settings?.disableStoryEvents, t2 = document.querySelector('.tab-btn[data-tab="story"]');
    if (t2 && (t2.style.display = e2 ? "none" : "", e2 && t2.classList.contains("active"))) {
      const e3 = document.querySelector('.tab-btn[data-tab="dashboard"]');
      e3 && e3.click();
    }
    const n2 = document.getElementById("eventBellBtn");
    if (n2 && (n2.style.display = e2 ? "none" : ""), e2) {
      const e3 = document.getElementById("eventBellDot"), t3 = document.getElementById("eventBellCount");
      e3 && (e3.style.display = "none"), t3 && (t3.style.display = "none"), gameState.dynamicEvents && (gameState.dynamicEvents.queue = []);
    }
  }
  $("storyModeStatusText"), M && (M.checked = gameState.settings?.disableStoryEvents || false, P(), A(), M.addEventListener("change", (e2) => {
    gameState.settings.disableStoryEvents = e2.target.checked, gameState.story?.settings && (gameState.story.settings.storyEnabled = !e2.target.checked), P(), A(), saveGame(false), e2.target.checked ? showNotification("\u{1F4D6} Story Mode & Events disabled - Pure sandbox mode activated", "info") : showNotification("\u{1F4D6} Story Mode & Events enabled - Narrative features restored", "success");
  }));
  const N = $("customCompanyContext"), L = $("customWorldContext"), _ = $("customAIContext"), R = $("saveCustomContextBtn"), D = $("customContextStatus");
  N && gameState.settings?.customContext?.company && (N.value = gameState.settings.customContext.company), L && gameState.settings?.customContext?.world && (L.value = gameState.settings.customContext.world), _ && gameState.settings?.customContext?.aiNotes && (_.value = gameState.settings.customContext.aiNotes), R && R.addEventListener("click", () => {
    gameState.settings.customContext || (gameState.settings.customContext = { company: "", world: "", aiNotes: "" }), gameState.settings.customContext.company = N?.value?.trim() || "", gameState.settings.customContext.world = L?.value?.trim() || "", gameState.settings.customContext.aiNotes = _?.value?.trim() || "", saveGame(false), D && (D.style.display = "block", setTimeout(() => {
      D.style.display = "none";
    }, 3e3)), gameState.settings.customContext.company || gameState.settings.customContext.world || gameState.settings.customContext.aiNotes ? showNotification("\u{1F30D} Custom world context saved! NPCs will now reference your settings.", "success") : showNotification("\u{1F30D} Custom context cleared. NPCs will use default settings.", "info");
  });
  const F = $("postsPerPageSlider"), U2 = $("postsPerPageValue");
  if (F && U2 && (F.addEventListener("input", (e2) => {
    const t2 = parseInt(e2.target.value);
    yg.postsPerPage = t2, U2.textContent = t2, gameState.settings.performance || (gameState.settings.performance = {}), gameState.settings.performance.postsPerPage = t2;
    const n2 = $("socialTab");
    (n2 && !n2.classList.contains("tab-content") || n2 && "none" !== n2.style.display) && renderSocialFeed(true);
  }), gameState.settings.performance?.postsPerPage)) {
    const Io2 = gameState.settings.performance.postsPerPage;
    F.value = Io2, U2.textContent = Io2, yg.postsPerPage = Io2;
  }
  const B = $("maxAiRequestsSlider"), O = $("maxAiRequestsValue");
  if (B && O) {
    B.addEventListener("input", (e2) => {
      const t2 = parseInt(e2.target.value);
      AIRequestQueue.updateMaxConcurrent(t2), O.textContent = t2;
    });
    const Mo2 = gameState.settings?.maxAiRequests || 15;
    B.value = Mo2, O.textContent = Mo2, AIRequestQueue.updateMaxConcurrent(Mo2);
  }
  const q = $("maxImageRequestsSlider"), z = $("maxImageRequestsValue");
  if (q && z) {
    q.addEventListener("input", (e2) => {
      const t2 = parseInt(e2.target.value);
      ImageRequestQueue.updateMaxConcurrent(t2), z.textContent = t2;
    });
    const Da = gameState.settings?.maxImageRequests || 8;
    q.value = Da, z.textContent = Da, ImageRequestQueue.updateMaxConcurrent(Da);
  }
  const j = $("chatSettingsBtn"), H = $("chatSettingsPanel");
  j && H && j.addEventListener("click", () => {
    const e2 = "none" === H.style.display;
    H.style.display = e2 ? "block" : "none";
  }), document.querySelectorAll('input[name="chatCommMode"]').forEach((e2) => {
    e2.addEventListener("change", (e3) => {
      if (gameState.activeChat) {
        const t2 = e3.target.value;
        gameState.activeChat.chatCommMode = t2;
        const n2 = gameState.activeChat.id, a2 = gameState.employees.find((e4) => e4.id === n2);
        a2 && (a2.chatCommMode = t2, a2.lastPlayerMessageTime = gameState.time?.currentTime || Date.now()), console.log(`[Chat] Communication mode for ${gameState.activeChat.name} set to:`, t2), saveGame(false);
      }
    });
  });
  const J2 = $("chatWidthSlider2"), Y = $("chatWidthValue2");
  J2 && Y && (J2.addEventListener("input", (e2) => {
    const t2 = parseInt(e2.target.value);
    gameState.settings.chatWidth = t2, Y.textContent = `${t2}px`, Z();
  }), gameState.settings.chatWidth && (J2.value = gameState.settings.chatWidth, Y.textContent = `${gameState.settings.chatWidth}px`));
  const W = $("chatHeightSlider2"), V = $("chatHeightValue2");
  W && V && (W.addEventListener("input", (e2) => {
    const t2 = parseInt(e2.target.value);
    gameState.settings.chatHeight = t2, V.textContent = `${t2}%`, Z();
  }), gameState.settings.chatHeight && (W.value = gameState.settings.chatHeight, V.textContent = `${gameState.settings.chatHeight}%`));
  const K = $("textSizeSlider2"), Q = $("textSizeValue2");
  K && Q && (K.addEventListener("input", (e2) => {
    const t2 = parseInt(e2.target.value);
    gameState.settings.textSize = t2, Q.textContent = `${t2}%`, Z();
  }), gameState.settings.textSize && (K.value = gameState.settings.textSize, Q.textContent = `${gameState.settings.textSize}%`));
  const ee2 = $("imagePreviewSizeSlider2"), X = $("imagePreviewSizeValue2");
  function Z() {
    const e2 = $("chatContainer");
    if (!e2) return;
    if (function() {
      const e3 = window.innerWidth <= 768, t3 = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      return e3 && t3;
    }()) return e2.style.setProperty("width", "90%", "important"), e2.style.setProperty("max-width", "500px", "important"), void e2.style.setProperty("height", "95%", "important");
    const t2 = gameState.settings.chatWidth || 500, n2 = gameState.settings.chatHeight || 95, a2 = gameState.settings.textSize || 100, o2 = gameState.settings.imagePreviewSize || 300;
    e2.style.setProperty("width", `${t2}px`, "important"), e2.style.setProperty("max-width", `${t2}px`, "important"), e2.style.setProperty("height", `${n2}%`, "important");
    const i2 = $("chatMessages");
    i2 && i2.style.setProperty("font-size", `${a2}%`, "important"), i2 && (i2.querySelectorAll('div[style*="position:relative"][style*="inline-block"]').forEach((e3) => {
      e3.style.setProperty("max-width", `${o2}px`, "important");
      const t3 = e3.parentElement;
      if (t3) {
        const e4 = `${o2 + 40}px`;
        t3.style.setProperty("max-width", e4, "important");
      }
    }), i2.querySelectorAll("img").forEach((e3) => {
      e3.style.setProperty("max-width", `${o2}px`, "important");
    }));
  }
  ee2 && X && (ee2.addEventListener("input", (e2) => {
    const t2 = parseInt(e2.target.value);
    gameState.settings.imagePreviewSize = t2, X.textContent = `${t2}px`, Z();
  }), gameState.settings.imagePreviewSize && (ee2.value = gameState.settings.imagePreviewSize, X.textContent = `${gameState.settings.imagePreviewSize}px`)), Z();
  const te2 = $("imageStyleSelect"), ne2 = $("customPromptContainer"), oe2 = $("customStylePrompt");
  te2 && (te2.addEventListener("change", (e2) => {
    const t2 = e2.target.value;
    gameState.settings.imageStyle = t2, ne2 && (ne2.style.display = "custom" === t2 ? "block" : "none"), showNotification(`\u{1F3A8} Image style set to: ${e2.target.options[e2.target.selectedIndex].text}`, "success");
  }), gameState.settings.imageStyle && (te2.value = gameState.settings.imageStyle, ne2 && "custom" === gameState.settings.imageStyle && (ne2.style.display = "block"))), oe2 && (oe2.addEventListener("input", (e2) => {
    gameState.settings.customStylePrompt = e2.target.value;
  }), gameState.settings.customStylePrompt && (oe2.value = gameState.settings.customStylePrompt));
  const ae2 = $("imagePerspectiveSelect");
  ae2 && (ae2.addEventListener("change", (e2) => {
    gameState.settings.imagePerspective = e2.target.value, showNotification(`\u{1F441}\uFE0F Image perspective set to: ${e2.target.options[e2.target.selectedIndex].text}`, "success");
  }), gameState.settings.imagePerspective && (ae2.value = gameState.settings.imagePerspective)), gameState.settings.autoVisualization || (gameState.settings.autoVisualization = { enabled: false, minFrequency: 5, maxFrequency: 10, style: "global", perspective: "dynamic", nsfwLevel: "match", totalGenerated: 0 });
  const ie2 = $("autoVisualizeEnabled");
  ie2 && (ie2.addEventListener("change", (e2) => {
    gameState.settings.autoVisualization.enabled = e2.target.checked, updateAutoVisualizeStatus(), showNotification(e2.target.checked ? "\u{1F3AC} Auto-Visualization enabled!" : "\u{1F3AC} Auto-Visualization disabled", "success");
  }), ie2.checked = gameState.settings.autoVisualization.enabled);
  const se2 = $("autoVisualizeMinFreq"), le2 = $("autoVisualizeMinFreqValue"), re = $("autoVisualizeMaxFreq"), de2 = $("autoVisualizeMaxFreqValue");
  if (se2 && le2) {
    se2.addEventListener("input", (e2) => {
      let t2 = parseInt(e2.target.value), n2 = parseInt(re?.value || 10);
      t2 > n2 && (t2 = n2, e2.target.value = t2), gameState.settings.autoVisualization.minFrequency = t2, le2.textContent = t2, Lf();
    });
    let Po2 = gameState.settings.autoVisualization.minFrequency, Ao2 = gameState.settings.autoVisualization.maxFrequency;
    Po2 > Ao2 && (Po2 = Ao2, gameState.settings.autoVisualization.minFrequency = Po2), se2.value = Po2, le2.textContent = Po2;
  }
  re && de2 && (re.addEventListener("input", (e2) => {
    let t2 = parseInt(e2.target.value), n2 = parseInt(se2?.value || 5);
    t2 < n2 && (t2 = n2, e2.target.value = t2), gameState.settings.autoVisualization.maxFrequency = t2, de2.textContent = t2, Lf();
  }), re.value = gameState.settings.autoVisualization.maxFrequency, de2.textContent = gameState.settings.autoVisualization.maxFrequency);
  const ue2 = $("autoVisualizeStyle");
  ue2 && (ue2.addEventListener("change", (e2) => {
    gameState.settings.autoVisualization.style = e2.target.value, showNotification(`\u{1F3A8} Auto-visualization style: ${e2.target.options[e2.target.selectedIndex].text}`, "success");
  }), ue2.value = gameState.settings.autoVisualization.style);
  const pe2 = $("autoVisualizePerspective");
  pe2 && (pe2.addEventListener("change", (e2) => {
    gameState.settings.autoVisualization.perspective = e2.target.value, showNotification(`\u{1F441}\uFE0F Auto-visualization perspective: ${e2.target.options[e2.target.selectedIndex].text}`, "success");
  }), pe2.value = gameState.settings.autoVisualization.perspective);
  const ge2 = $("autoVisualizeNSFW");
  ge2 && (ge2.addEventListener("change", (e2) => {
    gameState.settings.autoVisualization.nsfwLevel = e2.target.value;
  }), ge2.value = gameState.settings.autoVisualization.nsfwLevel);
  const me = $("autoVisualizeCustomPrompt");
  me && (me.addEventListener("input", (e2) => {
    gameState.settings.autoVisualization.customPrompt = e2.target.value;
  }), me.value = gameState.settings.autoVisualization.customPrompt || "");
  const fe2 = $("autoVisAddToGallery");
  fe2 && (fe2.addEventListener("change", (e2) => {
    gameState.settings.autoVisualization.addToGallery = e2.target.checked;
  }), fe2.checked = false !== gameState.settings.autoVisualization.addToGallery);
  const xe2 = $("autoVisCooldownAfterManual");
  xe2 && (xe2.addEventListener("change", (e2) => {
    gameState.settings.autoVisualization.cooldownAfterManual = e2.target.checked;
  }), xe2.checked = false !== gameState.settings.autoVisualization.cooldownAfterManual);
  const he = $("autoVisIntensityDetection"), ke2 = $("intensityThresholdContainer");
  he && (he.addEventListener("change", (e2) => {
    gameState.settings.autoVisualization.intensityDetection = e2.target.checked, ke2 && (ke2.style.opacity = e2.target.checked ? "1" : "0.5", ke2.style.pointerEvents = e2.target.checked ? "auto" : "none"), showNotification(e2.target.checked ? "\u{1F9EA} Intensity Detection enabled" : "\u{1F9EA} Intensity Detection disabled", 2e3);
  }), he.checked = gameState.settings.autoVisualization.intensityDetection || false, ke2 && (ke2.style.opacity = he.checked ? "1" : "0.5", ke2.style.pointerEvents = he.checked ? "auto" : "none"));
  const Se2 = $("autoVisIntensityThreshold"), be = $("autoVisIntensityThresholdValue");
  Se2 && be && (Se2.addEventListener("input", (e2) => {
    const t2 = parseInt(e2.target.value);
    gameState.settings.autoVisualization.intensityThreshold = t2, be.textContent = t2;
  }), Se2.value = gameState.settings.autoVisualization.intensityThreshold || 50, be.textContent = gameState.settings.autoVisualization.intensityThreshold || 50), window.updateAutoVisualizeStatus = function() {
    const e2 = $("autoVisualizeStatus"), t2 = $("autoVisualizeCount");
    e2 && gameState.settings?.autoVisualization && (e2.textContent = gameState.settings.autoVisualization.enabled ? "Active" : "Disabled", e2.style.color = gameState.settings.autoVisualization.enabled ? "var(--n)" : "var(--ar)"), t2 && gameState.settings?.autoVisualization && (t2.textContent = gameState.settings.autoVisualization.totalGenerated || 0);
  }, window.updateAutoVisualizeStatus(), gameState.cheatMultipliers || (gameState.cheatMultipliers = { affection: 1, trust: 1, comfort: 1, desire: 1, productivity: 1, confidence: 1, obedience: 1, flirty: 1, professional: 1, humor: 1 });
  const ve = $("openCheatsBtn"), we = $("closeCheatsBtn"), $e2 = $("cheatsModal");
  ve && $e2 && ve.addEventListener("click", () => {
    $e2.style.display = "flex", lt(), yt2();
  }), we && $e2 && we.addEventListener("click", () => {
    $e2.style.display = "none";
  }), $e2 && $e2.addEventListener("click", (e2) => {
    e2.target === $e2 && ($e2.style.display = "none");
  });
  const Ce2 = $("openPatchNotesBtn"), Ee2 = $("closePatchNotesBtn"), Te = $("patchNotesModal");
  Ce2 && Te && Ce2.addEventListener("click", () => {
    Te.style.display = "flex", $v();
  }), Ee2 && Te && Ee2.addEventListener("click", () => {
    Te.style.display = "none";
  }), Te && Te.addEventListener("click", (e2) => {
    e2.target === Te && (Te.style.display = "none");
  });
  const Ie2 = $("cheatMoneyBase"), Pe2 = $("cheatMoneyMagnitude"), Ae2 = $("cheatMoneyPreview"), Ne2 = $("cheatSetMoneyBtn");
  function Me() {
    if (!Ie2 || !Pe2 || !Ae2) return;
    const e2 = (parseInt(Ie2.value) || 100) * (parseInt(Pe2.value) || 1e6);
    Ae2.textContent = e2.toLocaleString();
  }
  Ie2 && Ie2.addEventListener("input", Me), Pe2 && Pe2.addEventListener("change", Me), Ne2 && Ie2 && Pe2 && Ne2.addEventListener("click", () => {
    const e2 = (parseInt(Ie2.value) || 100) * (parseInt(Pe2.value) || 1e6);
    gameState.cash = e2, showNotification(`\u{1F4B0} Money set to $${e2.toLocaleString()}!`, "success"), updateUI();
  });
  const _e2 = ["affection", "trust", "comfort", "desire", "productivity", "confidence", "obedience", "flirtiness", "professionalism", "humor"];
  _e2.forEach((e2) => {
    const t2 = $(`${e2}MultSlider`), n2 = $(`${e2}MultValue`);
    if (t2 && n2) {
      t2.addEventListener("input", (t3) => {
        const a3 = parseFloat(t3.target.value) / 10;
        gameState.cheatMultipliers[e2] = a3, n2.textContent = `${a3.toFixed(1)}x`;
      });
      const a2 = gameState.cheatMultipliers[e2] || 1;
      t2.value = 10 * a2, n2.textContent = `${a2.toFixed(1)}x`;
    }
  });
  const Oe2 = $("resetMultipliersBtn");
  Oe2 && Oe2.addEventListener("click", () => {
    _e2.forEach((e2) => {
      gameState.cheatMultipliers[e2] = 1;
      const t2 = $(`${e2}MultSlider`), n2 = $(`${e2}MultValue`);
      t2 && (t2.value = 10), n2 && (n2.textContent = "1.0x");
    }), showNotification("\u{1F504} All multipliers reset to 1x", "info");
  });
  const Fe2 = $("maxMultipliersBtn");
  Fe2 && Fe2.addEventListener("click", () => {
    _e2.forEach((e2) => {
      gameState.cheatMultipliers[e2] = 5;
      const t2 = $(`${e2}MultSlider`), n2 = $(`${e2}MultValue`);
      t2 && (t2.value = 50), n2 && (n2.textContent = "5.0x");
    }), showNotification("\u26A1 All multipliers set to 5x!", "success");
  });
  const Le = $("cheatStatType"), je2 = $("cheatStatValue"), Re = $("cheatSetStatBtn");
  Re && Le && je2 && Re.addEventListener("click", () => {
    const e2 = Le.value, t2 = parseInt(je2.value);
    if (t2 < 0 || t2 > 100) return void showNotification("\u26A0\uFE0F Value must be between 0 and 100", "error");
    let n2 = 0;
    gameState.employees.forEach((a2) => {
      "active" === a2.employmentStatus && (["affection", "trust", "comfort", "desire", "productivity"].includes(e2) ? (a2.stats || (a2.stats = {}), a2.stats[e2] = t2, n2++) : ["confidence", "obedience", "flirty", "professional", "humor"].includes(e2) && (a2.personality || (a2.personality = {}), a2.personality[e2] = t2, n2++));
    }), showNotification(`\u2705 Set ${e2} to ${t2} for ${n2} employees!`, "success");
  });
  const De = $("cheatMaxAllStatsBtn");
  De && De.addEventListener("click", () => {
    let e2 = 0;
    gameState.employees.forEach((t2) => {
      "active" === t2.employmentStatus && (t2.stats || (t2.stats = {}), t2.stats.affection = 100, t2.stats.trust = 100, t2.stats.comfort = 100, t2.stats.desire = 100, t2.stats.productivity = 100, t2.personality || (t2.personality = {}), t2.personality.confidence = 100, t2.personality.obedience = 100, t2.personality.flirty = 100, t2.personality.professional = 100, t2.personality.humor = 100, e2++);
    }), showNotification(`\u{1F31F} Maxed all stats for ${e2} employees!`, "success");
  });
  const qe2 = $("cheatUnlockAllLocationsBtn");
  qe2 && qe2.addEventListener("click", () => {
    let e2 = 0;
    gameState.locations.forEach((t2) => {
      t2.owned || (t2.owned = true, t2.unlocked = true, e2++);
    }), showNotification(`\u{1F3E2} Unlocked ${e2} locations!`, "success"), renderLocations();
  });
  const ze2 = $("cheatUnlockAllProductsBtn");
  ze2 && ze2.addEventListener("click", () => {
    let e2 = 0;
    gameState.products.forEach((t2) => {
      t2.unlocked || (t2.unlocked = true, e2++);
    }), showNotification(`\u{1F4E6} Unlocked ${e2} products!`, "success"), renderProducts();
  });
  const Be = $("cheatHireAllBtn");
  Be && Be.addEventListener("click", () => {
    if (!gameState.candidates || 0 === gameState.candidates.length) return void showNotification("\u26A0\uFE0F No candidates available to hire!", "error");
    const e2 = gameState.candidates.filter((e3) => !e3.hired);
    e2.forEach((e3) => {
      e3.hired = true, e3.employmentStatus = "active", e3.hireDate = Date.now(), e3.bioComplete = true, e3.onboarding = false, initializeEmployeeSocialData(e3), gameState.employees.push(e3), generateRandomRelationships(e3.id);
    }), gameState.candidates = gameState.candidates.filter((e3) => e3.hired), showNotification(`\u{1F465} Hired ${e2.length} candidates!`, "success"), updateCompanyAwareness();
  });
  const Ge2 = $("cheatClearPostsBtn");
  Ge2 && Ge2.addEventListener("click", () => {
    const e2 = gameState.socialNetwork.posts.length;
    gameState.socialNetwork.posts = [], gameState.socialNetwork.postIdCounter = 0, gameState.socialNetwork.lastPostGeneration = 0, gameState.socialNetwork.recentPostTypes = [], gameState.socialNetwork.globalEvents = [], gameState.socialNetwork.playerDraft && (gameState.socialNetwork.playerDraft = { caption: "", imagePrompt: "", altText: "", imageUrl: null }), gameState.socialFeed = [], gameState.socialStats = { totalPosts: 0, totalLikes: 0, totalComments: 0 }, void 0 !== yg && (yg.currentPage = 1, yg.totalPages = 1, yg.allPosts = [], yg.pendingUpdates.clear()), saveGame(false), showNotification(`\u{1F5D1}\uFE0F Cleared ${e2} posts! Social feed reset.`, "info"), "social" === gameState.activeTab && renderSocialFeed(true);
  });
  const Ue2 = $("cheatSpawnPostsBtn");
  Ue2 && Ue2.addEventListener("click", async () => {
    const e2 = gameState.employees.filter((e3) => "active" === e3.employmentStatus);
    if (0 === e2.length) return void showNotification("\u26A0\uFE0F No active employees to create posts!", "error");
    showNotification("\u{1F4F1} Generating 10 NPC posts...", "info");
    const t2 = ["Coffee break! \u2615", "Busy day at work \u{1F4BC}", "Finally done with that project! \u{1F389}", "Anyone else tired? \u{1F634}", "Looking forward to the weekend! \u{1F334}", "Great teamwork today! \u{1F44F}", "Just finished a meeting \u{1F4CA}", "Time flies when you're working hard \u23F0", "Loving the office vibes today! \u{1F4AF}", "Can't believe it's already this late! \u{1F605}", "Productive day! \u2705", "Office life be like... \u{1F937}", "Happy to be here! \u{1F60A}", "Made some progress today \u{1F4C8}", "Working on something exciting! \u{1F680}", "Team lunch was great! \u{1F354}", "Another milestone reached! \u{1F3AF}", "Feeling accomplished today \u{1F4AA}", "Good vibes only! \u2728", "Grateful for this team! \u{1F64F}", "Accidentally said 'you too' when the delivery guy said 'enjoy your food' \u{1F480}", "That 3pm slump is REAL today \u{1F629}", "Someone brought donuts and I have zero self-control \u{1F369}", "Just had the best idea in the shower... forgot it by the time I got out \u{1F6BF}\u{1F622}", "Why does my to-do list keep getting longer instead of shorter \u{1F4DD}", "New playlist, new energy, new me (until tomorrow) \u{1F3B5}", "Overheard the funniest conversation in the break room today \u{1F602}", "Started a book last night and accidentally stayed up until 3am \u{1F4DA}", "My plant is still alive after 2 months, basically a green thumb now \u{1F331}", "That feeling when your code works on the first try \u{1F92F}", "Trying a new recipe tonight, pray for my kitchen \u{1F64F}\u{1F373}", "The sunset from my window right now is unreal \u{1F305}", "Just found out we have a nap room and my life is changed forever \u{1F634}", "Motivation levels: exists, but barely \u{1F4C9}", "Had the weirdest dream last night and I need to talk about it \u{1F602}", "Sometimes you just need a long walk and a good podcast \u{1F3A7}", "Counting down to vacation like my life depends on it \u2708\uFE0F", "The audacity of my alarm clock this morning... \u{1F624}\u23F0", "Personal growth is realizing I don't have to reply to that email right now \u{1F485}", "Comfort food and a good show = perfect evening \u{1F6CB}\uFE0F\u{1F355}"];
    for (let n2 = 0; n2 < 10; n2++) {
      const n3 = e2[Math.floor(Math.random() * e2.length)], a2 = t2[Math.floor(Math.random() * t2.length)];
      createSocialPost({ authorId: n3.id, authorName: n3.name, type: "life_update", content: a2, timestamp: gameState.time.currentTime, likes: [], comments: [], mentions: [] });
    }
    showNotification("\u2705 Generated 10 NPC posts!", "success"), "social" === gameState.activeTab && renderSocialFeed(true);
  });
  const Ve2 = $("timeScaleSlider"), Je2 = $("timeScaleValue"), He = $("timeScaleDescription");
  if (Ve2 && Je2 && He) {
    const _o2 = (e2) => {
      Je2.textContent = `${e2}x`;
      let t2 = "";
      t2 = 1 === e2 ? "Real-time (1:1) - Extremely slow!" : e2 <= 10 ? `${e2} game minutes = 1 real minute (Slow)` : e2 <= 30 ? `${e2} game minutes = 1 real minute (Normal)` : e2 <= 60 ? `${e2} game minutes = 1 real minute (Fast)` : `${e2} game minutes = 1 real minute (Very Fast!)`, He.textContent = t2;
    }, Ro2 = gameState.time.baseTimeScale || gameState.time.timeScale || 20;
    _o2(Ro2), Ve2.value = Ro2, Ve2.addEventListener("input", (e2) => {
      const t2 = parseInt(e2.target.value);
      _o2(t2), gameState.time.timeScale = t2, gameState.time.baseTimeScale = t2, gameState.time.timeDilation && (gameState.time.timeDilation.idleScale = t2), showNotification(`\u23F0 Base time scale set to ${t2}x (slower during conversations)`, "info");
    });
  }
  document.querySelectorAll(".time-preset-btn").forEach((e2) => {
    e2.addEventListener("click", () => {
      const t2 = parseInt(e2.dataset.scale);
      Ve2 && (Ve2.value = t2, Ve2.dispatchEvent(new Event("input")));
    });
  });
  const Qe2 = $("pauseTimeBtn");
  Qe2 && Qe2.addEventListener("click", () => {
    gameState.time.paused = !gameState.time.paused, gameState.time.paused ? (Qe2.innerHTML = "\u25B6\uFE0F Resume Time", Qe2.style.background = "linear-gradient(135deg, var(--n) 0%, var(--u) 100%)", showNotification("\u23F8\uFE0F Time paused", "info")) : (Qe2.innerHTML = "\u23F8\uFE0F Pause Time", Qe2.style.background = "linear-gradient(135deg, var(--l) 0%, var(--v) 100%)", showNotification("\u25B6\uFE0F Time resumed", "info")), rt2();
  });
  const Ye = $("skipTimeBtn");
  Ye && Ye.addEventListener("click", () => {
    gameState.time.currentTime += 864e5, window.onDayChange && window.onDayChange(), showNotification("\u23ED\uFE0F Skipped forward 1 day!", "success"), rt2(), ea();
  }), Object.entries({ skipTime1HrBtn: 1, skipTime3HrBtn: 3, skipTime8HrBtn: 8 }).forEach(([e2, t2]) => {
    const n2 = $(e2);
    n2 && n2.addEventListener("click", () => {
      const e3 = 60 * t2 * 60 * 1e3;
      if (gameState.time.currentTime += e3, window.onHourChange) for (let e4 = 0; e4 < t2; e4++) window.onHourChange();
      showNotification(`\u23E9 Skipped forward ${t2} hour${t2 > 1 ? "s" : ""}!`, "success"), rt2(), ea();
    });
  });
  const We = $("timeDilationEnabled"), Xe2 = $("timeDilationSettings");
  We && gameState.time && gameState.time.timeDilation && (We.checked = false !== gameState.time.timeDilation.enabled, Xe2 && (Xe2.style.opacity = We.checked ? "1" : "0.5", Xe2.style.pointerEvents = We.checked ? "auto" : "none")), We && We.addEventListener("change", (e2) => {
    const t2 = e2.target.checked;
    gameState.time && gameState.time.timeDilation && (gameState.time.timeDilation.enabled = t2), Xe2 && (Xe2.style.opacity = t2 ? "1" : "0.5", Xe2.style.pointerEvents = t2 ? "auto" : "none"), showNotification(t2 ? "\u23F3 Time dilation enabled - time slows during conversations" : "\u23F3 Time dilation disabled - constant time speed", "info");
  });
  const Ze2 = $("conversationTimeScale");
  Ze2 && gameState.time && gameState.time.timeDilation && (Ze2.value = gameState.time.timeDilation.conversationScale || 1, Ze2.addEventListener("change", (e2) => {
    const t2 = Math.max(1, Math.min(20, parseInt(e2.target.value) || 1));
    e2.target.value = t2, gameState.time.timeDilation.conversationScale = t2, showNotification(`\u{1F4AC} Conversation time scale: ${t2}x`, "info");
  }));
  const et2 = $("groupChatTimeScale");
  et2 && gameState.time && gameState.time.timeDilation && (et2.value = gameState.time.timeDilation.groupChatScale || 2, et2.addEventListener("change", (e2) => {
    const t2 = Math.max(1, Math.min(20, parseInt(e2.target.value) || 2));
    e2.target.value = t2, gameState.time.timeDilation.groupChatScale = t2, showNotification(`\u{1F465} Group chat time scale: ${t2}x`, "info");
  }));
  const tt2 = $("socialBrowsingTimeScale");
  function nt2() {
    const e2 = $("scheduledEventsList"), t2 = $("scheduledEventsCount");
    if (!e2) return;
    const n2 = (gameState.npcScheduledEvents || []).filter((e3) => "pending" === e3.status);
    if (n2.sort((e3, t3) => e3.triggerTime - t3.triggerTime), t2 && (t2.textContent = `(${n2.length} pending)`), 0 === n2.length) return void (e2.innerHTML = '<p style="color:var(--e); text-align:center; margin:10px 0; font-size:0.85rem;">No pending events</p>');
    const a2 = gameState.time?.currentTime || Date.now();
    e2.innerHTML = n2.map((e3) => {
      new Date(e3.triggerTime);
      const t3 = e3.triggerTime - a2, n3 = Math.floor(t3 / 36e5), o2 = Math.floor(t3 % 36e5 / 6e4);
      let i2 = "";
      if (n3 > 24) {
        const e4 = Math.floor(n3 / 24);
        i2 = `in ${e4} day${e4 > 1 ? "s" : ""}`;
      } else i2 = n3 > 0 ? `in ${n3}h ${o2}m` : o2 > 0 ? `in ${o2}m` : "soon!";
      const s2 = { future_contact: "\u{1F4AC}", same_day_meet: "\u{1F91D}", lunch_meet: "\u{1F37D}\uFE0F", confirm_plans: "\u2705", scheduled_visit: "\u{1F3E2}", conditional_contact: "\u2753", relative_time: "\u23F0", weekend_plans: "\u{1F389}", next_week: "\u{1F4C6}" }[e3.type] || "\u{1F4C5}", r2 = "player" === e3.source ? "\u{1F464}" : "\u{1F916}";
      return ` <div style="padding:8px; margin-bottom:6px; background:var(--h); border-radius:6px; border-left:3px solid ${"player" === e3.source ? "var(--n)" : "var(--cl)"};"> <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px;"> <span style="color:var(--b); font-weight:600; font-size:0.85rem;">${s2} ${e3.npcName}</span> <span style="color:var(--a); font-size:0.75rem;">${r2} ${i2}</span> </div> <div style="color:var(--e); font-size:0.8rem; margin-bottom:4px;">${e3.type.replace(/_/g, " ")}</div> <div style="color:var(--e); font-size:0.75rem; font-style:italic; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">"${e3.originalPhrase}"</div> <button onclick="cancelScheduledEvent('${e3.id}'); refreshScheduledEventsPanel();" style="margin-top:6px; padding:2px 8px; background:var(--l); border:none; border-radius:4px; color:var(--s); cursor:pointer; font-size:0.7rem;"> \u274C Cancel </button> </div> `;
    }).join("");
  }
  tt2 && gameState.time && gameState.time.timeDilation && (tt2.value = gameState.time.timeDilation.socialBrowsingScale || 10, tt2.addEventListener("change", (e2) => {
    const t2 = Math.max(1, Math.min(50, parseInt(e2.target.value) || 10));
    e2.target.value = t2, gameState.time.timeDilation.socialBrowsingScale = t2, showNotification(`\u{1F4F1} Social browsing time scale: ${t2}x`, "info");
  })), window.refreshScheduledEventsPanel = nt2;
  const ot2 = $("refreshScheduledEventsBtn");
  function rt2() {
    const e2 = $("cheatGameTime"), t2 = $("cheatTimeStatus");
    if (e2 && gameState.time) {
      const t3 = new Date(gameState.time.currentTime);
      e2.textContent = t3.toLocaleString();
    }
    t2 && gameState.time && (gameState.time.paused ? (t2.textContent = "Paused", t2.style.color = "var(--l)") : (t2.textContent = `Running (${gameState.time.timeScale}x)`, t2.style.color = "var(--n)"));
  }
  ot2 && ot2.addEventListener("click", nt2);
  let ct2 = null;
  const dt2 = $("openCheatsBtn"), at = $("closeCheatsBtn");
  dt2 && dt2.addEventListener("click", () => {
    setTimeout(() => {
      rt2(), nt2(), ct2 = setInterval(rt2, 1e3);
    }, 100);
  }), at && at.addEventListener("click", () => {
    ct2 && (clearInterval(ct2), ct2 = null);
  });
  const ut2 = $("cheatRefreshContextBtn");
  ut2 && ut2.addEventListener("click", () => {
    lt();
  });
  const it = $("cheatClearContextBtn");
  it && it.addEventListener("click", async () => {
    await Ev("Clear all Company-Wide Context items? NPCs will forget all recent company events.", "Clear Context", { type: "warning", confirmText: "Clear All" }) && (gameState.companyWideContext.currentBuzz = [], lt(), showNotification("\u{1F5D1}\uFE0F Company-Wide Context cleared!", "info"));
  });
  const st = $("cheatRefreshGossipBtn");
  st && st.addEventListener("click", () => {
    yt2();
  });
  const ht2 = $("cheatClearGossipBtn");
  function lt() {
    const e2 = $("contextList"), t2 = $("contextCountLabel");
    if (!e2 || !t2) return;
    const n2 = gameState.companyWideContext?.currentBuzz || [];
    if (t2.textContent = `(${n2.length}/${gameState.companyWideContext?.maxItems || 40})`, 0 === n2.length) return void (e2.innerHTML = '<p style="color:var(--a); text-align:center; margin:20px 0;">No context items yet</p>');
    const a2 = [...n2].sort((e3, t3) => t3.timestamp - e3.timestamp);
    e2.innerHTML = a2.map((e3, t3) => {
      const n3 = vt2(e3.timestamp), a3 = e3.juiciness || 0;
      return ` <div style="background:var(--f); border-radius:8px; padding:12px; margin-bottom:8px; border-left:3px solid ${a3 > 70 ? "var(--l)" : a3 > 40 ? "var(--z)" : "var(--u)"};"> <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:6px;"> <div style="flex:1;"> <div style="color:var(--y); font-size:0.95rem; line-height:1.4; margin-bottom:6px;">${e3.info}</div> <div style="display:flex; gap:12px; font-size:0.8rem; color:var(--a);"> <span>\u{1F525} ${a3}/100</span> <span>\u23F0 ${n3}</span> ${e3.involvedEmployees ? `<span>\u{1F465} ${e3.involvedEmployees.length}</span>` : ""} </div> </div> <button onclick="removeContextItem(${t3})" style="background:var(--l); border:none; padding:6px 10px; border-radius:6px; color:var(--s); cursor:pointer; font-size:0.8rem; margin-left:8px;"> \u{1F5D1}\uFE0F </button> </div> </div> `;
    }).join("");
  }
  function yt2() {
    const e2 = $("gossipList"), t2 = $("gossipCountLabel");
    if (!e2 || !t2) return;
    const n2 = gameState.employees.filter((e3) => "active" === e3.employmentStatus).filter((e3) => e3.gossip && e3.gossip.knownGossip && e3.gossip.knownGossip.length > 0);
    t2.textContent = `(${n2.length} NPCs)`, 0 !== n2.length ? e2.innerHTML = n2.map((e3) => {
      const t3 = e3.gossip?.knownGossip || [], n3 = t3.length;
      return ` <div style="background:var(--f); border-radius:8px; padding:12px; margin-bottom:12px; border:1px solid var(--cl);"> <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;"> <div style="display:flex; align-items:center; gap:10px;"> <img src="${e3.profileImage || "https://placehold.co/40x40"}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;"> <div> <div style="color:var(--b); font-weight:600;">${e3.name}</div> <div style="color:var(--a); font-size:0.85rem;">${n3} gossip item${1 !== n3 ? "s" : ""}</div> </div> </div> <button onclick="clearEmployeeGossip('${e3.id}')" style="background:var(--l); border:none; padding:6px 12px; border-radius:6px; color:var(--s); cursor:pointer; font-size:0.8rem;"> Clear </button> </div> <div style="max-height:150px; overflow-y:auto;"> ${t3.slice(0, 5).map((e4) => {
        const t4 = vt2(e4.timestamp || e4.heardAt || Date.now());
        return ` <div style="background:var(--h); border-radius:6px; padding:8px; margin-bottom:6px; border-left:2px solid ${e4.juiciness > 70 ? "var(--l)" : e4.juiciness > 40 ? "var(--z)" : "var(--u)"};"> <div style="color:var(--y); font-size:0.9rem; margin-bottom:4px;">${e4.content || e4.info || e4.description || "Unknown gossip"}</div> <div style="display:flex; gap:8px; font-size:0.75rem; color:var(--a);"> <span>\u{1F525} ${e4.juiciness || 0}</span> <span>\u23F0 ${t4}</span> ${e4.source ? `<span>\u{1F4E2} ${e4.source}</span>` : ""} </div> </div> `;
      }).join("")}
              ${n3 > 5 ? `<p style="color:var(--a); font-size:0.85rem; text-align:center; margin:8px 0 0 0;">+${n3 - 5} more...</p>` : ""} </div> </div> `;
    }).join("") : e2.innerHTML = '<p style="color:var(--a); text-align:center; margin:20px 0;">No gossip yet</p>';
  }
  function vt2(e2) {
    const t2 = gameState.time?.currentTime || Date.now(), n2 = Math.floor((t2 - e2) / 1e3);
    if (n2 < 60) return `${n2}s ago`;
    const a2 = Math.floor(n2 / 60);
    if (a2 < 60) return `${a2}m ago`;
    const o2 = Math.floor(a2 / 60);
    return o2 < 24 ? `${o2}h ago` : `${Math.floor(o2 / 24)}d ago`;
  }
  function bt2() {
    const e2 = document.getElementById("statRangeControls");
    if (!e2) return;
    const t2 = { productivity: "\u{1F4BC} Productivity", trust: "\u{1F91D} Trust", friendship: "\u{1F49A} Friendship", desire: "\u{1F495} Desire", comfort: "\u{1F60C} Comfort", affection: "\u2764\uFE0F Affection" }, u3 = (s2, w2, d2, u4) => `<button type="button" onclick="hrStatNudge('${s2}','${w2}',${d2})" title="${d2 > 0 ? "+" : ""}${d2}">${u4}</button>`, row = (s2, w2, color) => {
      const cap = "min" === w2 ? "Min" : "Max", v2 = gameState.hrSettings.startingStatRanges[s2][w2];
      return ` <div class="comp-row" style="--c:${color}"> <span class="comp-lbl">${cap}</span> <input type="range" id="${s2}${cap}Slider" min="${"min" === w2 ? 0 : 10}" max="${"min" === w2 ? 90 : 100}" value="${v2}" oninput="updateStatRange('${s2}','${w2}',this.value)"> <span class="comp-arrows">${u3(s2, w2, -10, "\u2039\u2039\u2039")}${u3(s2, w2, -5, "\u2039\u2039")}${u3(s2, w2, -1, "\u2039")}</span> <input type="number" id="${s2}${cap}Value" class="comp-num" min="0" max="100" value="${v2}" onchange="updateStatRange('${s2}','${w2}',this.value)"> <span class="comp-arrows">${u3(s2, w2, 1, "\u203A")}${u3(s2, w2, 5, "\u203A\u203A")}${u3(s2, w2, 10, "\u203A\u203A\u203A")}</span> </div>`;
    };
    e2.innerHTML = ["productivity", "trust", "friendship", "desire", "comfort", "affection"].map((s2) => {
      const n2 = gameState.hrSettings.startingStatRanges[s2];
      return ` <div class="stat-block"> <div class="row-between mb-1"> <span class="fw-600 text-accent fs-sm">${t2[s2]}</span> <span id="${s2}RangeDisplay" class="num pill pill--d">${n2.min}-${n2.max}</span> </div>${row(s2, "min", "var(--d)")}${row(s2, "max", "var(--m)")} </div>`;
    }).join("");
  }
  ht2 && ht2.addEventListener("click", async () => {
    await Ev("Clear all gossip from all NPCs? This will reset their knowledge of company drama.", "Clear Gossip", { type: "warning", confirmText: "Clear All" }) && (gameState.employees.forEach((e2) => {
      e2.gossip && (e2.gossip = []);
    }), yt2(), showNotification("\u{1F5D1}\uFE0F All gossip cleared!", "info"));
  }), window.removeContextItem = async function(e2) {
    await Ev("Remove this context item?", "Remove Item", { type: "warning", confirmText: "Remove" }) && (gameState.companyWideContext.currentBuzz.splice(e2, 1), lt(), showNotification("Context item removed", "info"));
  }, window.clearEmployeeGossip = function(e2) {
    const t2 = gameState.employees.find((t3) => t3.id === e2);
    t2 && t2.gossip && t2.gossip.knownGossip && (t2.gossip.knownGossip = [], yt2(), showNotification(`Cleared gossip for ${t2.name}`, "info"));
  }, atmosphereSlider && atmosphereValue && atmosphereSlider.addEventListener("input", (e2) => {
    gameState.settings.atmosphere = parseInt(e2.target.value);
    const t2 = parseInt(e2.target.value);
    let n2 = "Balanced";
    t2 < 33 ? n2 = "Professional" : t2 > 66 && (n2 = "Relaxed"), atmosphereValue.textContent = n2;
  }), guidelinesSlider && guidelinesValue && guidelinesSlider.addEventListener("input", (e2) => {
    gameState.settings.guidelines = parseInt(e2.target.value);
    const t2 = parseInt(e2.target.value);
    let n2 = "Standard";
    t2 < 33 ? n2 = "Reserved" : t2 > 66 && (n2 = "Outgoing"), guidelinesValue.textContent = n2;
  }), document.querySelectorAll(".policy-btn").forEach((e2) => {
    e2.addEventListener("click", () => {
      gameState.settings.policy = e2.dataset.policy, document.querySelectorAll(".policy-btn").forEach((e3) => e3.classList.remove("active")), e2.classList.add("active");
      const t2 = document.getElementById("policyValue");
      if (t2) {
        const n2 = { professional: "Professional", casual: "Casual", open: "Enthusiastic" };
        t2.textContent = n2[e2.dataset.policy] || "Professional";
      }
    });
  }), window.updateStatRange = function(e2, t2, n2) {
    if (n2 = parseInt(n2), isNaN(n2)) return;
    const a2 = gameState.hrSettings.startingStatRanges[e2], cap = "min" === t2 ? "Min" : "Max";
    "min" === t2 ? (n2 = Math.max(0, Math.min(n2, a2.max - 10)), a2.min = n2) : (n2 = Math.min(100, Math.max(n2, a2.min + 10)), a2.max = n2);
    const u3 = document.getElementById(`${e2}${cap}Slider`);
    u3 && (u3.value = "min" === t2 ? a2.min : a2.max);
    const G3 = document.getElementById(`${e2}${cap}Value`);
    G3 && (G3.value = "min" === t2 ? a2.min : a2.max);
    const U3 = document.getElementById(`${e2}RangeDisplay`);
    U3 && (U3.textContent = `${a2.min}-${a2.max}`);
  }, window.hrStatNudge = function(e2, t2, n2) {
    const a2 = gameState.hrSettings.startingStatRanges[e2];
    window.updateStatRange(e2, t2, ("min" === t2 ? a2.min : a2.max) + n2);
  }, window.applyStatPreset = function(e2) {
    const t2 = { challenging: { min: 20, max: 50 }, balanced: { min: 30, max: 60 }, welcoming: { min: 50, max: 75 } }[e2];
    t2 && (["productivity", "trust", "friendship", "desire", "comfort", "affection"].forEach((e3) => {
      gameState.hrSettings.startingStatRanges[e3].min = t2.min, gameState.hrSettings.startingStatRanges[e3].max = t2.max;
    }), bt2(), showNotification(`Applied ${e2} preset: ${t2.min}-${t2.max} for all stats`));
  };
  const mt = document.querySelector('[data-tab="hr"]');
  mt && mt.addEventListener("click", () => {
    setTimeout(bt2, 100);
  });
  const wt2 = $("openSaveManagerBtn");
  wt2 && (wt2.addEventListener("click", () => {
    Tb().show();
  }), wt2.addEventListener("mouseenter", function() {
    this.style.transform = "translateY(-2px)", this.style.boxShadow = "0 6px 20px rgba(0,212,255,0.5)";
  }), wt2.addEventListener("mouseleave", function() {
    this.style.transform = "translateY(0)", this.style.boxShadow = "0 4px 15px rgba(0,212,255,0.3)";
  })), resetBtn && resetBtn.addEventListener("click", resetGame), window.__saveKeydownHandler__ && document.removeEventListener("keydown", window.__saveKeydownHandler__), window.__saveKeydownHandler__ = function(e2) {
    "F5" === e2.key && (e2.preventDefault(), saveGameToSlot(`quick_${Date.now()}`, "quick", true)), "F9" === e2.key && (e2.preventDefault(), Kv().then((e3) => {
      const t2 = e3.filter((e4) => "quick" === e4.saveType);
      0 !== t2.length ? Vv(t2[0].slotName) : showNotification("\u274C No quick saves found!", "error");
    }));
  }, document.addEventListener("keydown", window.__saveKeydownHandler__);
  const gt = $("importFileInput");
  gt && gt.addEventListener("change", (e2) => {
    const t2 = e2.target.files[0];
    if (!t2) return;
    const n2 = new FileReader();
    n2.onload = (e3) => {
      try {
        const t3 = JSON.parse(e3.target.result);
        if (!t3.gameState) return void showNotification("\u274C Invalid save file!", "error");
        ob(t3);
      } catch (e4) {
        console.error("[Import] Error:", e4), showNotification("\u274C Failed to import save!", "error");
      }
    }, n2.readAsText(t2), e2.target.value = "";
  }), closeChatBtn && closeChatBtn.addEventListener("click", () => {
    if (chatModal) {
      chatModal.hidden = true, chatModal.style.display = "none", chatModal.style.pointerEvents = "none";
      const e2 = document.getElementById("encounterRequestModal");
      e2 && (e2.style.display = "none");
      const t2 = document.getElementById("attachmentMenu");
      t2 && (t2.style.display = "none"), gameState.activeChat && saveGame(false), gameState.activeChat = null;
    }
  });
  const xt2 = $("clearChatBtn");
  xt2 && xt2.addEventListener("click", async () => {
    const e2 = gameState.activeChat?.id || gameState.activeChat;
    if (!e2) return void console.warn("[Clear Chat] No active chat");
    const t2 = gameState.employees.find((t3) => t3.id === e2);
    if (!t2) return void console.warn("[Clear Chat] Employee not found:", e2);
    if (!await Ev(`Clear chat history with ${t2.name}?

This will archive the conversation but remove it from view. Context will be preserved for AI.`, "Clear Chat History", { type: "warning", confirmText: "Clear History" })) return;
    const n2 = gameState.chatHistory[e2] || [];
    n2.length > 0 ? (t2.conversationArchive || (t2.conversationArchive = []), t2.conversationArchive.push({ timestamp: gameState.time?.currentTime || Date.now(), messages: [...n2], messageCount: n2.length }), t2.conversationArchive.length > 5 && (t2.conversationArchive = t2.conversationArchive.slice(-5)), gameState.chatHistory[e2] = [], renderChatMessages(), console.log(`[Clear Chat] Cleared and archived chat with ${t2.name}`), showNotification(`Chat with ${t2.name} cleared and archived.`)) : showNotification(`No messages to clear with ${t2.name}.`);
  });
  const kt2 = $("convertToGroupBtn");
  kt2 && kt2.addEventListener("click", () => {
    const e2 = gameState.activeChat?.id || gameState.activeChat;
    if (!e2) return void showNotification("No active chat to convert", 2e3);
    const t2 = $("chatModal");
    t2 && (t2.style.display = "none"), switchTab("groups"), setTimeout(() => {
      openCreateGroupModal(e2);
    }, 100);
  }), window.refreshChatDisplay = function() {
    if (gameState.activeChat && gameState.activeChat.id) {
      const e2 = gameState.employees.find((e3) => e3.id === gameState.activeChat.id);
      e2 && openChat(e2);
    }
  }, window.showTypingIndicator = function(e2) {
    const t2 = $("chatTypingIndicator"), n2 = $("chatTypingName");
    if (t2 && n2) {
      n2.textContent = e2.name, t2.style.display = "block";
      const a2 = $("chatMessages");
      a2 && setTimeout(() => a2.scrollTop = a2.scrollHeight, 100);
    }
  }, window.hideTypingIndicator = function() {
    const e2 = $("chatTypingIndicator");
    e2 && (e2.style.display = "none");
  }, chatSendBtn && chatSendBtn.addEventListener("click", Jy), chatInput && (chatInput.addEventListener("keypress", (e2) => {
    "Enter" === e2.key && Jy();
  }), chatInput.addEventListener("input", (e2) => {
    Ry(chatInput, false);
  }));
  const ft = $("chatEmojiBtn");
  console.log("Chat emoji button:", ft, "Chat input:", chatInput), ft && chatInput && ft.addEventListener("click", (e2) => {
    console.log("Chat emoji button clicked!"), e2.stopPropagation(), ce.show(chatInput, ft);
  });
  const St2 = $("postCaptionEmojiBtn"), Tt2 = $("playerPostCaption");
  St2 && Tt2 && St2.addEventListener("click", (e2) => {
    e2.stopPropagation(), ce.show(Tt2, St2);
  }), document.addEventListener("click", (e2) => {
    if (e2.target.classList.contains("comment-emoji-btn")) {
      e2.stopPropagation();
      const t2 = e2.target.dataset.postId, n2 = document.querySelector(`.comment-input[data-post-id="${t2}"]`);
      n2 && ce.show(n2, e2.target);
    }
  }), ce.init();
  const $t2 = $("openPlayerProfileBtn"), Ct2 = $("playerProfileModal"), Et2 = $("closePlayerProfileModal"), Mt2 = $("cancelPlayerProfile"), Pt2 = $("savePlayerProfile");
  if ($t2 && Ct2) {
    $t2.addEventListener("click", () => {
      const e2 = gameState.playerProfile, t2 = e2.physical || {}, n2 = t2.hair || {}, a2 = t2.eyes || {}, o2 = t2.face || {}, i2 = t2.skin || {}, s2 = t2.body || {}, r2 = (Array.isArray(t2.genitals) ? t2.genitals[0] : t2.genitals) || {};
      $("playerCompanyName").value = e2.companyName || "", $("playerFirstName").value = e2.firstName || "", $("playerLastName").value = e2.lastName || "", $("playerAge").value = e2.age || "", $("playerGender").value = e2.gender || "", $("playerRace").value = e2.race || "human", $("playerEthnicity").value = e2.ethnicity || "";
      const l2 = $("playerEthnicityRow");
      l2 && (l2.style.display = "human" === (e2.race || "human") ? "block" : "none"), $("playerHeightBuild").value = t2.heightBuild || e2.height || "", $("playerHairColor").value = n2.color || e2.hairColor || "", $("playerHairStyle").value = n2.style || e2.hairStyle || "", $("playerHairLength").value = n2.length || "", $("playerHairTexture").value = n2.texture || "", $("playerEyeColor").value = a2.color || e2.eyeColor || "", $("playerEyeShape").value = a2.shape || "", $("playerFaceShape").value = o2.shape || "", $("playerNose").value = o2.nose || "", $("playerLips").value = o2.lips || "", $("playerJawline").value = o2.jawline || "", $("playerFacialHair").value = o2.facialHair || e2.facialHair || "", $("playerSkinTone").value = i2.tone || e2.skinTone || "", $("playerSkinTexture").value = i2.texture || "", $("playerBodyShape").value = s2.shape || e2.bodyType || "", $("playerChestSize").value = s2.chestSize || e2.chestSize || "", $("playerButtSize").value = s2.buttSize || "", $("playerLegs").value = s2.legs || "", $("playerBuildDetails").value = e2.buildDetails || "", $("playerGenitalType").value = r2.type || e2.genitalType || "", $("playerGenitalSize").value = r2.size || e2.genitalDetails || "", $("playerGenitalCharacteristics").value = r2.characteristics || "", $("playerFashion").value = t2.fashion || "", $("playerAccessories").value = t2.accessories || "", $("playerDistinguishingFeature").value = t2.distinguishingFeature || "", $("playerPersonalityTraits").value = (e2.personalityTraits || []).join(", "), $("playerHobbies").value = (e2.hobbies || []).join(", "), $("playerLikes").value = (e2.likes || []).join(", "), $("playerDislikes").value = (e2.dislikes || []).join(", "), $("playerKinks").value = (e2.kinks || []).join(", "), $("playerPersonality").value = e2.personality || "", $("playerAdditionalDetails").value = e2.additionalDetails || "", Ct2.style.display = "flex", nr("player"), ar("player", { physical: e2.physical, gender: e2.gender }), ir("playerPersonalityTraits", null, ii), ir("playerHobbies", null, ri), ir("playerKinks", null, si);
    });
    const qa = () => {
      Ct2.style.display = "none";
    };
    Et2 && Et2.addEventListener("click", qa), Mt2 && Mt2.addEventListener("click", qa);
    const Oo2 = (e2) => e2 ? e2.split(",").map((e3) => e3.trim()).filter(Boolean) : [];
    Pt2 && Pt2.addEventListener("click", () => {
      const e2 = gameState.playerProfile;
      e2.physical || (e2.physical = {}), e2.physical.hair || (e2.physical.hair = {}), e2.physical.eyes || (e2.physical.eyes = {}), e2.physical.face || (e2.physical.face = {}), e2.physical.skin || (e2.physical.skin = {}), e2.physical.body || (e2.physical.body = {}), e2.physical.genitals || (e2.physical.genitals = {}), e2.companyName = $("playerCompanyName").value.trim(), e2.firstName = $("playerFirstName").value.trim(), e2.lastName = $("playerLastName").value.trim(), e2.age = parseInt($("playerAge").value) || null, e2.gender = $("playerGender").value, e2.race = $("playerRace").value || "human", e2.ethnicity = $("playerEthnicity").value, e2.physical.heightBuild = $("playerHeightBuild").value.trim(), e2.physical.hair.color = $("playerHairColor").value.trim(), e2.physical.hair.style = $("playerHairStyle").value.trim(), e2.physical.hair.length = $("playerHairLength").value.trim(), e2.physical.hair.texture = $("playerHairTexture").value.trim(), e2.hairColor = e2.physical.hair.color, e2.hairStyle = e2.physical.hair.style, e2.physical.eyes.color = $("playerEyeColor").value.trim(), e2.physical.eyes.shape = $("playerEyeShape").value.trim(), e2.physical.face.shape = $("playerFaceShape").value.trim(), e2.physical.face.nose = $("playerNose").value.trim(), e2.physical.face.lips = $("playerLips").value.trim(), e2.physical.face.jawline = $("playerJawline").value.trim(), e2.physical.face.facialHair = $("playerFacialHair").value.trim(), e2.eyeColor = e2.physical.eyes.color, e2.facialHair = e2.physical.face.facialHair, e2.physical.skin.tone = $("playerSkinTone").value.trim(), e2.physical.skin.texture = $("playerSkinTexture").value.trim(), e2.skinTone = e2.physical.skin.tone, e2.physical.body.shape = $("playerBodyShape").value.trim(), e2.physical.body.chestSize = $("playerChestSize").value.trim(), e2.physical.body.buttSize = $("playerButtSize").value.trim(), e2.physical.body.legs = $("playerLegs").value.trim(), e2.buildDetails = $("playerBuildDetails").value.trim(), e2.bodyType = e2.physical.body.shape, e2.chestSize = e2.physical.body.chestSize, e2.height = e2.physical.heightBuild, e2.physical.genitals = Ui("playerGenitalCards", { type: $("playerGenitalType")?.value || "", size: $("playerGenitalSize")?.value?.trim() || "", characteristics: $("playerGenitalCharacteristics")?.value?.trim() || "" }), e2.genitalType = e2.physical.genitals[0]?.type || "", e2.genitalDetails = e2.physical.genitals[0]?.size || "", e2.physical.fashion = $("playerFashion").value.trim(), e2.physical.accessories = $("playerAccessories").value.trim(), e2.physical.distinguishingFeature = $("playerDistinguishingFeature").value.trim(), e2.physical.distinguishingFeatures = e2.physical.distinguishingFeature ? [e2.physical.distinguishingFeature] : [], e2.physical.piercings = Wi("playerPiercingCards"), e2.physical.tattoos = Vi("playerTattooCards"), e2.personalityTraits = document.getElementById("playerPersonalityTraits_tags") ? Zi("playerPersonalityTraits_tags") : Oo2($("playerPersonalityTraits").value), e2.hobbies = document.getElementById("playerHobbies_tags") ? Zi("playerHobbies_tags") : Oo2($("playerHobbies").value), e2.likes = Oo2($("playerLikes").value), e2.dislikes = Oo2($("playerDislikes").value), e2.kinks = document.getElementById("playerKinks_tags") ? Zi("playerKinks_tags") : Oo2($("playerKinks").value), e2.personality = $("playerPersonality").value.trim(), e2.additionalDetails = $("playerAdditionalDetails").value.trim(), "function" == typeof mr && mr(e2.physical, e2.gender), showNotification("Player profile saved!"), Ct2.style.display = "none", saveGame();
    });
  }
  const Lt2 = { gender: ["female", "male", "femaleFuta", "transMan", "transWoman"], race: Object.keys(RACES) }, Nt2 = Object.assign({ female: "\u{1F469} Female", male: "\u{1F468} Male", femaleFuta: "\u{1F469}\u200D\u{1F9B0} Female Futa", transMan: "\u26A7\uFE0F Trans Man", transWoman: "\u26A7\uFE0F Trans Woman" }, Object.fromEntries(Object.values(RACES).map((r2) => [r2.id, `${r2.emoji} ${r2.displayName}`]))), _t2 = Object.assign({ female: "var(--v)", male: "var(--d)", femaleFuta: "var(--x)", transMan: "var(--g)", transWoman: "var(--m)" }, Object.fromEntries(Object.values(RACES).map((r2) => [r2.id, r2.color]))), Rt2 = { gender: { host: "genderSlidersHost", total: "genderTotalValue", warn: "genderWarning" }, race: { host: "raceSlidersHost", total: "raceTotalValue", warn: "raceWarning" } }, Dt2 = { gender: {}, race: {} };
  function Ot2(group) {
    const o2 = {}, src = "gender" === group ? gameState.genderSettings || {} : gameState.raceSettings || {};
    return Lt2[group].forEach((k2) => o2[k2] = parseInt(src[k2]) || 0), 0 === Object.values(o2).reduce((a2, b2) => a2 + b2, 0) && (o2["gender" === group ? "female" : "human"] = 100), o2;
  }
  function Bt2(group, changed) {
    const keys = Lt2[group], work = Dt2[group];
    let v2 = Math.max(0, Math.min(100, Math.round(work[changed] || 0)));
    work[changed] = v2;
    const others = keys.filter((k2) => k2 !== changed), remaining = 100 - v2;
    if (remaining <= 0) return others.forEach((k2) => work[k2] = 0), void (work[changed] = 100);
    const u3 = others.reduce((a2, k2) => a2 + (work[k2] || 0), 0);
    if (0 === u3) {
      const base = Math.floor(remaining / others.length);
      others.forEach((k2) => work[k2] = base);
      let rem = remaining - base * others.length, i2 = 0;
      for (; rem > 0; ) work[others[i2 % others.length]] += 1, rem--, i2++;
      return;
    }
    let G3 = 0;
    others.forEach((k2, U3) => {
      U3 === others.length - 1 ? work[k2] = Math.max(0, remaining - G3) : (work[k2] = Math.round(work[k2] / u3 * remaining), G3 += work[k2]);
    });
    const drift = 100 - keys.reduce((a2, k2) => a2 + work[k2], 0);
    if (0 !== drift) {
      const k2 = others.reduce((m2, x2) => work[x2] > work[m2] ? x2 : m2, others[0]);
      work[k2] = Math.max(0, work[k2] + drift);
    }
  }
  function Ft2(group) {
    const u3 = Rt2[group], keys = Lt2[group], work = Dt2[group], host = $(u3.host);
    host && keys.forEach((k2) => {
      const row = host.querySelector(`[data-key="${k2}"]`);
      if (!row) return;
      const s2 = row.querySelector('input[type="range"]'), n2 = row.querySelector('input[type="number"]');
      s2 && (s2.value = work[k2]), n2 && document.activeElement !== n2 && (n2.value = work[k2]);
    });
    const total = keys.reduce((a2, k2) => a2 + (work[k2] || 0), 0), t2 = $(u3.total), w2 = $(u3.warn);
    t2 && (t2.textContent = total, t2.style.color = 100 === total ? "var(--d)" : "var(--k)"), w2 && (w2.style.display = 100 === total ? "none" : "block");
  }
  function jt2(group) {
    const host = $(Rt2[group].host), work = Dt2[group];
    host && (host.innerHTML = Lt2[group].map((k2) => ` <div class="comp-row" data-key="${k2}" style="--c:${_t2[k2]}"> <span class="comp-lbl" title="${Nt2[k2]}">${Nt2[k2]}</span> <input type="range" min="0" max="100" value="${work[k2]}" oninput="grSlide('${group}','${k2}',this.value)"> <span class="comp-arrows"><button type="button" onclick="grNudge('${group}','${k2}',-10)" title="-10">\u2039\u2039\u2039</button><button type="button" onclick="grNudge('${group}','${k2}',-5)" title="-5">\u2039\u2039</button><button type="button" onclick="grNudge('${group}','${k2}',-1)" title="-1">\u2039</button></span> <input type="number" min="0" max="100" value="${work[k2]}" class="comp-num" onchange="grNum('${group}','${k2}',this.value)"> <span class="comp-arrows"><button type="button" onclick="grNudge('${group}','${k2}',1)" title="+1">\u203A</button><button type="button" onclick="grNudge('${group}','${k2}',5)" title="+5">\u203A\u203A</button><button type="button" onclick="grNudge('${group}','${k2}',10)" title="+10">\u203A\u203A\u203A</button></span> </div>`).join(""));
  }
  function zt2() {
    const n2 = $("genderDistributionDisplay");
    if (!n2) return;
    const g2 = gameState.genderSettings || {}, r2 = gameState.raceSettings || {}, chip = (k2, v2) => `<div class="dist-chip" style="--c:${_t2[k2]};"><div class="pct">${v2}%</div><div class="lbl">${Nt2[k2]}</div></div>`;
    let html = '<div class="mb-2"><div class="text-dim fs-sm fw-600 mb-1">Gender Distribution:</div><div class="dist-grid">';
    const u3 = Lt2.gender.filter((k2) => (g2[k2] || 0) > 0).map((k2) => chip(k2, g2[k2]));
    html += (u3.length ? u3.join("") : '<div class="text-center text-mute" style="grid-column:1/-1; padding:15px;">No gender settings configured</div>') + "</div></div>";
    const G3 = Lt2.race.filter((k2) => (r2[k2] || 0) > 0).map((k2) => chip(k2, r2[k2]));
    G3.length && (html += '<div><div class="text-dim fs-sm fw-600 mb-1">Race Distribution:</div><div class="dist-grid">' + G3.join("") + "</div></div>"), n2.innerHTML = html;
  }
  window.grSlide = function(group, key, val) {
    Dt2[group][key] = parseInt(val) || 0, Bt2(group, key), Ft2(group);
  }, window.grNum = function(group, key, val) {
    Dt2[group][key] = Math.max(0, Math.min(100, parseInt(val) || 0)), Bt2(group, key), Ft2(group);
  }, window.grNudge = function(group, key, delta) {
    Dt2[group][key] = Math.max(0, Math.min(100, (Dt2[group][key] || 0) + delta)), Bt2(group, key), Ft2(group);
  }, window.renderGenderDistribution = zt2, function() {
    gameState.raceSettings || (gameState.raceSettings = {}, Lt2.race.forEach((k2) => gameState.raceSettings[k2] = "human" === k2 ? 100 : 0));
    const u3 = $("genderOptionsBtn"), G3 = $("genderOptionsModal"), U3 = $("closeGenderOptionsModal"), J3 = $("cancelGenderOptions"), saveBtn2 = $("saveGenderOptions");
    if (!u3 || !G3) return;
    const hide = () => G3.style.display = "none";
    u3.addEventListener("click", () => {
      Dt2.gender = Ot2("gender"), Dt2.race = Ot2("race"), jt2("gender"), jt2("race"), Ft2("gender"), Ft2("race"), G3.style.display = "flex";
    }), U3 && U3.addEventListener("click", hide), J3 && J3.addEventListener("click", hide), saveBtn2 && saveBtn2.addEventListener("click", () => {
      const gt2 = Lt2.gender.reduce((a2, k2) => a2 + (Dt2.gender[k2] || 0), 0), u4 = Lt2.race.reduce((a2, k2) => a2 + (Dt2.race[k2] || 0), 0);
      100 === gt2 ? 100 === u4 ? (gameState.genderSettings = gameState.genderSettings || {}, Lt2.gender.forEach((k2) => gameState.genderSettings[k2] = Dt2.gender[k2]), gameState.raceSettings = {}, Lt2.race.forEach((k2) => gameState.raceSettings[k2] = Dt2.race[k2]), zt2(), hide(), showNotification("\u26A7\uFE0F Gender & race settings saved!", "success"), "function" == typeof saveGame && saveGame()) : showNotification("Race total must equal 100%!", "error") : showNotification("Gender total must equal 100%!", "error");
    }), zt2();
  }();
  const Gt2 = $("chatAttachBtn"), Ht2 = $("attachmentMenu");
  Gt2 && Ht2 && (Gt2.addEventListener("click", (e2) => {
    e2.stopPropagation();
    const t2 = "block" === Ht2.style.display;
    Ht2.style.display = t2 ? "none" : "block";
  }), document.addEventListener("click", (e2) => {
    Gt2.contains(e2.target) || Ht2.contains(e2.target) || (Ht2.style.display = "none");
  }), document.querySelectorAll(".attach-menu-item").forEach((e2) => {
    e2.addEventListener("click", () => {
      const t2 = e2.dataset.action;
      Ht2.style.display = "none", "send-money" === t2 ? function(e3 = null) {
        !e3 && gameState.activeChat && (e3 = gameState.activeChat.id), window.currentMoneyContext = { employeeId: e3 };
        const t3 = gameState.cash || 0;
        $("sendMoneyBalance").textContent = "$" + xu(t3);
        const n2 = Math.max(100, Math.floor(0.01 * t3)), a2 = Math.max(1e3, Math.floor(0.05 * t3)), o2 = Math.max(1e4, Math.floor(0.1 * t3));
        $("moneySmall").textContent = "$" + xu(n2), $("moneyMedium").textContent = "$" + xu(a2), $("moneyLarge").textContent = "$" + xu(o2), Jt2.value = "", $("moneyMessage").value = "", Wt2.style.display = "flex";
      }() : "give-gift" === t2 ? "function" == typeof window.openGiftSelectionModal && window.openGiftSelectionModal() : "request" === t2 ? $("requestImageModal").style.display = "flex" : "send" === t2 ? $("sendImageModal").style.display = "flex" : "request-post" === t2 ? $("requestPostModal").style.display = "flex" : "visualize" === t2 ? visualizeCurrentScene() : "intimate-encounter" === t2 && showEncounterRequestModal();
    });
  }));
  const en = $("sendImageModal"), Ut2 = $("closeSendImageModal"), Yt2 = $("cancelSendImage"), an = $("confirmSendImage"), on = $("sendImagePrompt");
  on && ov(on, "sendImageMentionSuggestions"), Ut2 && Ut2.addEventListener("click", () => {
    en.style.display = "none", on.value = "";
  }), Yt2 && Yt2.addEventListener("click", () => {
    en.style.display = "none", on.value = "";
  }), an && an.addEventListener("click", async () => {
    const e2 = on.value.trim();
    e2 && (en.style.display = "none", on.value = "", await wf(e2));
  });
  const Wt2 = $("sendMoneyModal"), rn = $("closeSendMoneyModal"), Vt2 = $("cancelSendMoney"), Kt2 = $("confirmSendMoney"), Jt2 = $("customMoneyAmount");
  rn && rn.addEventListener("click", () => {
    Wt2.style.display = "none", Jt2.value = "", $("moneyMessage").value = "";
  }), Vt2 && Vt2.addEventListener("click", () => {
    Wt2.style.display = "none", Jt2.value = "", $("moneyMessage").value = "";
  }), document.querySelectorAll(".money-preset").forEach((e2) => {
    e2.addEventListener("click", () => {
      const t2 = e2.dataset.preset, n2 = gameState.cash || 0;
      let a2 = 0;
      "small" === t2 ? a2 = Math.max(100, Math.floor(0.01 * n2)) : "medium" === t2 ? a2 = Math.max(1e3, Math.floor(0.05 * n2)) : "large" === t2 && (a2 = Math.max(1e4, Math.floor(0.1 * n2))), Jt2 && (Jt2.value = a2, Jt2.focus());
    }), e2.addEventListener("mouseenter", () => {
      e2.style.background = "var(--n)", e2.style.borderColor = "var(--n)";
    }), e2.addEventListener("mouseleave", () => {
      e2.style.background = "var(--t)", e2.style.borderColor = "var(--n)";
    });
  }), Kt2 && Kt2.addEventListener("click", async () => {
    const e2 = parseInt(Jt2.value) || 0, t2 = gameState.cash || 0, n2 = $("moneyMessage").value.trim();
    if (e2 <= 0) return void showNotification("\u274C Please enter a valid amount", "error");
    if (e2 > t2) return void showNotification("\u274C Insufficient funds!", "error");
    Wt2.style.display = "none", Jt2.value = "", $("moneyMessage").value = "";
    const a2 = (window.currentMoneyContext || {}).employeeId || (gameState.activeChat ? gameState.activeChat.id : null);
    a2 ? (await sendMoneyToNPC(e2, n2, a2), window.currentMoneyContext = null) : showNotification("\u274C No recipient selected", "error");
  });
  const Qt2 = $("giftSelectionModal"), Xt2 = $("closeGiftSelectionModal"), Zt2 = $("cancelGiftSelection"), tn2 = $("giftSelectionGrid"), nn2 = $("giftSelectionEmpty");
  let sn2 = null;
  window.openGiftSelectionModal = function() {
    if (!gameState.activeChat) return void console.error("[Gift Modal] No active chat");
    const e2 = gameState.activeChat;
    if (sn2 = e2.id, !Qt2) return void console.error("[Gift Modal] Modal element not found");
    const t2 = $("giftRecipientName");
    t2 && (t2.textContent = `Giving a gift to ${e2.name}`);
    const n2 = e2.giftPreferences || { loves: [], hates: [], learnedLoves: [], learnedHates: [] };
    n2.learnedLoves || (n2.learnedLoves = []), n2.learnedHates || (n2.learnedHates = []);
    const a2 = n2.loves.map((e3) => {
      if (n2.learnedLoves.includes(e3)) {
        const t3 = ye[e3];
        return t3 ? `${t3.emoji} ${t3.name}` : e3;
      }
      return "\u2753 ?????";
    }).join(", ") || "Unknown", o2 = n2.hates.map((e3) => {
      if (n2.learnedHates.includes(e3)) {
        const t3 = ye[e3];
        return t3 ? `${t3.emoji} ${t3.name}` : e3;
      }
      return "\u2753 ?????";
    }).join(", ") || "Unknown", i2 = $("giftLovesHint"), s2 = $("giftHatesHint");
    i2 && (i2.textContent = a2), s2 && (s2.textContent = o2), function(e3) {
      const t3 = gameState.giftInventory?.items || [];
      if (0 === t3.length) return tn2.style.display = "none", void (nn2.style.display = "block");
      tn2.style.display = "grid", nn2.style.display = "none", tn2.innerHTML = "";
      const npc = e3;
      t3.forEach((e4) => {
        const t4 = ye[e4.category], a3 = t4 ? t4.emoji : "\u{1F381}", o3 = t4 ? t4.name : e4.category, u3 = qr(npc, e4);
        let i3 = "neutral", s3 = "var(--ar)", r2 = `${u3.emoji} ${u3.label}`;
        "love" === u3.tier || "like" === u3.tier ? (i3 = "loves", s3 = "var(--n)") : "dislike" === u3.tier && (i3 = "hates", s3 = "var(--l)");
        const l2 = document.createElement("div");
        l2.style.cssText = `
          background: var(--f);
          border-radius: 10px;
          padding: 15px;
          cursor: pointer;
          transition: all 0.2s;
          border: 2px solid ${"loves" === i3 ? "var(--n)" : "hates" === i3 ? "var(--l)" : "var(--t)"};
          position: relative;
        `, l2.innerHTML = ` <div style="font-size: 2.5rem; text-align: center; margin-bottom: 8px;">${a3}</div> <h4 style="margin: 0 0 5px 0; font-size: 0.95rem; color: var(--b); text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${e4.name}">${e4.name}</h4> <p style="margin: 0 0 8px 0; font-size: 0.75rem; color: var(--a); text-align: center;">${o3}</p> <p style="margin: 0 0 8px 0; font-size: 0.9rem; color: var(--g); text-align: center; font-weight: 600;">$${xu(e4.price)}</p> <p style="margin: 0; font-size: 0.75rem; color: ${s3}; text-align: center; font-weight: 600;">${r2}</p> `, l2.addEventListener("mouseenter", () => {
          l2.style.transform = "translateY(-5px)", l2.style.boxShadow = "0 8px 20px " + ("loves" === i3 ? "rgba(78,204,163,0.3)" : "hates" === i3 ? "rgba(233,69,96,0.3)" : "rgba(102,126,234,0.3)");
        }), l2.addEventListener("mouseleave", () => {
          l2.style.transform = "translateY(0)", l2.style.boxShadow = "none";
        }), l2.addEventListener("click", () => {
          tn2.querySelectorAll("div").forEach((e5) => {
            e5.style.borderColor = "loves" === e5.dataset.matchType ? "var(--n)" : "hates" === e5.dataset.matchType ? "var(--l)" : "var(--t)", e5.style.borderWidth = "2px";
          }), l2.style.borderColor = "var(--u)", l2.style.borderWidth = "3px", window.selectedGift = e4;
          const t5 = $("sendGiftBtn");
          t5 && (t5.disabled = false, t5.style.opacity = "1", t5.style.cursor = "pointer");
        }), l2.dataset.matchType = i3, tn2.appendChild(l2);
      });
    }(e2), console.log("[Gift Modal] Opening modal for", e2.name), Qt2.style.display = "flex";
  };
  const ln2 = $("sendGiftBtn");
  ln2 && ln2.addEventListener("click", async () => {
    if (!window.selectedGift || !sn2) return;
    const e2 = window.selectedGift, t2 = sn2, n2 = gameState.employees.find((e3) => e3.id === t2);
    if (!n2) return void showNotification("Employee not found!", "error");
    const a2 = $("giftPersonalMessage"), o2 = a2 ? a2.value.trim() : "";
    Qt2.style.display = "none", window.selectedGift = null, a2 && (a2.value = ""), ln2.disabled = true, ln2.style.opacity = "0.5";
    const i2 = gameState.giftInventory.items.find((t3) => t3.id === e2.id);
    i2 && (i2.quantity = (i2.quantity || 1) - 1, i2.quantity <= 0 && (gameState.giftInventory.items = gameState.giftInventory.items.filter((t3) => t3.id !== e2.id)));
    const s2 = gameState.chatHistory[n2.id] || [], r2 = ye[e2.category];
    s2.push({ sender: "player", content: o2 || "\u{1F381} Gave a gift", timestamp: gameState.time?.currentTime || Date.now(), isPlayer: true, giftData: { name: e2.name, price: e2.price, category: e2.category, categoryName: r2?.name || e2.category, categoryEmoji: r2?.emoji || "\u{1F381}", description: e2.description, imageUrl: e2.imageUrl } }), n2.lastPlayerMessageTime = gameState.time?.currentTime || Date.now(), gameState.chatHistory[n2.id] = s2, gameState.activeChat && gameState.activeChat.id === n2.id && refreshChatDisplay(), gameState.activeChat && gameState.activeChat.id === n2.id && showTypingIndicator(n2), await giveGiftToEmployee(n2.id, e2, o2), gameState.activeChat && gameState.activeChat.id === n2.id && (hideTypingIndicator(), refreshChatDisplay()), updateUI();
  }), Xt2 && Xt2.addEventListener("click", () => {
    Qt2.style.display = "none", sn2 = null, window.selectedGift = null;
    const e2 = $("sendGiftBtn");
    e2 && (e2.disabled = true, e2.style.opacity = "0.5");
    const t2 = $("giftPersonalMessage");
    t2 && (t2.value = "");
  }), Zt2 && Zt2.addEventListener("click", () => {
    Qt2.style.display = "none", sn2 = null, window.selectedGift = null;
    const e2 = $("sendGiftBtn");
    e2 && (e2.disabled = true, e2.style.opacity = "0.5");
    const t2 = $("giftPersonalMessage");
    t2 && (t2.value = "");
  });
  const cn2 = $("giftPersonalMessage"), dn2 = $("giftMessageCharCount");
  cn2 && dn2 && cn2.addEventListener("input", () => {
    const e2 = cn2.value.length;
    dn2.textContent = e2, dn2.style.color = e2 > 450 ? "var(--l)" : e2 > 400 ? "var(--bs)" : "var(--as)";
  });
  const un2 = $("counterOfferModal"), pn2 = $("closeCounterOfferModal"), mn2 = $("cancelCounterOffer"), gn2 = $("confirmCounterOffer"), hn2 = $("counterAmount"), yn2 = $("counterJustification");
  pn2 && pn2.addEventListener("click", () => {
    un2.style.display = "none", hn2.value = "", yn2.value = "";
  }), mn2 && mn2.addEventListener("click", () => {
    un2.style.display = "none", hn2.value = "", yn2.value = "";
  }), gn2 && gn2.addEventListener("click", async () => {
    await Py();
  });
  const fn2 = $("requestImageModal"), vn2 = $("closeRequestImageModal"), In = $("requestManualBtn"), bn2 = $("requestManualInput"), wn2 = $("requestImageMode"), An = $("cancelRequestManual"), xn2 = $("confirmRequestManual"), kn2 = $("requestImagePrompt");
  kn2 && ov(kn2, "requestImageMentionSuggestions"), vn2 && vn2.addEventListener("click", () => {
    fn2.style.display = "none", bn2.style.display = "none", wn2.querySelector("div").style.display = "grid", In.style.display = "block", kn2.value = "";
  }), document.querySelectorAll(".request-preset").forEach((e2) => {
    e2.addEventListener("click", async () => {
      const t2 = e2.dataset.preset;
      fn2.style.display = "none", await Mf(t2);
    }), e2.addEventListener("mouseenter", () => {
      e2.style.background = "var(--u)", e2.style.color = "var(--q)";
    }), e2.addEventListener("mouseleave", () => {
      e2.style.background = "var(--t)", e2.style.color = "var(--b)";
    });
  }), In && In.addEventListener("click", () => {
    wn2.querySelector("div").style.display = "none", In.style.display = "none", bn2.style.display = "block";
  }), An && An.addEventListener("click", () => {
    bn2.style.display = "none", wn2.querySelector("div").style.display = "grid", In.style.display = "block", kn2.value = "";
  }), xn2 && xn2.addEventListener("click", async () => {
    const e2 = kn2.value.trim();
    e2 && (fn2.style.display = "none", bn2.style.display = "none", wn2.querySelector("div").style.display = "grid", In.style.display = "block", kn2.value = "", await Mf(null, e2));
  });
  const Sn2 = $("requestPostModal"), Tn2 = $("closeRequestPostModal"), $n2 = $("requestPostCustomBtn"), Cn2 = $("requestPostCustomInput"), En2 = $("requestPostMode"), Mn2 = $("cancelRequestPostCustom"), On = $("confirmRequestPostCustom"), Pn2 = $("requestPostPrompt");
  Tn2 && Tn2.addEventListener("click", () => {
    Sn2.style.display = "none", Cn2.style.display = "none", En2.querySelector("div").style.display = "grid", $n2.style.display = "block", Pn2.value = "";
  }), document.querySelectorAll(".request-post-preset").forEach((e2) => {
    e2.addEventListener("mouseenter", () => {
      e2.style.background = "var(--u)", e2.style.color = "var(--q)";
    }), e2.addEventListener("mouseleave", () => {
      e2.style.background = "var(--t)", e2.style.color = "var(--b)";
    }), e2.addEventListener("click", async () => {
      const t2 = e2.dataset.preset;
      Sn2.style.display = "none", await nf(t2);
    });
  }), $n2 && $n2.addEventListener("click", () => {
    En2.querySelector("div").style.display = "none", $n2.style.display = "none", Cn2.style.display = "block";
  }), Mn2 && Mn2.addEventListener("click", () => {
    Cn2.style.display = "none", En2.querySelector("div").style.display = "grid", $n2.style.display = "block", Pn2.value = "";
  }), On && On.addEventListener("click", async () => {
    const e2 = Pn2.value.trim();
    e2 && (Sn2.style.display = "none", Cn2.style.display = "none", En2.querySelector("div").style.display = "grid", $n2.style.display = "block", Pn2.value = "", await nf(null, e2));
  });
  const Ln2 = $("createGroupBtn");
  Ln2 && Ln2.addEventListener("click", () => openCreateGroupModal());
  const Nn2 = $("closeCreateGroupModal");
  Nn2 && Nn2.addEventListener("click", () => {
    const e2 = $("createGroupModal");
    e2 && (e2.style.display = "none"), window.selectedGroupParticipants = /* @__PURE__ */ new Set(), window.convertFromEmployeeId = null;
  });
  const _n2 = $("cancelCreateGroup");
  _n2 && _n2.addEventListener("click", () => {
    const e2 = $("createGroupModal");
    e2 && (e2.style.display = "none"), window.selectedGroupParticipants = /* @__PURE__ */ new Set(), window.convertFromEmployeeId = null;
  });
  const Rn2 = $("confirmCreateGroup");
  Rn2 && Rn2.addEventListener("click", () => Qu());
  const Dn2 = $("participantSearch");
  Dn2 && Dn2.addEventListener("input", () => Gu());
  const Bn2 = $("groupSearchInput");
  Bn2 && Bn2.addEventListener("input", () => rp());
  const Fn2 = $("sendGroupMessageBtn");
  Fn2 && Fn2.addEventListener("click", () => vp());
  const jn2 = $("groupInput");
  jn2 && (jn2.addEventListener("keypress", (e2) => {
    "Enter" !== e2.key || Zm?.isActive || (e2.preventDefault(), vp(), ug());
  }), jn2.addEventListener("input", (e2) => {
    Zm?.isActive || Ry(jn2, true);
  })), eg();
  const qn2 = $("clearQueueBtn");
  qn2 && qn2.addEventListener("click", () => yp());
  const zn2 = (q2, u3, label) => {
    const n2 = q2.requestQueue.length;
    q2.requestQueue.forEach((j2) => {
      try {
        j2.resolve(q2.getFallbackResponse(j2.description, new Error("Queue cleared by user")));
      } catch (u4) {
      }
    }), q2.requestQueue = [], gameState.pendingAIRequests && (gameState.pendingAIRequests[u3] = []), q2.updateUI && q2.updateUI(), showNotification(`\u{1F5D1}\uFE0F Cleared ${n2} queued ${label} request${1 === n2 ? "" : "s"}`);
  }, Gn2 = $("clearAIQueueBtn");
  Gn2 && Gn2.addEventListener("click", () => zn2(AIRequestQueue, "text", "AI text"));
  const Hn2 = $("clearImageQueueBtn");
  Hn2 && Hn2.addEventListener("click", () => zn2(ImageRequestQueue, "image", "image"));
  const Un2 = $("groupSettingsBtn");
  Un2 && Un2.addEventListener("click", () => Op());
  const Yn2 = $("deleteGroupBtn");
  Yn2 && Yn2.addEventListener("click", () => {
    gameState.activeGroup && Dp(gameState.activeGroup);
  });
  const Wn2 = $("closeGroupSettingsModal");
  Wn2 && Wn2.addEventListener("click", () => Bp());
  const Vn2 = $("saveGroupSettings");
  Vn2 && Vn2.addEventListener("click", () => saveGroupSettings());
  const Kn2 = $("deleteGroupFromSettings");
  Kn2 && Kn2.addEventListener("click", () => {
    Bp(), gameState.activeGroup && Dp(gameState.activeGroup);
  });
  const na = $("addParticipantBtn");
  na && na.addEventListener("click", () => Xp());
  const aa = $("autoGenerateGroupContext");
  aa && aa.addEventListener("click", () => qp());
  const Jn2 = $("clearGroupContext");
  Jn2 && Jn2.addEventListener("click", () => zp());
  const Qn2 = $("autoGenerateChatContext");
  Qn2 && Qn2.addEventListener("click", () => Gp());
  const Xn2 = $("clearChatContext");
  Xn2 && Xn2.addEventListener("click", () => Hp());
  const ra = $("chatScenarioContext");
  ra && ra.addEventListener("blur", () => Yp());
  const la = $("playerPostBtn");
  la && la.addEventListener("click", () => {
    openPlayerPostComposer();
  }), document.querySelectorAll(".algo-sort-btn").forEach((e2) => {
    e2.addEventListener("click", () => {
      document.querySelectorAll(".algo-sort-btn").forEach((e3) => {
        e3.classList.remove("active");
      }), e2.classList.add("active");
      const t2 = e2.dataset.sort;
      gameState.socialNetwork.algorithm.sort = t2;
      const n2 = $("bestTimeFrameSelector");
      n2 && (n2.style.display = "best" === t2 ? "block" : "none"), renderSocialFeed(true);
    });
  });
  const ca = $("bestTimeFrameSelect");
  ca && ca.addEventListener("change", (e2) => {
    gameState.socialNetwork.algorithm.bestTimeFrame = e2.target.value;
    const t2 = $("bestTimeFrame");
    if (t2) {
      const n2 = { hour: "Past Hour", day: "Past 24h", week: "Past Week", month: "Past Month", all: "All Time" };
      t2.textContent = n2[e2.target.value] || "All Time";
    }
    renderSocialFeed(true);
  }), document.querySelectorAll(".content-filter-btn").forEach((e2) => {
    e2.addEventListener("click", () => {
      document.querySelectorAll(".content-filter-btn").forEach((e3) => {
        e3.classList.remove("active");
      }), e2.classList.add("active"), gameState.socialNetwork.algorithm.contentRating = e2.dataset.rating, renderSocialFeed(true);
    });
  });
  const Zn2 = $("postTypeFilter");
  Zn2 && (Zn2.addEventListener("change", (e2) => {
    const t2 = e2.target.value || "all";
    console.log("[Social Filter] Post type changed to:", t2), gameState.socialNetwork.algorithm.postType = t2, renderSocialFeed(true);
  }), gameState.socialNetwork?.algorithm?.postType && (Zn2.value = gameState.socialNetwork.algorithm.postType));
  const eo2 = $("authorFilter");
  if (eo2) {
    const Ha = () => {
      const e2 = eo2.value;
      eo2.innerHTML = ' <option value="all">Everyone</option> <option value="player">My Posts</option> ', gameState.employees.filter((e3) => "active" === e3.employmentStatus).sort((e3, t2) => e3.name.localeCompare(t2.name)).forEach((e3) => {
        const t2 = document.createElement("option");
        t2.value = e3.id, t2.textContent = e3.name, eo2.appendChild(t2);
      }), e2 && Array.from(eo2.options).some((t2) => t2.value === e2) && (eo2.value = e2);
    };
    Ha(), eo2.addEventListener("change", (e2) => {
      gameState.socialNetwork.algorithm.author = e2.target.value, renderSocialFeed(true);
    }), window.addEventListener("employeesUpdated", Ha);
  }
  const oo2 = $("engagementFilter");
  oo2 && oo2.addEventListener("change", (e2) => {
    gameState.socialNetwork.algorithm.engagement = e2.target.value, renderSocialFeed(true);
  });
  const ua = $("feedSearchInput"), ao2 = $("clearSearchBtn"), io2 = $("searchResultsCount");
  if (ua) {
    let Fo2;
    ua.addEventListener("input", (e2) => {
      const t2 = e2.target.value;
      ao2 && (ao2.style.display = t2 ? "block" : "none"), clearTimeout(Fo2), Fo2 = setTimeout(() => {
        if (gameState.socialNetwork.algorithm.searchQuery = t2, renderSocialFeed(true), io2 && t2) {
          const e3 = filterAndSortPosts();
          io2.style.display = "block", io2.textContent = `Found ${e3.length} post${1 !== e3.length ? "s" : ""}`;
        } else io2 && (io2.style.display = "none");
      }, 300);
    });
  }
  ao2 && ua && ao2.addEventListener("click", () => {
    ua.value = "", gameState.socialNetwork.algorithm.searchQuery = "", ao2.style.display = "none", io2 && (io2.style.display = "none"), renderSocialFeed(true);
  });
  const ya = $("refreshFeedBtn");
  ya && ya.addEventListener("click", () => {
    console.log("[Social] Refresh button clicked - forcing full render"), renderSocialFeed(true), showNotification("\u{1F504} Feed refreshed!", 1500);
  });
  const ro2 = $("testGeneratePostBtn");
  ro2 && ro2.addEventListener("click", () => {
    generateTestPost();
  });
  const lo2 = $("closePlayerPostModal");
  lo2 && lo2.addEventListener("click", () => {
    closePlayerPostModal();
  });
  const uo2 = $("cancelPlayerPost");
  uo2 && uo2.addEventListener("click", () => {
    closePlayerPostModal();
  }), document.querySelectorAll(".post-type-btn").forEach((e2) => {
    e2.addEventListener("click", () => {
      document.querySelectorAll(".post-type-btn").forEach((e3) => {
        e3.classList.remove("active"), e3.style.borderColor = "var(--t)", e3.style.color = "var(--ar)";
      }), e2.classList.add("active"), e2.style.borderColor = "var(--u)", e2.style.color = "var(--b)";
      const t2 = e2.dataset.type, n2 = $("playerPostImageSection"), a2 = $("generatePlayerPostImage"), o2 = $("playerPostImagePrompt");
      $("playerPostAltText"), "text" === t2 ? (n2 && (n2.style.display = "none"), a2 && (a2.style.display = "none")) : (n2 && (n2.style.display = "block"), a2 && (a2.style.display = "inline-block"), "image" === t2 && o2 ? o2.placeholder = 'Describe the image (e.g., "@TheBoss at a party"). Type @ to autocomplete!' : "selfie" === t2 && o2 && (o2.placeholder = 'Describe your selfie (e.g., "@player in workout clothes"). Type @ to autocomplete!'));
    });
  });
  const po2 = $("playerPostImagePrompt");
  po2 && ov(po2, "postImageMentionSuggestions");
  const yo2 = $("generatePlayerPostImage");
  yo2 && yo2.addEventListener("click", async () => {
    await iv();
  });
  const fo2 = $("playerPostRegenerateImg");
  fo2 && fo2.addEventListener("click", async () => {
    await iv();
  });
  const vo2 = $("submitPlayerPost");
  vo2 && vo2.addEventListener("click", () => {
    submitPlayerPostToFeed();
  });
  const bo2 = $("captionCharCount");
  Tt2 && bo2 && Tt2.addEventListener("input", () => {
    const e2 = Tt2.value.length;
    bo2.textContent = e2, bo2.style.color = e2 > 500 ? "var(--l)" : "var(--as)";
  }), document.addEventListener("click", (e2) => {
    if (e2.target.closest(".like-btn") && handleLikePost(e2.target.closest(".like-btn").dataset.postId), e2.target.closest(".comment-btn") && openPostModal(e2.target.closest(".comment-btn").dataset.postId), e2.target.closest(".submit-comment-btn")) {
      const t2 = e2.target.closest(".submit-comment-btn").dataset.postId, n2 = document.querySelector(`.comment-input[data-post-id="${t2}"]`), a2 = document.querySelector(`.reply-indicator[data-post-id="${t2}"]`), o2 = a2 && "none" !== a2.style.display ? a2.getAttribute("data-reply-to-id") : null;
      n2 && addCommentToPost(t2, n2.value, o2);
    }
  }), document.addEventListener("keypress", (e2) => {
    if ("Enter" === e2.key && e2.target.classList.contains("comment-input")) {
      const t2 = e2.target.dataset.postId, n2 = document.querySelector(`.reply-indicator[data-post-id="${t2}"]`), a2 = n2 && "none" !== n2.style.display ? n2.getAttribute("data-reply-to-id") : null;
      addCommentToPost(t2, e2.target.value, a2);
    }
  }), document.addEventListener("click", (e2) => {
    if (e2.target.closest(".reply-to-comment-btn")) {
      const t2 = e2.target.closest(".reply-to-comment-btn"), n2 = t2.dataset.postId, a2 = t2.dataset.commentId, o2 = t2.dataset.authorName, i2 = t2.dataset.authorId, s2 = t2.dataset.authorUsername, r2 = document.querySelector(`.comment-input[data-post-id="${n2}"]`), l2 = document.querySelector(`.reply-indicator[data-post-id="${n2}"]`);
      r2 && l2 && (l2.querySelector(".reply-text").textContent = `Replying to ${o2}`, l2.style.display = "block", l2.setAttribute("data-reply-to-id", a2), "player" !== i2 && s2 && (r2.value.includes(`@${s2}`) || (r2.value = `@${s2} `)), r2.focus());
    }
  }), document.addEventListener("click", (e2) => {
    if (e2.target.closest(".cancel-reply-btn")) {
      const t2 = e2.target.closest(".cancel-reply-btn").dataset.postId, n2 = document.querySelector(`.reply-indicator[data-post-id="${t2}"]`);
      n2 && (n2.style.display = "none", n2.removeAttribute("data-reply-to-id"));
    }
  });
  const wo2 = $("buyClickPowerBtn");
  wo2 && wo2.addEventListener("click", buyClickPower);
  const xo2 = $("buyGoldenTouchBtn");
  xo2 && xo2.addEventListener("click", buyGoldenTouch);
  const ko2 = $("buyTimeDilationBtn");
  ko2 && ko2.addEventListener("click", buyTimeDilation);
  const $o2 = $("buyEmpireBuilderBtn");
  $o2 && $o2.addEventListener("click", buyEmpireBuilder);
  const Ma = $("prestigeBtn");
  Ma && Ma.addEventListener("click", Ab);
  const Co2 = $("closePrestigeModal");
  Co2 && Co2.addEventListener("click", () => {
    const e2 = $("prestigeModal");
    e2 && (e2.style.display = "none");
  });
  const Eo2 = $("cancelPrestige");
  Eo2 && Eo2.addEventListener("click", () => {
    const e2 = $("prestigeModal");
    e2 && (e2.style.display = "none");
  });
  const Na = $("confirmPrestige");
  Na && Na.addEventListener("click", executePrestige);
  const La = () => {
    gameState.lastInteractionTime = Date.now();
  };
  document.addEventListener("click", La), document.addEventListener("keydown", La), document.addEventListener("touchstart", La), document.addEventListener("scroll", La), document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      const e2 = Date.now();
      gameState.pageHiddenTime = e2, gameState.lastPlayTime = e2, gameState.time && (gameState.time._offlinePaused = true), saveGame(false);
    } else {
      const e2 = gameState.pageHiddenTime;
      $b(), pt(Date.now() - (e2 || Date.now()), "tab refocus"), gameState.pageHiddenTime = null, gameState.lastInteractionTime = Date.now();
    }
  }), window.addEventListener("beforeunload", () => {
    gameState.lastPlayTime = Date.now();
    try {
      "function" == typeof saveGame && saveGame(false);
    } catch (u3) {
    }
  }), setInterval(() => {
    if (!document.hidden) {
      const e2 = Date.now();
      e2 - (gameState.lastInteractionTime || e2) >= 6e5 && gameState.lastPlayTime > gameState.lastInteractionTime && (gameState.lastPlayTime = gameState.lastInteractionTime);
    }
  }, 6e4);
}
function switchTab(e) {
  "invest" === e && (e = "upgrades", ku = "invest"), gameState.activeTab = e, document.querySelectorAll(".tab-btn").forEach((t2) => {
    t2.dataset.tab === e ? (t2.classList.add("active"), t2.style.color = "var(--l)") : (t2.classList.remove("active"), t2.style.color = "var(--b)");
  }), document.querySelectorAll(".tab-content").forEach((e2) => {
    e2.hidden = true;
  });
  const t = $(`${e}Tab`);
  t && (t.hidden = false, updateTabContent(e));
}
