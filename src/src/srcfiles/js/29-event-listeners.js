// ============================================================================
// 29-event-listeners — setupEventListeners (all tab/global wiring) + switchTab.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

function setupEventListeners() {
    document.querySelectorAll(".tab-btn").forEach((e) => {
        e.addEventListener("click", () => {
            switchTab(e.dataset.tab);
        });
    });
    const e = $("upgradeMultiplierBtn");
    if (
        (e &&
            e.addEventListener("click", () => {
                const t = [1, 5, 10, 100, "max"],
                    n = (t.indexOf(gameState.upgradeMultiplier) + 1) % t.length;
                (gameState.upgradeMultiplier = t[n]),
                    (e.textContent = `x${gameState.upgradeMultiplier}`),
                    "business" === gameState.activeTab && updateProductsList();
            }),
        settingsBtn &&
            settingsBtn.addEventListener("click", () => {
                settingsPanel && (settingsPanel.hidden = !1);
            }),
        fullscreenBtn)
    ) {
        function t() {
            document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement
                ? ((fullscreenBtn.textContent = "⛶"),
                  fullscreenBtn.classList.add("is-fullscreen"),
                  (fullscreenBtn.title = "Exit Fullscreen"))
                : ((fullscreenBtn.textContent = "⛶"),
                  fullscreenBtn.classList.remove("is-fullscreen"),
                  (fullscreenBtn.title = "Toggle Fullscreen"));
        }
        fullscreenBtn.addEventListener("click", () => {
            if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement)
                document.exitFullscreen
                    ? document.exitFullscreen()
                    : document.webkitExitFullscreen
                      ? document.webkitExitFullscreen()
                      : document.mozCancelFullScreen
                        ? document.mozCancelFullScreen()
                        : document.msExitFullscreen && document.msExitFullscreen();
            else {
                const e = document.documentElement;
                e.requestFullscreen
                    ? e.requestFullscreen()
                    : e.webkitRequestFullscreen
                      ? e.webkitRequestFullscreen()
                      : e.mozRequestFullScreen
                        ? e.mozRequestFullScreen()
                        : e.msRequestFullscreen && e.msRequestFullscreen();
            }
        }),
            document.addEventListener("fullscreenchange", t),
            document.addEventListener("webkitfullscreenchange", t),
            document.addEventListener("mozfullscreenchange", t);
    }
    const n = $("toggleHeaderBtn"),
        a = $("toggleHeaderIcon"),
        o = $("topBar"),
        i = $("newsTicker"),
        s = $("tabNav"),
        r = $("mainContent");
    let l = "true" === localStorage.getItem("headerCollapsed") || !1,
        c = 50,
        d = 33;
    function p() {
        l || (o && (c = o.offsetHeight), i && (d = i.offsetHeight));
    }
    function m() {
        n && (n.style.top = l ? "0px" : c + "px");
    }
    function u() {
        s && (s.style.top = l ? "0px" : c + d + "px");
    }
    // Pin the news ticker directly below the (measured) header so it owns its own band
    // and never overlaps the icon row — critical on mobile where the header wraps taller.
    function tk() {
        i && (i.style.top = l ? "0px" : c + "px");
    }
    window.addEventListener("resize", () => {
        p(), tk(), m(), u();
    }),
        o &&
            o.addEventListener("transitionend", (e) => {
                "max-height" !== e.propertyName || l || (p(), tk(), m(), u());
            }),
        l
            ? (o && o.classList.add("collapsed"),
              i && i.classList.add("collapsed"),
              s && s.classList.add("icons-only"),
              a && (a.textContent = "▼"),
              r && r.classList.add("header-collapsed"))
            : p(),
        tk(),
        m(),
        u(),
        n &&
            n.addEventListener("click", () => {
                (l = !l),
                    l
                        ? (p(),
                          o && o.classList.add("collapsed"),
                          i && i.classList.add("collapsed"),
                          s && s.classList.add("icons-only"),
                          a && (a.textContent = "▼"),
                          r && r.classList.add("header-collapsed"))
                        : (o && o.classList.remove("collapsed"),
                          i && i.classList.remove("collapsed"),
                          s && s.classList.remove("icons-only"),
                          a && (a.textContent = "▲"),
                          r && r.classList.remove("header-collapsed")),
                    tk(),
                    m(),
                    u(),
                    localStorage.setItem("headerCollapsed", l);
            }),
        // Re-pin the ticker/tabNav whenever the header's measured height changes
        // (mobile wrap, orientation, font/number reflow) so bands never overlap.
        window.ResizeObserver &&
            o &&
            new ResizeObserver(() => {
                p(), tk(), m(), u();
            }).observe(o),
        closeSettingsBtn &&
            closeSettingsBtn.addEventListener("click", () => {
                settingsPanel && (settingsPanel.hidden = !0);
            });
    const g = $("settingsModal"),
        h = $("openFullSettingsBtn"),
        y = $("closeSettingsModalBtn"),
        f = document.querySelectorAll(".settings-tab-btn");
    h &&
        h.addEventListener("click", () => {
            if (g) {
                g.style.display = "flex";
                const e = $("sfwModeToggleQuick"),
                    t = $("sfwModeToggle");
                e && t && (t.checked = e.checked), k();
            }
        }),
        y &&
            y.addEventListener("click", () => {
                g && (g.style.display = "none");
            }),
        g &&
            g.addEventListener("click", (e) => {
                e.target === g && (g.style.display = "none");
            }),
        f.forEach((e) => {
            e.addEventListener("click", () => {
                const t = e.dataset.settingsTab;
                f.forEach((e) => {
                    e.classList.remove("active"),
                        (e.style.borderBottomColor = "transparent"),
                        (e.style.color = "var(--l-ink-dim-2)");
                }),
                    e.classList.add("active"),
                    (e.style.borderBottomColor = "var(--l-indigo)"),
                    (e.style.color = "var(--l-indigo)"),
                    document.querySelectorAll(".settings-tab-content").forEach((e) => {
                        e.style.display = "none";
                    });
                const n = $("settingsTab-" + t);
                n && (n.style.display = "block"),
                    "logging" === t && window.renderLoggingSettings && window.renderLoggingSettings(),
                    "display" === t && window.renderDisplaySettings && window.renderDisplaySettings();
            });
        });
    const b = $("quickSaveBtn"),
        v = $("quickLoadBtn"),
        w = $("openCheatsQuickBtn"),
        x = $("openPatchNotesQuickBtn");
    b && b.addEventListener("click", () => saveGame(!0)),
        v &&
            v.addEventListener("click", async () => {
                const e = await listAllSaves();
                if (0 === e.length) return void showNotification("❌ No saves found!", "error");
                const t = e.filter((e) => "quick" === e.saveType),
                    n = t.length > 0 ? t[0] : e[0],
                    a = n.saveName || n.slotName;
                (await showConfirm(`Load "${a}"?\n\nCurrent progress will be lost.`, "Load Save", {
                    type: "info",
                    confirmText: "Load",
                })) && loadGameFromSlot(n.slotName);
            }),
        w &&
            w.addEventListener("click", () => {
                const e = $("cheatsModal");
                e && (e.style.display = "flex");
            }),
        x &&
            x.addEventListener("click", () => {
                const e = $("patchNotesModal");
                e && (e.style.display = "flex"), loadPatchNotes();
            });
    const S = $("sfwModeToggleQuick");
    function k() {
        const e = $("aiQueueStatusModal"),
            t = $("aiQueueCountsModal"),
            n = $("aiTotalGeneratedModal"),
            a = $("aiQueueStatus"),
            o = $("aiQueueCounts"),
            i = $("aiTotalGenerated");
        e && a && (e.textContent = a.textContent),
            t && o && (t.textContent = o.textContent),
            n && i && (n.textContent = i.textContent);
        const s = $("imageQueueStatusModal"),
            r = $("imageQueueCountsModal"),
            l = $("imageTotalGeneratedModal"),
            c = $("imageQueueStatus"),
            d = $("imageQueueCounts"),
            p = $("imageTotalGenerated");
        s && c && (s.textContent = c.textContent),
            r && d && (r.textContent = d.textContent),
            l && p && (l.textContent = p.textContent);
        const m = $("autoVisualizeStatusQuick"),
            u = $("autoVisualizeCountQuick"),
            g = $("autoVisualizeStatus"),
            h = $("autoVisualizeCount");
        m && g && (m.textContent = g.textContent), u && h && (u.textContent = h.textContent);
    }
    S &&
        ((S.checked = gameState.settings?.sfwMode || !1),
        S.addEventListener("change", (e) => {
            gameState.settings.sfwMode = e.target.checked;
            const t = $("sfwModeToggle");
            t && (t.checked = e.target.checked),
                I(),
                applySFWModeFilters(),
                saveGame(!1),
                e.target.checked
                    ? showNotification("🛡️ SFW Mode enabled", "success")
                    : showNotification("🔓 SFW Mode disabled", "info");
        })),
        (window.syncSettingsModalDisplays = k),
        autosaveToggle &&
            autosaveToggle.addEventListener("change", (e) => {
                (gameState.settings.autosave = e.target.checked), setupAutosave();
            });
    const T = $("enableStreamingToggle");
    function C() {
        const e = $("streamingStatusText");
        if (!e) return;
        const t = gameState.settings?.enableStreamingResponses ?? !0;
        (e.textContent = t ? "Streaming Enabled" : "Streaming Disabled"),
            (e.style.color = t ? "var(--l-cyan)" : "var(--l-red)");
    }
    T &&
        ((T.checked = gameState.settings?.enableStreamingResponses ?? !0),
        C(),
        T.addEventListener("change", (e) => {
            (gameState.settings.enableStreamingResponses = e.target.checked),
                C(),
                saveGame(!1),
                showNotification(
                    e.target.checked
                        ? "🌊 Streaming enabled — AI responses now stream word-by-word"
                        : "⏸️ Streaming disabled — AI responses appear all at once",
                    "info"
                );
        }));
    const E = $("sfwModeToggle");
    $("sfwModeStatusText");
    function I() {
        const e = $("sfwModeStatusText");
        e &&
            (gameState.settings?.sfwMode
                ? ((e.textContent = "SFW Mode Active"), (e.style.color = "var(--l-green)"))
                : ((e.textContent = "NSFW Content Enabled"), (e.style.color = "var(--l-red)")));
    }
    E &&
        ((E.checked = gameState.settings?.sfwMode || !1),
        I(),
        gameState.settings?.sfwMode && setTimeout(() => applySFWModeFilters(), 500),
        E.addEventListener("change", (e) => {
            (gameState.settings.sfwMode = e.target.checked),
                I(),
                applySFWModeFilters(),
                saveGame(!1),
                e.target.checked
                    ? showNotification("🛡️ SFW Mode enabled - All NSFW content has been hidden", "success")
                    : showNotification("🔓 SFW Mode disabled - Full content unlocked", "info");
        }));
    const M = $("disableStoryEventsToggle");
    $("storyModeStatusText");
    function P() {
        const e = $("storyModeStatusText");
        e &&
            (gameState.settings?.disableStoryEvents
                ? ((e.textContent = "Story & Events Disabled"), (e.style.color = "var(--l-red)"))
                : ((e.textContent = "Story & Events Enabled"), (e.style.color = "var(--l-green)")));
    }
    function A() {
        const e = gameState.settings?.disableStoryEvents,
            t = document.querySelector('.tab-btn[data-tab="story"]');
        if (t && ((t.style.display = e ? "none" : ""), e && t.classList.contains("active"))) {
            const e = document.querySelector('.tab-btn[data-tab="dashboard"]');
            e && e.click();
        }
        const n = document.getElementById("eventBellBtn");
        if ((n && (n.style.display = e ? "none" : ""), e)) {
            const e = document.getElementById("eventBellDot"),
                t = document.getElementById("eventBellCount");
            e && (e.style.display = "none"),
                t && (t.style.display = "none"),
                gameState.dynamicEvents && (gameState.dynamicEvents.queue = []);
        }
    }
    M &&
        ((M.checked = gameState.settings?.disableStoryEvents || !1),
        P(),
        A(),
        M.addEventListener("change", (e) => {
            (gameState.settings.disableStoryEvents = e.target.checked),
                gameState.story?.settings && (gameState.story.settings.storyEnabled = !e.target.checked),
                P(),
                A(),
                saveGame(!1),
                e.target.checked
                    ? showNotification("📖 Story Mode & Events disabled - Pure sandbox mode activated", "info")
                    : showNotification("📖 Story Mode & Events enabled - Narrative features restored", "success");
        }));
    const N = $("customCompanyContext"),
        L = $("customWorldContext"),
        _ = $("customAIContext"),
        R = $("saveCustomContextBtn"),
        D = $("customContextStatus");
    N && gameState.settings?.customContext?.company && (N.value = gameState.settings.customContext.company),
        L && gameState.settings?.customContext?.world && (L.value = gameState.settings.customContext.world),
        _ && gameState.settings?.customContext?.aiNotes && (_.value = gameState.settings.customContext.aiNotes),
        R &&
            R.addEventListener("click", () => {
                gameState.settings.customContext ||
                    (gameState.settings.customContext = { company: "", world: "", aiNotes: "" }),
                    (gameState.settings.customContext.company = N?.value?.trim() || ""),
                    (gameState.settings.customContext.world = L?.value?.trim() || ""),
                    (gameState.settings.customContext.aiNotes = _?.value?.trim() || ""),
                    saveGame(!1),
                    D &&
                        ((D.style.display = "block"),
                        setTimeout(() => {
                            D.style.display = "none";
                        }, 3e3));
                gameState.settings.customContext.company ||
                gameState.settings.customContext.world ||
                gameState.settings.customContext.aiNotes
                    ? showNotification(
                          "🌍 Custom world context saved! NPCs will now reference your settings.",
                          "success"
                      )
                    : showNotification("🌍 Custom context cleared. NPCs will use default settings.", "info");
            });
    const F = $("postsPerPageSlider"),
        G = $("postsPerPageValue");
    if (
        F &&
        G &&
        (F.addEventListener("input", (e) => {
            const t = parseInt(e.target.value);
            (feedPaginationState.postsPerPage = t),
                (G.textContent = t),
                gameState.settings.performance || (gameState.settings.performance = {}),
                (gameState.settings.performance.postsPerPage = t);
            const n = $("socialTab");
            ((n && !n.classList.contains("tab-content")) || (n && "none" !== n.style.display)) &&
                renderSocialFeed(!0);
        }),
        gameState.settings.performance?.postsPerPage)
    ) {
        const _a = gameState.settings.performance.postsPerPage;
        (F.value = _a), (G.textContent = _a), (feedPaginationState.postsPerPage = _a);
    }
    const B = $("maxAiRequestsSlider"),
        O = $("maxAiRequestsValue");
    if (B && O) {
        B.addEventListener("input", (e) => {
            const t = parseInt(e.target.value);
            AIRequestQueue.updateMaxConcurrent(t), (O.textContent = t);
        });
        const Ra = gameState.settings?.maxAiRequests || 15;
        (B.value = Ra), (O.textContent = Ra), AIRequestQueue.updateMaxConcurrent(Ra);
    }
    const q = $("maxImageRequestsSlider"),
        z = $("maxImageRequestsValue");
    if (q && z) {
        q.addEventListener("input", (e) => {
            const t = parseInt(e.target.value);
            ImageRequestQueue.updateMaxConcurrent(t), (z.textContent = t);
        });
        const Da = gameState.settings?.maxImageRequests || 8;
        (q.value = Da), (z.textContent = Da), ImageRequestQueue.updateMaxConcurrent(Da);
    }
    const j = $("chatSettingsBtn"),
        H = $("chatSettingsPanel");
    j &&
        H &&
        j.addEventListener("click", () => {
            const e = "none" === H.style.display;
            H.style.display = e ? "block" : "none";
        });
    document.querySelectorAll('input[name="chatCommMode"]').forEach((e) => {
        e.addEventListener("change", (e) => {
            if (gameState.activeChat) {
                const t = e.target.value;
                gameState.activeChat.chatCommMode = t;
                const n = gameState.activeChat.id,
                    a = gameState.employees.find((e) => e.id === n);
                a && ((a.chatCommMode = t), (a.lastPlayerMessageTime = gameState.time?.currentTime || Date.now())),
                    console.log(`[Chat] Communication mode for ${gameState.activeChat.name} set to:`, t),
                    saveGame(!1);
            }
        });
    });
    const U = $("chatWidthSlider2"),
        Y = $("chatWidthValue2");
    U &&
        Y &&
        (U.addEventListener("input", (e) => {
            const t = parseInt(e.target.value);
            (gameState.settings.chatWidth = t), (Y.textContent = `${t}px`), Z();
        }),
        gameState.settings.chatWidth &&
            ((U.value = gameState.settings.chatWidth), (Y.textContent = `${gameState.settings.chatWidth}px`)));
    const W = $("chatHeightSlider2"),
        V = $("chatHeightValue2");
    W &&
        V &&
        (W.addEventListener("input", (e) => {
            const t = parseInt(e.target.value);
            (gameState.settings.chatHeight = t), (V.textContent = `${t}%`), Z();
        }),
        gameState.settings.chatHeight &&
            ((W.value = gameState.settings.chatHeight), (V.textContent = `${gameState.settings.chatHeight}%`)));
    const K = $("textSizeSlider2"),
        Q = $("textSizeValue2");
    K &&
        Q &&
        (K.addEventListener("input", (e) => {
            const t = parseInt(e.target.value);
            (gameState.settings.textSize = t), (Q.textContent = `${t}%`), Z();
        }),
        gameState.settings.textSize &&
            ((K.value = gameState.settings.textSize), (Q.textContent = `${gameState.settings.textSize}%`)));
    const J = $("imagePreviewSizeSlider2"),
        X = $("imagePreviewSizeValue2");
    function Z() {
        const e = $("chatContainer");
        if (!e) return;
        if (
            (function () {
                const e = window.innerWidth <= 768,
                    t = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                return e && t;
            })()
        )
            return (
                e.style.setProperty("width", "90%", "important"),
                e.style.setProperty("max-width", "500px", "important"),
                void e.style.setProperty("height", "95%", "important")
            );
        const t = gameState.settings.chatWidth || 500,
            n = gameState.settings.chatHeight || 95,
            a = gameState.settings.textSize || 100,
            o = gameState.settings.imagePreviewSize || 300;
        e.style.setProperty("width", `${t}px`, "important"),
            e.style.setProperty("max-width", `${t}px`, "important"),
            e.style.setProperty("height", `${n}%`, "important");
        const i = $("chatMessages");
        if ((i && i.style.setProperty("font-size", `${a}%`, "important"), i)) {
            i.querySelectorAll('div[style*="position:relative"][style*="inline-block"]').forEach((e) => {
                e.style.setProperty("max-width", `${o}px`, "important");
                const t = e.parentElement;
                if (t) {
                    const e = `${o + 40}px`;
                    t.style.setProperty("max-width", e, "important");
                }
            });
            i.querySelectorAll("img").forEach((e) => {
                e.style.setProperty("max-width", `${o}px`, "important");
            });
        }
    }
    J &&
        X &&
        (J.addEventListener("input", (e) => {
            const t = parseInt(e.target.value);
            (gameState.settings.imagePreviewSize = t), (X.textContent = `${t}px`), Z();
        }),
        gameState.settings.imagePreviewSize &&
            ((J.value = gameState.settings.imagePreviewSize),
            (X.textContent = `${gameState.settings.imagePreviewSize}px`))),
        Z();
    const ee = $("imageStyleSelect"),
        te = $("customPromptContainer"),
        ne = $("customStylePrompt");
    ee &&
        (ee.addEventListener("change", (e) => {
            const t = e.target.value;
            (gameState.settings.imageStyle = t),
                te && (te.style.display = "custom" === t ? "block" : "none"),
                showNotification(
                    `🎨 Image style set to: ${e.target.options[e.target.selectedIndex].text}`,
                    "success"
                );
        }),
        gameState.settings.imageStyle &&
            ((ee.value = gameState.settings.imageStyle),
            te && "custom" === gameState.settings.imageStyle && (te.style.display = "block"))),
        ne &&
            (ne.addEventListener("input", (e) => {
                gameState.settings.customStylePrompt = e.target.value;
            }),
            gameState.settings.customStylePrompt && (ne.value = gameState.settings.customStylePrompt));
    const ae = $("imagePerspectiveSelect");
    ae &&
        (ae.addEventListener("change", (e) => {
            (gameState.settings.imagePerspective = e.target.value),
                showNotification(
                    `👁️ Image perspective set to: ${e.target.options[e.target.selectedIndex].text}`,
                    "success"
                );
        }),
        gameState.settings.imagePerspective && (ae.value = gameState.settings.imagePerspective)),
        gameState.settings.autoVisualization ||
            (gameState.settings.autoVisualization = {
                enabled: !1,
                minFrequency: 5,
                maxFrequency: 10,
                style: "global",
                perspective: "dynamic",
                nsfwLevel: "match",
                totalGenerated: 0,
            });
    const oe = $("autoVisualizeEnabled");
    oe &&
        (oe.addEventListener("change", (e) => {
            (gameState.settings.autoVisualization.enabled = e.target.checked),
                updateAutoVisualizeStatus(),
                showNotification(
                    e.target.checked ? "🎬 Auto-Visualization enabled!" : "🎬 Auto-Visualization disabled",
                    "success"
                );
        }),
        (oe.checked = gameState.settings.autoVisualization.enabled));
    const ie = $("autoVisualizeMinFreq"),
        se = $("autoVisualizeMinFreqValue"),
        re = $("autoVisualizeMaxFreq"),
        le = $("autoVisualizeMaxFreqValue");
    if (ie && se) {
        ie.addEventListener("input", (e) => {
            let t = parseInt(e.target.value),
                n = parseInt(re?.value || 10);
            t > n && ((t = n), (e.target.value = t)),
                (gameState.settings.autoVisualization.minFrequency = t),
                (se.textContent = t),
                recalculateAutoVisTrackers();
        });
        let Fa = gameState.settings.autoVisualization.minFrequency,
            Ga = gameState.settings.autoVisualization.maxFrequency;
        Fa > Ga && ((Fa = Ga), (gameState.settings.autoVisualization.minFrequency = Fa)),
            (ie.value = Fa),
            (se.textContent = Fa);
    }
    re &&
        le &&
        (re.addEventListener("input", (e) => {
            let t = parseInt(e.target.value),
                n = parseInt(ie?.value || 5);
            t < n && ((t = n), (e.target.value = t)),
                (gameState.settings.autoVisualization.maxFrequency = t),
                (le.textContent = t),
                recalculateAutoVisTrackers();
        }),
        (re.value = gameState.settings.autoVisualization.maxFrequency),
        (le.textContent = gameState.settings.autoVisualization.maxFrequency));
    const ce = $("autoVisualizeStyle");
    ce &&
        (ce.addEventListener("change", (e) => {
            (gameState.settings.autoVisualization.style = e.target.value),
                showNotification(
                    `🎨 Auto-visualization style: ${e.target.options[e.target.selectedIndex].text}`,
                    "success"
                );
        }),
        (ce.value = gameState.settings.autoVisualization.style));
    const de = $("autoVisualizePerspective");
    de &&
        (de.addEventListener("change", (e) => {
            (gameState.settings.autoVisualization.perspective = e.target.value),
                showNotification(
                    `👁️ Auto-visualization perspective: ${e.target.options[e.target.selectedIndex].text}`,
                    "success"
                );
        }),
        (de.value = gameState.settings.autoVisualization.perspective));
    const pe = $("autoVisualizeNSFW");
    pe &&
        (pe.addEventListener("change", (e) => {
            gameState.settings.autoVisualization.nsfwLevel = e.target.value;
        }),
        (pe.value = gameState.settings.autoVisualization.nsfwLevel));
    const me = $("autoVisualizeCustomPrompt");
    me &&
        (me.addEventListener("input", (e) => {
            gameState.settings.autoVisualization.customPrompt = e.target.value;
        }),
        (me.value = gameState.settings.autoVisualization.customPrompt || ""));
    const ue = $("autoVisAddToGallery");
    ue &&
        (ue.addEventListener("change", (e) => {
            gameState.settings.autoVisualization.addToGallery = e.target.checked;
        }),
        (ue.checked = !1 !== gameState.settings.autoVisualization.addToGallery));
    const ge = $("autoVisCooldownAfterManual");
    ge &&
        (ge.addEventListener("change", (e) => {
            gameState.settings.autoVisualization.cooldownAfterManual = e.target.checked;
        }),
        (ge.checked = !1 !== gameState.settings.autoVisualization.cooldownAfterManual));
    const he = $("autoVisIntensityDetection"),
        ye = $("intensityThresholdContainer");
    he &&
        (he.addEventListener("change", (e) => {
            (gameState.settings.autoVisualization.intensityDetection = e.target.checked),
                ye &&
                    ((ye.style.opacity = e.target.checked ? "1" : "0.5"),
                    (ye.style.pointerEvents = e.target.checked ? "auto" : "none")),
                showNotification(
                    e.target.checked ? "🧪 Intensity Detection enabled" : "🧪 Intensity Detection disabled",
                    2e3
                );
        }),
        (he.checked = gameState.settings.autoVisualization.intensityDetection || !1),
        ye &&
            ((ye.style.opacity = he.checked ? "1" : "0.5"),
            (ye.style.pointerEvents = he.checked ? "auto" : "none")));
    const fe = $("autoVisIntensityThreshold"),
        be = $("autoVisIntensityThresholdValue");
    fe &&
        be &&
        (fe.addEventListener("input", (e) => {
            const t = parseInt(e.target.value);
            (gameState.settings.autoVisualization.intensityThreshold = t), (be.textContent = t);
        }),
        (fe.value = gameState.settings.autoVisualization.intensityThreshold || 50),
        (be.textContent = gameState.settings.autoVisualization.intensityThreshold || 50)),
        (window.updateAutoVisualizeStatus = function () {
            const e = $("autoVisualizeStatus"),
                t = $("autoVisualizeCount");
            e &&
                gameState.settings?.autoVisualization &&
                ((e.textContent = gameState.settings.autoVisualization.enabled ? "Active" : "Disabled"),
                (e.style.color = gameState.settings.autoVisualization.enabled ? "var(--l-green)" : "var(--l-ink-dim-2)")),
                t &&
                    gameState.settings?.autoVisualization &&
                    (t.textContent = gameState.settings.autoVisualization.totalGenerated || 0);
        }),
        window.updateAutoVisualizeStatus(),
        gameState.cheatMultipliers ||
            (gameState.cheatMultipliers = {
                affection: 1,
                trust: 1,
                comfort: 1,
                desire: 1,
                productivity: 1,
                confidence: 1,
                obedience: 1,
                flirty: 1,
                professional: 1,
                humor: 1,
            });
    const ve = $("openCheatsBtn"),
        we = $("closeCheatsBtn"),
        xe = $("cheatsModal");
    ve &&
        xe &&
        ve.addEventListener("click", () => {
            (xe.style.display = "flex"), lt(), ct();
        }),
        we &&
            xe &&
            we.addEventListener("click", () => {
                xe.style.display = "none";
            }),
        xe &&
            xe.addEventListener("click", (e) => {
                e.target === xe && (xe.style.display = "none");
            });
    const Se = $("openPatchNotesBtn"),
        ke = $("closePatchNotesBtn"),
        Te = $("patchNotesModal");
    Se &&
        Te &&
        Se.addEventListener("click", () => {
            (Te.style.display = "flex"), loadPatchNotes();
        }),
        ke &&
            Te &&
            ke.addEventListener("click", () => {
                Te.style.display = "none";
            }),
        Te &&
            Te.addEventListener("click", (e) => {
                e.target === Te && (Te.style.display = "none");
            });
    const Ce = $("cheatMoneyBase"),
        Ee = $("cheatMoneyMagnitude"),
        $e = $("cheatMoneyPreview"),
        Ie = $("cheatSetMoneyBtn");
    function Me() {
        if (!Ce || !Ee || !$e) return;
        const e = (parseInt(Ce.value) || 100) * (parseInt(Ee.value) || 1e6);
        $e.textContent = e.toLocaleString();
    }
    Ce && Ce.addEventListener("input", Me),
        Ee && Ee.addEventListener("change", Me),
        Ie &&
            Ce &&
            Ee &&
            Ie.addEventListener("click", () => {
                const e = (parseInt(Ce.value) || 100) * (parseInt(Ee.value) || 1e6);
                (gameState.cash = e),
                    showNotification(`💰 Money set to $${e.toLocaleString()}!`, "success"),
                    updateUI();
            });
    const Pe = [
        "affection",
        "trust",
        "comfort",
        "desire",
        "productivity",
        "confidence",
        "obedience",
        "flirtiness",
        "professionalism",
        "humor",
    ];
    Pe.forEach((e) => {
        const t = $(`${e}MultSlider`),
            n = $(`${e}MultValue`);
        if (t && n) {
            t.addEventListener("input", (t) => {
                const a = parseFloat(t.target.value) / 10;
                (gameState.cheatMultipliers[e] = a), (n.textContent = `${a.toFixed(1)}x`);
            });
            const a = gameState.cheatMultipliers[e] || 1;
            (t.value = 10 * a), (n.textContent = `${a.toFixed(1)}x`);
        }
    });
    const Ae = $("resetMultipliersBtn");
    Ae &&
        Ae.addEventListener("click", () => {
            Pe.forEach((e) => {
                gameState.cheatMultipliers[e] = 1;
                const t = $(`${e}MultSlider`),
                    n = $(`${e}MultValue`);
                t && (t.value = 10), n && (n.textContent = "1.0x");
            }),
                showNotification("🔄 All multipliers reset to 1x", "info");
        });
    const Ne = $("maxMultipliersBtn");
    Ne &&
        Ne.addEventListener("click", () => {
            Pe.forEach((e) => {
                gameState.cheatMultipliers[e] = 5;
                const t = $(`${e}MultSlider`),
                    n = $(`${e}MultValue`);
                t && (t.value = 50), n && (n.textContent = "5.0x");
            }),
                showNotification("⚡ All multipliers set to 5x!", "success");
        });
    const Le = $("cheatStatType"),
        _e = $("cheatStatValue"),
        Re = $("cheatSetStatBtn");
    Re &&
        Le &&
        _e &&
        Re.addEventListener("click", () => {
            const e = Le.value,
                t = parseInt(_e.value);
            if (t < 0 || t > 100) return void showNotification("⚠️ Value must be between 0 and 100", "error");
            let n = 0;
            gameState.employees.forEach((a) => {
                "active" === a.employmentStatus &&
                    (["affection", "trust", "comfort", "desire", "productivity"].includes(e)
                        ? (a.stats || (a.stats = {}), (a.stats[e] = t), n++)
                        : ["confidence", "obedience", "flirty", "professional", "humor"].includes(e) &&
                          (a.personality || (a.personality = {}), (a.personality[e] = t), n++));
            }),
                showNotification(`✅ Set ${e} to ${t} for ${n} employees!`, "success");
        });
    const De = $("cheatMaxAllStatsBtn");
    De &&
        De.addEventListener("click", () => {
            let e = 0;
            gameState.employees.forEach((t) => {
                "active" === t.employmentStatus &&
                    (t.stats || (t.stats = {}),
                    (t.stats.affection = 100),
                    (t.stats.trust = 100),
                    (t.stats.comfort = 100),
                    (t.stats.desire = 100),
                    (t.stats.productivity = 100),
                    t.personality || (t.personality = {}),
                    (t.personality.confidence = 100),
                    (t.personality.obedience = 100),
                    (t.personality.flirty = 100),
                    (t.personality.professional = 100),
                    (t.personality.humor = 100),
                    e++);
            }),
                showNotification(`🌟 Maxed all stats for ${e} employees!`, "success");
        });
    const Fe = $("cheatUnlockAllLocationsBtn");
    Fe &&
        Fe.addEventListener("click", () => {
            let e = 0;
            gameState.locations.forEach((t) => {
                t.owned || ((t.owned = !0), (t.unlocked = !0), e++);
            }),
                showNotification(`🏢 Unlocked ${e} locations!`, "success"),
                renderLocations();
        });
    const Ge = $("cheatUnlockAllProductsBtn");
    Ge &&
        Ge.addEventListener("click", () => {
            let e = 0;
            gameState.products.forEach((t) => {
                t.unlocked || ((t.unlocked = !0), e++);
            }),
                showNotification(`📦 Unlocked ${e} products!`, "success"),
                renderProducts();
        });
    const Be = $("cheatHireAllBtn");
    Be &&
        Be.addEventListener("click", () => {
            if (!gameState.candidates || 0 === gameState.candidates.length)
                return void showNotification("⚠️ No candidates available to hire!", "error");
            const e = gameState.candidates.filter((e) => !e.hired);
            e.forEach((e) => {
                (e.hired = !0),
                    (e.employmentStatus = "active"),
                    (e.hireDate = gameNow()),
                    (e.bioComplete = !0),
                    (e.onboarding = !1),
                    initializeEmployeeSocialData(e),
                    gameState.employees.push(e),
                    generateRandomRelationships(e.id);
            }),
                (gameState.candidates = gameState.candidates.filter((e) => e.hired)),
                showNotification(`👥 Hired ${e.length} candidates!`, "success"),
                updateCompanyAwareness();
        });
    const Oe = $("cheatClearPostsBtn");
    Oe &&
        Oe.addEventListener("click", () => {
            const e = gameState.socialNetwork.posts.length;
            (gameState.socialNetwork.posts = []),
                (gameState.socialNetwork.postIdCounter = 0),
                (gameState.socialNetwork.lastPostGeneration = 0),
                (gameState.socialNetwork.recentPostTypes = []),
                (gameState.socialNetwork.globalEvents = []),
                gameState.socialNetwork.playerDraft &&
                    (gameState.socialNetwork.playerDraft = {
                        caption: "",
                        imagePrompt: "",
                        altText: "",
                        imageUrl: null,
                    }),
                (gameState.socialFeed = []),
                (gameState.socialStats = { totalPosts: 0, totalLikes: 0, totalComments: 0 }),
                void 0 !== feedPaginationState &&
                    ((feedPaginationState.currentPage = 1),
                    (feedPaginationState.totalPages = 1),
                    (feedPaginationState.allPosts = []),
                    feedPaginationState.pendingUpdates.clear()),
                saveGame(!1),
                showNotification(`🗑️ Cleared ${e} posts! Social feed reset.`, "info"),
                "social" === gameState.activeTab && renderSocialFeed(!0);
        });
    const qe = $("cheatSpawnPostsBtn");
    qe &&
        qe.addEventListener("click", async () => {
            const e = gameState.employees.filter((e) => "active" === e.employmentStatus);
            if (0 === e.length) return void showNotification("⚠️ No active employees to create posts!", "error");
            showNotification("📱 Generating 10 NPC posts...", "info");
            const t = [
                "Coffee break! ☕",
                "Busy day at work 💼",
                "Finally done with that project! 🎉",
                "Anyone else tired? 😴",
                "Looking forward to the weekend! 🌴",
                "Great teamwork today! 👏",
                "Just finished a meeting 📊",
                "Time flies when you're working hard ⏰",
                "Loving the office vibes today! 💯",
                "Can't believe it's already this late! 😅",
                "Productive day! ✅",
                "Office life be like... 🤷",
                "Happy to be here! 😊",
                "Made some progress today 📈",
                "Working on something exciting! 🚀",
                "Team lunch was great! 🍔",
                "Another milestone reached! 🎯",
                "Feeling accomplished today 💪",
                "Good vibes only! ✨",
                "Grateful for this team! 🙏",
                "Accidentally said 'you too' when the delivery guy said 'enjoy your food' 💀",
                "That 3pm slump is REAL today 😩",
                "Someone brought donuts and I have zero self-control 🍩",
                "Just had the best idea in the shower... forgot it by the time I got out 🚿😢",
                "Why does my to-do list keep getting longer instead of shorter 📝",
                "New playlist, new energy, new me (until tomorrow) 🎵",
                "Overheard the funniest conversation in the break room today 😂",
                "Started a book last night and accidentally stayed up until 3am 📚",
                "My plant is still alive after 2 months, basically a green thumb now 🌱",
                "That feeling when your code works on the first try 🤯",
                "Trying a new recipe tonight, pray for my kitchen 🙏🍳",
                "The sunset from my window right now is unreal 🌅",
                "Just found out we have a nap room and my life is changed forever 😴",
                "Motivation levels: exists, but barely 📉",
                "Had the weirdest dream last night and I need to talk about it 😂",
                "Sometimes you just need a long walk and a good podcast 🎧",
                "Counting down to vacation like my life depends on it ✈️",
                "The audacity of my alarm clock this morning... 😤⏰",
                "Personal growth is realizing I don't have to reply to that email right now 💅",
                "Comfort food and a good show = perfect evening 🛋️🍕",
            ];
            for (let n = 0; n < 10; n++) {
                const n = e[Math.floor(Math.random() * e.length)],
                    a = t[Math.floor(Math.random() * t.length)];
                createSocialPost({
                    authorId: n.id,
                    authorName: n.name,
                    type: "life_update",
                    content: a,
                    timestamp: gameState.time.currentTime,
                    likes: [],
                    comments: [],
                    mentions: [],
                });
            }
            showNotification("✅ Generated 10 NPC posts!", "success"),
                "social" === gameState.activeTab && renderSocialFeed(!0);
        });
    const ze = $("timeScaleSlider"),
        je = $("timeScaleValue"),
        He = $("timeScaleDescription");
    if (ze && je && He) {
        const Ba = (e) => {
                je.textContent = `${e}x`;
                let t = "";
                (t =
                    1 === e
                        ? "Real-time (1:1) - Extremely slow!"
                        : e <= 10
                          ? `${e} game minutes = 1 real minute (Slow)`
                          : e <= 30
                            ? `${e} game minutes = 1 real minute (Normal)`
                            : e <= 60
                              ? `${e} game minutes = 1 real minute (Fast)`
                              : `${e} game minutes = 1 real minute (Very Fast!)`),
                    (He.textContent = t);
            },
            Oa = gameState.time.baseTimeScale || gameState.time.timeScale || 20;
        Ba(Oa),
            (ze.value = Oa),
            ze.addEventListener("input", (e) => {
                const t = parseInt(e.target.value);
                Ba(t),
                    (gameState.time.timeScale = t),
                    (gameState.time.baseTimeScale = t),
                    gameState.time.timeDilation && (gameState.time.timeDilation.idleScale = t),
                    showNotification(`⏰ Base time scale set to ${t}x (slower during conversations)`, "info");
            });
    }
    document.querySelectorAll(".time-preset-btn").forEach((e) => {
        e.addEventListener("click", () => {
            const t = parseInt(e.dataset.scale);
            ze && ((ze.value = t), ze.dispatchEvent(new Event("input")));
        });
    });
    const Ue = $("pauseTimeBtn");
    Ue &&
        Ue.addEventListener("click", () => {
            (gameState.time.paused = !gameState.time.paused),
                gameState.time.paused
                    ? ((Ue.innerHTML = "▶️ Resume Time"),
                      (Ue.style.background = "linear-gradient(135deg, var(--l-green) 0%, var(--l-cyan) 100%)"),
                      showNotification("⏸️ Time paused", "info"))
                    : ((Ue.innerHTML = "⏸️ Pause Time"),
                      (Ue.style.background = "linear-gradient(135deg, var(--l-red) 0%, var(--l-pink) 100%)"),
                      showNotification("▶️ Time resumed", "info")),
                et();
        });
    const Ye = $("skipTimeBtn");
    Ye &&
        Ye.addEventListener("click", () => {
            (gameState.time.currentTime += 864e5),
                window.onDayChange && window.onDayChange(),
                showNotification("⏭️ Skipped forward 1 day!", "success"),
                et(),
                updateTimeDisplay();
        });
    Object.entries({ skipTime1HrBtn: 1, skipTime3HrBtn: 3, skipTime8HrBtn: 8 }).forEach(([e, t]) => {
        const n = $(e);
        n &&
            n.addEventListener("click", () => {
                const e = 60 * t * 60 * 1e3;
                if (((gameState.time.currentTime += e), window.onHourChange))
                    for (let e = 0; e < t; e++) window.onHourChange();
                showNotification(`⏩ Skipped forward ${t} hour${t > 1 ? "s" : ""}!`, "success"),
                    et(),
                    updateTimeDisplay();
            });
    });
    const We = $("timeDilationEnabled"),
        Ve = $("timeDilationSettings");
    We &&
        gameState.time &&
        gameState.time.timeDilation &&
        ((We.checked = !1 !== gameState.time.timeDilation.enabled),
        Ve &&
            ((Ve.style.opacity = We.checked ? "1" : "0.5"),
            (Ve.style.pointerEvents = We.checked ? "auto" : "none"))),
        We &&
            We.addEventListener("change", (e) => {
                const t = e.target.checked;
                gameState.time && gameState.time.timeDilation && (gameState.time.timeDilation.enabled = t),
                    Ve && ((Ve.style.opacity = t ? "1" : "0.5"), (Ve.style.pointerEvents = t ? "auto" : "none")),
                    showNotification(
                        t
                            ? "⏳ Time dilation enabled - time slows during conversations"
                            : "⏳ Time dilation disabled - constant time speed",
                        "info"
                    );
            });
    const Ke = $("conversationTimeScale");
    Ke &&
        gameState.time &&
        gameState.time.timeDilation &&
        ((Ke.value = gameState.time.timeDilation.conversationScale || 1),
        Ke.addEventListener("change", (e) => {
            const t = Math.max(1, Math.min(20, parseInt(e.target.value) || 1));
            (e.target.value = t),
                (gameState.time.timeDilation.conversationScale = t),
                showNotification(`💬 Conversation time scale: ${t}x`, "info");
        }));
    const Qe = $("groupChatTimeScale");
    Qe &&
        gameState.time &&
        gameState.time.timeDilation &&
        ((Qe.value = gameState.time.timeDilation.groupChatScale || 2),
        Qe.addEventListener("change", (e) => {
            const t = Math.max(1, Math.min(20, parseInt(e.target.value) || 2));
            (e.target.value = t),
                (gameState.time.timeDilation.groupChatScale = t),
                showNotification(`👥 Group chat time scale: ${t}x`, "info");
        }));
    const Je = $("socialBrowsingTimeScale");
    function Xe() {
        const e = $("scheduledEventsList"),
            t = $("scheduledEventsCount");
        if (!e) return;
        const n = (gameState.npcScheduledEvents || []).filter((e) => "pending" === e.status);
        if (
            (n.sort((e, t) => e.triggerTime - t.triggerTime),
            t && (t.textContent = `(${n.length} pending)`),
            0 === n.length)
        )
            return void (e.innerHTML =
                '<p style="color:var(--text-mute); text-align:center; margin:10px 0; font-size:0.85rem;">No pending events</p>');
        const a = gameState.time?.currentTime || Date.now();
        e.innerHTML = n
            .map((e) => {
                new Date(e.triggerTime);
                const t = e.triggerTime - a,
                    n = Math.floor(t / 36e5),
                    o = Math.floor((t % 36e5) / 6e4);
                let i = "";
                if (n > 24) {
                    const e = Math.floor(n / 24);
                    i = `in ${e} day${e > 1 ? "s" : ""}`;
                } else i = n > 0 ? `in ${n}h ${o}m` : o > 0 ? `in ${o}m` : "soon!";
                const s =
                        {
                            future_contact: "💬",
                            same_day_meet: "🤝",
                            lunch_meet: "🍽️",
                            confirm_plans: "✅",
                            scheduled_visit: "🏢",
                            conditional_contact: "❓",
                            relative_time: "⏰",
                            weekend_plans: "🎉",
                            next_week: "📆",
                        }[e.type] || "📅",
                    r = "player" === e.source ? "👤" : "🤖";
                return `\n          <div style="padding:8px; margin-bottom:6px; background:var(--surface); border-radius:6px; border-left:3px solid ${"player" === e.source ? "var(--l-green)" : "var(--l-pink-3)"};">\n            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px;">\n              <span style="color:var(--l-ink); font-weight:600; font-size:0.85rem;">${s} ${e.npcName}</span>\n              <span style="color:var(--text-dim); font-size:0.75rem;">${r} ${i}</span>\n            </div>\n            <div style="color:var(--text-mute); font-size:0.8rem; margin-bottom:4px;">${e.type.replace(/_/g, " ")}</div>\n            <div style="color:var(--text-mute); font-size:0.75rem; font-style:italic; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">"${e.originalPhrase}"</div>\n            <button onclick="cancelScheduledEvent('${e.id}'); refreshScheduledEventsPanel();" style="margin-top:6px; padding:2px 8px; background:var(--l-red); border:none; border-radius:4px; color:var(--l-ink-on-fill); cursor:pointer; font-size:0.7rem;">\n              ❌ Cancel\n            </button>\n          </div>\n        `;
            })
            .join("");
    }
    Je &&
        gameState.time &&
        gameState.time.timeDilation &&
        ((Je.value = gameState.time.timeDilation.socialBrowsingScale || 10),
        Je.addEventListener("change", (e) => {
            const t = Math.max(1, Math.min(50, parseInt(e.target.value) || 10));
            (e.target.value = t),
                (gameState.time.timeDilation.socialBrowsingScale = t),
                showNotification(`📱 Social browsing time scale: ${t}x`, "info");
        })),
        (window.refreshScheduledEventsPanel = Xe);
    const Ze = $("refreshScheduledEventsBtn");
    function et() {
        const e = $("cheatGameTime"),
            t = $("cheatTimeStatus");
        if (e && gameState.time) {
            const t = new Date(gameState.time.currentTime);
            e.textContent = t.toLocaleString();
        }
        t &&
            gameState.time &&
            (gameState.time.paused
                ? ((t.textContent = "Paused"), (t.style.color = "var(--l-red)"))
                : ((t.textContent = `Running (${gameState.time.timeScale}x)`), (t.style.color = "var(--l-green)")));
    }
    Ze && Ze.addEventListener("click", Xe);
    let tt = null;
    const nt = $("openCheatsBtn"),
        at = $("closeCheatsBtn");
    nt &&
        nt.addEventListener("click", () => {
            setTimeout(() => {
                et(), Xe(), (tt = setInterval(et, 1e3));
            }, 100);
        }),
        at &&
            at.addEventListener("click", () => {
                tt && (clearInterval(tt), (tt = null));
            });
    const ot = $("cheatRefreshContextBtn");
    ot &&
        ot.addEventListener("click", () => {
            lt();
        });
    const it = $("cheatClearContextBtn");
    it &&
        it.addEventListener("click", async () => {
            (await showConfirm(
                "Clear all Company-Wide Context items? NPCs will forget all recent company events.",
                "Clear Context",
                { type: "warning", confirmText: "Clear All" }
            )) &&
                ((gameState.companyWideContext.currentBuzz = []),
                lt(),
                showNotification("🗑️ Company-Wide Context cleared!", "info"));
        });
    const st = $("cheatRefreshGossipBtn");
    st &&
        st.addEventListener("click", () => {
            ct();
        });
    const rt = $("cheatClearGossipBtn");
    function lt() {
        const e = $("contextList"),
            t = $("contextCountLabel");
        if (!e || !t) return;
        const n = gameState.companyWideContext?.currentBuzz || [];
        if (((t.textContent = `(${n.length}/${gameState.companyWideContext?.maxItems || 40})`), 0 === n.length))
            return void (e.innerHTML =
                '<p style="color:var(--text-dim); text-align:center; margin:20px 0;">No context items yet</p>');
        const a = [...n].sort((e, t) => t.timestamp - e.timestamp);
        e.innerHTML = a
            .map((e, t) => {
                const n = dt(e.timestamp),
                    a = e.juiciness || 0;
                return `\n          <div style="background:var(--surface-2); border-radius:8px; padding:12px; margin-bottom:8px; border-left:3px solid ${a > 70 ? "var(--l-red)" : a > 40 ? "var(--l-gold)" : "var(--l-cyan)"};">\n            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:6px;">\n              <div style="flex:1;">\n                <div style="color:var(--text); font-size:0.95rem; line-height:1.4; margin-bottom:6px;">${e.info}</div>\n                <div style="display:flex; gap:12px; font-size:0.8rem; color:var(--text-dim);">\n                  <span>🔥 ${a}/100</span>\n                  <span>⏰ ${n}</span>\n                  ${e.involvedEmployees ? `<span>👥 ${e.involvedEmployees.length}</span>` : ""}\n                </div>\n              </div>\n              <button onclick="removeContextItem(${t})" style="background:var(--l-red); border:none; padding:6px 10px; border-radius:6px; color:var(--l-ink-on-fill); cursor:pointer; font-size:0.8rem; margin-left:8px;">\n                🗑️\n              </button>\n            </div>\n          </div>\n        `;
            })
            .join("");
    }
    function ct() {
        const e = $("gossipList"),
            t = $("gossipCountLabel");
        if (!e || !t) return;
        const n = gameState.employees
            .filter((e) => "active" === e.employmentStatus)
            .filter((e) => e.gossip && e.gossip.knownGossip && e.gossip.knownGossip.length > 0);
        (t.textContent = `(${n.length} NPCs)`),
            0 !== n.length
                ? (e.innerHTML = n
                      .map((e) => {
                          const t = e.gossip?.knownGossip || [],
                              n = t.length;
                          return `\n          <div style="background:var(--surface-2); border-radius:8px; padding:12px; margin-bottom:12px; border:1px solid var(--l-pink-3);">\n            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">\n              <div style="display:flex; align-items:center; gap:10px;">\n                <img src="${e.profileImage || placeholderImage(40, 40)}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">\n                <div>\n                  <div style="color:var(--l-ink); font-weight:600;">${e.name}</div>\n                  <div style="color:var(--text-dim); font-size:0.85rem;">${n} gossip item${1 !== n ? "s" : ""}</div>\n                </div>\n              </div>\n              <button onclick="clearEmployeeGossip('${e.id}')" style="background:var(--l-red); border:none; padding:6px 12px; border-radius:6px; color:var(--l-ink-on-fill); cursor:pointer; font-size:0.8rem;">\n                Clear\n              </button>\n            </div>\n            <div style="max-height:150px; overflow-y:auto;">\n              ${t
                                  .slice(0, 5)
                                  .map((e) => {
                                      const t = dt(e.timestamp || e.heardAt || Date.now());
                                      return `\n                  <div style="background:var(--surface); border-radius:6px; padding:8px; margin-bottom:6px; border-left:2px solid ${e.juiciness > 70 ? "var(--l-red)" : e.juiciness > 40 ? "var(--l-gold)" : "var(--l-cyan)"};">\n                    <div style="color:var(--text); font-size:0.9rem; margin-bottom:4px;">${e.content || e.info || e.description || "Unknown gossip"}</div>\n                    <div style="display:flex; gap:8px; font-size:0.75rem; color:var(--text-dim);">\n                      <span>🔥 ${e.juiciness || 0}</span>\n                      <span>⏰ ${t}</span>\n                      ${e.source ? `<span>📢 ${e.source}</span>` : ""}\n                    </div>\n                  </div>\n                `;
                                  })
                                  .join(
                                      ""
                                  )}\n              ${n > 5 ? `<p style="color:var(--text-dim); font-size:0.85rem; text-align:center; margin:8px 0 0 0;">+${n - 5} more...</p>` : ""}\n            </div>\n          </div>\n        `;
                      })
                      .join(""))
                : (e.innerHTML = '<p style="color:var(--text-dim); text-align:center; margin:20px 0;">No gossip yet</p>');
    }
    function dt(e) {
        const t = gameState.time?.currentTime || Date.now(),
            n = Math.floor((t - e) / 1e3);
        if (n < 60) return `${n}s ago`;
        const a = Math.floor(n / 60);
        if (a < 60) return `${a}m ago`;
        const o = Math.floor(a / 60);
        if (o < 24) return `${o}h ago`;
        return `${Math.floor(o / 24)}d ago`;
    }
    function pt() {
        const e = document.getElementById("statRangeControls");
        if (!e) return;
        const t = {
                productivity: "💼 Productivity",
                trust: "🤝 Trust",
                friendship: "💚 Friendship",
                desire: "💕 Desire",
                comfort: "😌 Comfort",
                affection: "❤️ Affection",
            },
            arr = (s, w, d, sym) =>
                `<button type="button" onclick="hrStatNudge('${s}','${w}',${d})" title="${d > 0 ? "+" : ""}${d}">${sym}</button>`,
            row = (s, w, color) => {
                const cap = "min" === w ? "Min" : "Max",
                    v = gameState.hrSettings.startingStatRanges[s][w];
                return `\n            <div class="comp-row" style="--c:${color}">\n              <span class="comp-lbl">${cap}</span>\n              <input type="range" id="${s}${cap}Slider" min="${"min" === w ? 0 : 10}" max="${"min" === w ? 90 : 100}" value="${v}" oninput="updateStatRange('${s}','${w}',this.value)">\n              <span class="comp-arrows">${arr(s, w, -10, "‹‹‹")}${arr(s, w, -5, "‹‹")}${arr(s, w, -1, "‹")}</span>\n              <input type="number" id="${s}${cap}Value" class="comp-num" min="0" max="100" value="${v}" onchange="updateStatRange('${s}','${w}',this.value)">\n              <span class="comp-arrows">${arr(s, w, 1, "›")}${arr(s, w, 5, "››")}${arr(s, w, 10, "›››")}</span>\n            </div>`;
            };
        e.innerHTML = ["productivity", "trust", "friendship", "desire", "comfort", "affection"]
            .map((s) => {
                const n = gameState.hrSettings.startingStatRanges[s];
                return `\n          <div class="stat-block">\n            <div class="row-between mb-1">\n              <span class="fw-600 text-accent fs-sm">${t[s]}</span>\n              <span id="${s}RangeDisplay" class="num pill pill--accent">${n.min}-${n.max}</span>\n            </div>${row(s, "min", "var(--accent)")}${row(s, "max", "var(--accent-gold)")}\n          </div>`;
            })
            .join("");
    }
    rt &&
        rt.addEventListener("click", async () => {
            (await showConfirm(
                "Clear all gossip from all NPCs? This will reset their knowledge of company drama.",
                "Clear Gossip",
                { type: "warning", confirmText: "Clear All" }
            )) &&
                (gameState.employees.forEach((e) => {
                    e.gossip && (e.gossip = []);
                }),
                ct(),
                showNotification("🗑️ All gossip cleared!", "info"));
        }),
        (window.removeContextItem = async function (e) {
            (await showConfirm("Remove this context item?", "Remove Item", {
                type: "warning",
                confirmText: "Remove",
            })) &&
                (gameState.companyWideContext.currentBuzz.splice(e, 1),
                lt(),
                showNotification("Context item removed", "info"));
        }),
        (window.clearEmployeeGossip = function (e) {
            const t = gameState.employees.find((t) => t.id === e);
            t &&
                t.gossip &&
                t.gossip.knownGossip &&
                ((t.gossip.knownGossip = []), ct(), showNotification(`Cleared gossip for ${t.name}`, "info"));
        }),
        atmosphereSlider &&
            atmosphereValue &&
            atmosphereSlider.addEventListener("input", (e) => {
                gameState.settings.atmosphere = parseInt(e.target.value);
                const t = parseInt(e.target.value);
                let n = "Balanced";
                t < 33 ? (n = "Professional") : t > 66 && (n = "Relaxed"), (atmosphereValue.textContent = n);
            }),
        guidelinesSlider &&
            guidelinesValue &&
            guidelinesSlider.addEventListener("input", (e) => {
                gameState.settings.guidelines = parseInt(e.target.value);
                const t = parseInt(e.target.value);
                let n = "Standard";
                t < 33 ? (n = "Reserved") : t > 66 && (n = "Outgoing"), (guidelinesValue.textContent = n);
            }),
        document.querySelectorAll(".policy-btn").forEach((e) => {
            e.addEventListener("click", () => {
                (gameState.settings.policy = e.dataset.policy),
                    document.querySelectorAll(".policy-btn").forEach((e) => e.classList.remove("active")),
                    e.classList.add("active");
                const t = document.getElementById("policyValue");
                if (t) {
                    const n = { professional: "Professional", casual: "Casual", open: "Enthusiastic" };
                    t.textContent = n[e.dataset.policy] || "Professional";
                }
            });
        }),
        (window.updateStatRange = function (e, t, n) {
            if (((n = parseInt(n)), isNaN(n))) return;
            const a = gameState.hrSettings.startingStatRanges[e],
                cap = "min" === t ? "Min" : "Max";
            "min" === t
                ? ((n = Math.max(0, Math.min(n, a.max - 10))), (a.min = n))
                : ((n = Math.min(100, Math.max(n, a.min + 10))), (a.max = n));
            // Keep slider thumb, number box, and range pill all in sync with the clamped value.
            const sl = document.getElementById(`${e}${cap}Slider`);
            sl && (sl.value = "min" === t ? a.min : a.max);
            const nv = document.getElementById(`${e}${cap}Value`);
            nv && (nv.value = "min" === t ? a.min : a.max);
            const disp = document.getElementById(`${e}RangeDisplay`);
            disp && (disp.textContent = `${a.min}-${a.max}`);
        }),
        (window.hrStatNudge = function (e, t, n) {
            const a = gameState.hrSettings.startingStatRanges[e];
            window.updateStatRange(e, t, ("min" === t ? a.min : a.max) + n);
        }),
        (window.applyStatPreset = function (e) {
            const t = {
                challenging: { min: 20, max: 50 },
                balanced: { min: 30, max: 60 },
                welcoming: { min: 50, max: 75 },
            }[e];
            if (!t) return;
            ["productivity", "trust", "friendship", "desire", "comfort", "affection"].forEach((e) => {
                (gameState.hrSettings.startingStatRanges[e].min = t.min),
                    (gameState.hrSettings.startingStatRanges[e].max = t.max);
            }),
                pt(),
                showNotification(`Applied ${e} preset: ${t.min}-${t.max} for all stats`);
        });
    const mt = document.querySelector('[data-tab="hr"]');
    mt &&
        mt.addEventListener("click", () => {
            setTimeout(pt, 100);
        });
    const ut = $("openSaveManagerBtn");
    ut &&
        (ut.addEventListener("click", () => {
            getSaveManager().show();
        }),
        ut.addEventListener("mouseenter", function () {
            (this.style.transform = "translateY(-2px)"), (this.style.boxShadow = "0 6px 20px rgba(0,212,255,0.5)");
        }),
        ut.addEventListener("mouseleave", function () {
            (this.style.transform = "translateY(0)"), (this.style.boxShadow = "0 4px 15px rgba(0,212,255,0.3)");
        })),
        resetBtn && resetBtn.addEventListener("click", resetGame),
        window.__saveKeydownHandler__ && document.removeEventListener("keydown", window.__saveKeydownHandler__),
        (window.__saveKeydownHandler__ = function (e) {
            if ("F5" === e.key) {
                e.preventDefault();
                saveGameToSlot(`quick_${Date.now()}`, "quick", !0);
            }
            "F9" === e.key &&
                (e.preventDefault(),
                listAllSaves().then((e) => {
                    const t = e.filter((e) => "quick" === e.saveType);
                    0 !== t.length
                        ? loadGameFromSlot(t[0].slotName)
                        : showNotification("❌ No quick saves found!", "error");
                }));
        }),
        document.addEventListener("keydown", window.__saveKeydownHandler__);
    const gt = $("importFileInput");
    gt &&
        gt.addEventListener("change", (e) => {
            const t = e.target.files[0];
            if (!t) return;
            const n = new FileReader();
            (n.onload = (e) => {
                try {
                    const t = JSON.parse(e.target.result);
                    if (!t.gameState) return void showNotification("❌ Invalid save file!", "error");
                    importSaveToSlot(t);
                } catch (e) {
                    console.error("[Import] Error:", e), showNotification("❌ Failed to import save!", "error");
                }
            }),
                n.readAsText(t),
                (e.target.value = "");
        }),
        closeChatBtn &&
            closeChatBtn.addEventListener("click", () => {
                if (chatModal) {
                    (chatModal.hidden = !0),
                        (chatModal.style.display = "none"),
                        (chatModal.style.pointerEvents = "none");
                    const e = document.getElementById("encounterRequestModal");
                    e && (e.style.display = "none");
                    const t = document.getElementById("attachmentMenu");
                    t && (t.style.display = "none"),
                        gameState.activeChat && saveGame(!1),
                        (gameState.activeChat = null);
                }
            });
    const ht = $("clearChatBtn");
    ht &&
        ht.addEventListener("click", async () => {
            const e = gameState.activeChat?.id || gameState.activeChat;
            if (!e) return void console.warn("[Clear Chat] No active chat");
            const t = gameState.employees.find((t) => t.id === e);
            if (!t) return void console.warn("[Clear Chat] Employee not found:", e);
            if (
                !(await showConfirm(
                    `Clear chat history with ${t.name}?\n\nThis will archive the conversation but remove it from view. Context will be preserved for AI.`,
                    "Clear Chat History",
                    { type: "warning", confirmText: "Clear History" }
                ))
            )
                return;
            const n = gameState.chatHistory[e] || [];
            n.length > 0
                ? (t.conversationArchive || (t.conversationArchive = []),
                  t.conversationArchive.push({
                      timestamp: gameState.time?.currentTime || Date.now(),
                      messages: [...n],
                      messageCount: n.length,
                  }),
                  t.conversationArchive.length > 5 && (t.conversationArchive = t.conversationArchive.slice(-5)),
                  (gameState.chatHistory[e] = []),
                  loadChatHistory(e),
                  console.log(`[Clear Chat] Cleared and archived chat with ${t.name}`),
                  showNotification(`Chat with ${t.name} cleared and archived.`))
                : showNotification(`No messages to clear with ${t.name}.`);
        });
    const yt = $("convertToGroupBtn");
    yt &&
        yt.addEventListener("click", () => {
            const e = gameState.activeChat?.id || gameState.activeChat;
            if (!e) return void showNotification("No active chat to convert", 2e3);
            const t = $("chatModal");
            t && (t.style.display = "none"),
                switchTab("groups"),
                setTimeout(() => {
                    openCreateGroupModal(e);
                }, 100);
        }),
        (window.refreshChatDisplay = function () {
            if (gameState.activeChat && gameState.activeChat.id) {
                const e = gameState.employees.find((e) => e.id === gameState.activeChat.id);
                e && openChat(e);
            }
        }),
        (window.showTypingIndicator = function (e) {
            const t = $("chatTypingIndicator"),
                n = $("chatTypingName");
            if (t && n) {
                (n.textContent = e.name), (t.style.display = "block");
                const a = $("chatMessages");
                a && setTimeout(() => (a.scrollTop = a.scrollHeight), 100);
            }
        }),
        (window.hideTypingIndicator = function () {
            const e = $("chatTypingIndicator");
            e && (e.style.display = "none");
        }),
        chatSendBtn && chatSendBtn.addEventListener("click", sendOrUpdateChatMessage),
        chatInput &&
            (chatInput.addEventListener("keypress", (e) => {
                "Enter" === e.key && sendOrUpdateChatMessage();
            }),
            chatInput.addEventListener("input", (e) => {
                showCommandHintPopup(chatInput, !1);
            }));
    const ft = $("chatEmojiBtn");
    console.log("Chat emoji button:", ft, "Chat input:", chatInput),
        ft &&
            chatInput &&
            ft.addEventListener("click", (e) => {
                console.log("Chat emoji button clicked!"), e.stopPropagation(), emojiPicker.show(chatInput, ft);
            });
    const bt = $("postCaptionEmojiBtn"),
        vt = $("playerPostCaption");
    bt &&
        vt &&
        bt.addEventListener("click", (e) => {
            e.stopPropagation(), emojiPicker.show(vt, bt);
        }),
        document.addEventListener("click", (e) => {
            if (e.target.classList.contains("comment-emoji-btn")) {
                e.stopPropagation();
                const t = e.target.dataset.postId,
                    n = document.querySelector(`.comment-input[data-post-id="${t}"]`);
                n && emojiPicker.show(n, e.target);
            }
        }),
        emojiPicker.init();
    const wt = $("openPlayerProfileBtn"),
        xt = $("playerProfileModal"),
        St = $("closePlayerProfileModal"),
        kt = $("cancelPlayerProfile"),
        Tt = $("savePlayerProfile");
    if (wt && xt) {
        wt.addEventListener("click", () => {
            const e = gameState.playerProfile,
                t = e.physical || {},
                n = t.hair || {},
                a = t.eyes || {},
                o = t.face || {},
                i = t.skin || {},
                s = t.body || {},
                r = (Array.isArray(t.genitals) ? t.genitals[0] : t.genitals) || {};
            ($("playerCompanyName").value = e.companyName || ""),
                ($("playerFirstName").value = e.firstName || ""),
                ($("playerLastName").value = e.lastName || ""),
                ($("playerAge").value = e.age || ""),
                ($("playerGender").value = e.gender || ""),
                ($("playerRace").value = e.race || "human"),
                ($("playerEthnicity").value = e.ethnicity || "");
            const l = $("playerEthnicityRow");
            l && (l.style.display = "human" === (e.race || "human") ? "block" : "none"),
                ($("playerHeightBuild").value = t.heightBuild || e.height || ""),
                ($("playerHairColor").value = n.color || e.hairColor || ""),
                ($("playerHairStyle").value = n.style || e.hairStyle || ""),
                ($("playerHairLength").value = n.length || ""),
                ($("playerHairTexture").value = n.texture || ""),
                ($("playerEyeColor").value = a.color || e.eyeColor || ""),
                ($("playerEyeShape").value = a.shape || ""),
                ($("playerFaceShape").value = o.shape || ""),
                ($("playerNose").value = o.nose || ""),
                ($("playerLips").value = o.lips || ""),
                ($("playerJawline").value = o.jawline || ""),
                ($("playerFacialHair").value = o.facialHair || e.facialHair || ""),
                ($("playerSkinTone").value = i.tone || e.skinTone || ""),
                ($("playerSkinTexture").value = i.texture || ""),
                ($("playerBodyShape").value = s.shape || e.bodyType || ""),
                ($("playerChestSize").value = s.chestSize || e.chestSize || ""),
                ($("playerButtSize").value = s.buttSize || ""),
                ($("playerLegs").value = s.legs || ""),
                ($("playerBuildDetails").value = e.buildDetails || ""),
                ($("playerGenitalType").value = r.type || e.genitalType || ""),
                ($("playerGenitalSize").value = r.size || e.genitalDetails || ""),
                ($("playerGenitalCharacteristics").value = r.characteristics || ""),
                ($("playerFashion").value = t.fashion || ""),
                ($("playerAccessories").value = t.accessories || ""),
                ($("playerDistinguishingFeature").value = t.distinguishingFeature || ""),
                ($("playerPersonalityTraits").value = (e.personalityTraits || []).join(", ")),
                ($("playerHobbies").value = (e.hobbies || []).join(", ")),
                ($("playerLikes").value = (e.likes || []).join(", ")),
                ($("playerDislikes").value = (e.dislikes || []).join(", ")),
                ($("playerKinks").value = (e.kinks || []).join(", ")),
                ($("playerPersonality").value = e.personality || ""),
                ($("playerAdditionalDetails").value = e.additionalDetails || ""),
                (xt.style.display = "flex"),
                upgradeCreationFormCombos("player"),
                injectStructuredSections("player", { physical: e.physical, gender: e.gender }),
                upgradeTagPicker("playerPersonalityTraits", null, TRAIT_OPTIONS),
                upgradeTagPicker("playerHobbies", null, HOBBY_OPTIONS),
                upgradeTagPicker("playerKinks", null, KINK_OPTIONS);
        });
        const qa = () => {
            xt.style.display = "none";
        };
        St && St.addEventListener("click", qa), kt && kt.addEventListener("click", qa);
        const za = (e) =>
            e
                ? e
                      .split(",")
                      .map((e) => e.trim())
                      .filter(Boolean)
                : [];
        Tt &&
            Tt.addEventListener("click", () => {
                const e = gameState.playerProfile;
                e.physical || (e.physical = {}),
                    e.physical.hair || (e.physical.hair = {}),
                    e.physical.eyes || (e.physical.eyes = {}),
                    e.physical.face || (e.physical.face = {}),
                    e.physical.skin || (e.physical.skin = {}),
                    e.physical.body || (e.physical.body = {}),
                    e.physical.genitals || (e.physical.genitals = {}),
                    (e.companyName = $("playerCompanyName").value.trim()),
                    (e.firstName = $("playerFirstName").value.trim()),
                    (e.lastName = $("playerLastName").value.trim()),
                    (e.age = parseInt($("playerAge").value) || null),
                    (e.gender = $("playerGender").value),
                    (e.race = $("playerRace").value || "human"),
                    (e.ethnicity = $("playerEthnicity").value),
                    (e.physical.heightBuild = $("playerHeightBuild").value.trim()),
                    (e.physical.hair.color = $("playerHairColor").value.trim()),
                    (e.physical.hair.style = $("playerHairStyle").value.trim()),
                    (e.physical.hair.length = $("playerHairLength").value.trim()),
                    (e.physical.hair.texture = $("playerHairTexture").value.trim()),
                    (e.hairColor = e.physical.hair.color),
                    (e.hairStyle = e.physical.hair.style),
                    (e.physical.eyes.color = $("playerEyeColor").value.trim()),
                    (e.physical.eyes.shape = $("playerEyeShape").value.trim()),
                    (e.physical.face.shape = $("playerFaceShape").value.trim()),
                    (e.physical.face.nose = $("playerNose").value.trim()),
                    (e.physical.face.lips = $("playerLips").value.trim()),
                    (e.physical.face.jawline = $("playerJawline").value.trim()),
                    (e.physical.face.facialHair = $("playerFacialHair").value.trim()),
                    (e.eyeColor = e.physical.eyes.color),
                    (e.facialHair = e.physical.face.facialHair),
                    (e.physical.skin.tone = $("playerSkinTone").value.trim()),
                    (e.physical.skin.texture = $("playerSkinTexture").value.trim()),
                    (e.skinTone = e.physical.skin.tone),
                    (e.physical.body.shape = $("playerBodyShape").value.trim()),
                    (e.physical.body.chestSize = $("playerChestSize").value.trim()),
                    (e.physical.body.buttSize = $("playerButtSize").value.trim()),
                    (e.physical.body.legs = $("playerLegs").value.trim()),
                    (e.buildDetails = $("playerBuildDetails").value.trim()),
                    (e.bodyType = e.physical.body.shape),
                    (e.chestSize = e.physical.body.chestSize),
                    (e.height = e.physical.heightBuild),
                    (e.physical.genitals = collectGenitalCards("playerGenitalCards", {
                        type: $("playerGenitalType")?.value || "",
                        size: $("playerGenitalSize")?.value?.trim() || "",
                        characteristics: $("playerGenitalCharacteristics")?.value?.trim() || "",
                    })),
                    (e.genitalType = e.physical.genitals[0]?.type || ""),
                    (e.genitalDetails = e.physical.genitals[0]?.size || ""),
                    (e.physical.fashion = $("playerFashion").value.trim()),
                    (e.physical.accessories = $("playerAccessories").value.trim()),
                    (e.physical.distinguishingFeature = $("playerDistinguishingFeature").value.trim()),
                    (e.physical.distinguishingFeatures = e.physical.distinguishingFeature
                        ? [e.physical.distinguishingFeature]
                        : []),
                    (e.physical.piercings = collectPiercings("playerPiercingCards")),
                    (e.physical.tattoos = collectTattoos("playerTattooCards")),
                    (e.personalityTraits = document.getElementById("playerPersonalityTraits_tags")
                        ? collectTags("playerPersonalityTraits_tags")
                        : za($("playerPersonalityTraits").value)),
                    (e.hobbies = document.getElementById("playerHobbies_tags")
                        ? collectTags("playerHobbies_tags")
                        : za($("playerHobbies").value)),
                    (e.likes = za($("playerLikes").value)),
                    (e.dislikes = za($("playerDislikes").value)),
                    (e.kinks = document.getElementById("playerKinks_tags")
                        ? collectTags("playerKinks_tags")
                        : za($("playerKinks").value)),
                    (e.personality = $("playerPersonality").value.trim()),
                    (e.additionalDetails = $("playerAdditionalDetails").value.trim()),
                    "function" == typeof syncPhysicalDescriptions && syncPhysicalDescriptions(e.physical, e.gender),
                    showNotification("Player profile saved!"),
                    (xt.style.display = "none"),
                    saveGame();
            });
    }
    // ===== Gender & Race distribution (compact rows, arrow nudges, reactive rebalance) =====
    const GR_KEYS = {
        gender: ["female", "male", "femaleFuta", "transMan", "transWoman"],
        race: Object.keys(RACES),
    };
    const GR_LABEL = Object.assign(
        { female:"👩 Female", male:"👨 Male", femaleFuta:"👩‍🦰 Female Futa", transMan:"⚧️ Trans Man", transWoman:"⚧️ Trans Woman" },
        Object.fromEntries(Object.values(RACES).map((r) => [r.id, `${r.emoji} ${r.displayName}`]))
    );
    const GR_COLOR = Object.assign(
        { female:"var(--l-pink)", male:"var(--accent)", femaleFuta:"var(--l-violet)", transMan:"var(--positive)", transWoman:"var(--accent-gold)" },
        Object.fromEntries(Object.values(RACES).map((r) => [r.id, r.color]))
    );
    const GR_CFG = {
        gender: { host: "genderSlidersHost", total: "genderTotalValue", warn: "genderWarning" },
        race: { host: "raceSlidersHost", total: "raceTotalValue", warn: "raceWarning" },
    };
    const GR_WORK = { gender: {}, race: {} };
    function grDefaults(group) {
        const o = {}, src = "gender" === group ? gameState.genderSettings || {} : gameState.raceSettings || {};
        GR_KEYS[group].forEach((k) => (o[k] = parseInt(src[k]) || 0));
        0 === Object.values(o).reduce((a, b) => a + b, 0) && (o["gender" === group ? "female" : "human"] = 100);
        return o;
    }
    function grRebalance(group, changed) {
        const keys = GR_KEYS[group], work = GR_WORK[group];
        let v = Math.max(0, Math.min(100, Math.round(work[changed] || 0)));
        work[changed] = v;
        const others = keys.filter((k) => k !== changed), remaining = 100 - v;
        if (remaining <= 0) return others.forEach((k) => (work[k] = 0)), void (work[changed] = 100);
        const otherSum = others.reduce((a, k) => a + (work[k] || 0), 0);
        if (0 === otherSum) {
            const base = Math.floor(remaining / others.length);
            others.forEach((k) => (work[k] = base));
            let rem = remaining - base * others.length, i = 0;
            while (rem > 0) (work[others[i % others.length]] += 1), rem--, i++;
            return;
        }
        let acc = 0;
        others.forEach((k, idx) => {
            idx === others.length - 1
                ? (work[k] = Math.max(0, remaining - acc))
                : ((work[k] = Math.round((work[k] / otherSum) * remaining)), (acc += work[k]));
        });
        const drift = 100 - keys.reduce((a, k) => a + work[k], 0);
        if (0 !== drift) {
            const k = others.reduce((m, x) => (work[x] > work[m] ? x : m), others[0]);
            work[k] = Math.max(0, work[k] + drift);
        }
    }
    function grSync(group) {
        const cfg = GR_CFG[group], keys = GR_KEYS[group], work = GR_WORK[group], host = $(cfg.host);
        host &&
            keys.forEach((k) => {
                const row = host.querySelector(`[data-key="${k}"]`);
                if (!row) return;
                const s = row.querySelector('input[type="range"]'), n = row.querySelector('input[type="number"]');
                s && (s.value = work[k]), n && document.activeElement !== n && (n.value = work[k]);
            });
        const total = keys.reduce((a, k) => a + (work[k] || 0), 0), t = $(cfg.total), w = $(cfg.warn);
        t && ((t.textContent = total), (t.style.color = 100 === total ? "var(--accent)" : "var(--danger)")),
            w && (w.style.display = 100 === total ? "none" : "block");
    }
    function grRender(group) {
        const cfg = GR_CFG[group], host = $(cfg.host), work = GR_WORK[group];
        if (!host) return;
        host.innerHTML = GR_KEYS[group]
            .map(
                (k) => `
                <div class="comp-row" data-key="${k}" style="--c:${GR_COLOR[k]}">
                  <span class="comp-lbl" title="${GR_LABEL[k]}">${GR_LABEL[k]}</span>
                  <input type="range" min="0" max="100" value="${work[k]}" oninput="grSlide('${group}','${k}',this.value)">
                  <span class="comp-arrows"><button type="button" onclick="grNudge('${group}','${k}',-10)" title="-10">‹‹‹</button><button type="button" onclick="grNudge('${group}','${k}',-5)" title="-5">‹‹</button><button type="button" onclick="grNudge('${group}','${k}',-1)" title="-1">‹</button></span>
                  <input type="number" min="0" max="100" value="${work[k]}" class="comp-num" onchange="grNum('${group}','${k}',this.value)">
                  <span class="comp-arrows"><button type="button" onclick="grNudge('${group}','${k}',1)" title="+1">›</button><button type="button" onclick="grNudge('${group}','${k}',5)" title="+5">››</button><button type="button" onclick="grNudge('${group}','${k}',10)" title="+10">›››</button></span>
                </div>`
            )
            .join("");
    }
    window.grSlide = function (group, key, val) {
        (GR_WORK[group][key] = parseInt(val) || 0), grRebalance(group, key), grSync(group);
    };
    window.grNum = function (group, key, val) {
        (GR_WORK[group][key] = Math.max(0, Math.min(100, parseInt(val) || 0))), grRebalance(group, key), grSync(group);
    };
    window.grNudge = function (group, key, delta) {
        (GR_WORK[group][key] = Math.max(0, Math.min(100, (GR_WORK[group][key] || 0) + delta))),
            grRebalance(group, key),
            grSync(group);
    };
    function grRenderDistribution() {
        const n = $("genderDistributionDisplay");
        if (!n) return;
        const g = gameState.genderSettings || {}, r = gameState.raceSettings || {},
            chip = (k, v) => `<div class="dist-chip" style="--c:${GR_COLOR[k]};"><div class="pct">${v}%</div><div class="lbl">${GR_LABEL[k]}</div></div>`;
        let html = '<div class="mb-2"><div class="text-dim fs-sm fw-600 mb-1">Gender Distribution:</div><div class="dist-grid">';
        const gp = GR_KEYS.gender.filter((k) => (g[k] || 0) > 0).map((k) => chip(k, g[k]));
        html += (gp.length ? gp.join("") : '<div class="text-center text-mute" style="grid-column:1/-1; padding:15px;">No gender settings configured</div>') + "</div></div>";
        const rp = GR_KEYS.race.filter((k) => (r[k] || 0) > 0).map((k) => chip(k, r[k]));
        rp.length && (html += '<div><div class="text-dim fs-sm fw-600 mb-1">Race Distribution:</div><div class="dist-grid">' + rp.join("") + "</div></div>");
        n.innerHTML = html;
    }
    window.renderGenderDistribution = grRenderDistribution;
    (function grInit() {
        gameState.raceSettings ||
            ((gameState.raceSettings = {}), GR_KEYS.race.forEach((k) => (gameState.raceSettings[k] = "human" === k ? 100 : 0)));
        const Ct = $("genderOptionsBtn"), Et = $("genderOptionsModal"), closeBtn = $("closeGenderOptionsModal"), cancelBtn = $("cancelGenderOptions"), saveBtn = $("saveGenderOptions");
        if (!Ct || !Et) return;
        const hide = () => (Et.style.display = "none");
        Ct.addEventListener("click", () => {
            (GR_WORK.gender = grDefaults("gender")),
                (GR_WORK.race = grDefaults("race")),
                grRender("gender"),
                grRender("race"),
                grSync("gender"),
                grSync("race"),
                (Et.style.display = "flex");
        }),
            closeBtn && closeBtn.addEventListener("click", hide),
            cancelBtn && cancelBtn.addEventListener("click", hide),
            saveBtn &&
                saveBtn.addEventListener("click", () => {
                    const gt = GR_KEYS.gender.reduce((a, k) => a + (GR_WORK.gender[k] || 0), 0),
                        rt = GR_KEYS.race.reduce((a, k) => a + (GR_WORK.race[k] || 0), 0);
                    if (100 !== gt) return void showNotification("Gender total must equal 100%!", "error");
                    if (100 !== rt) return void showNotification("Race total must equal 100%!", "error");
                    (gameState.genderSettings = gameState.genderSettings || {}),
                        GR_KEYS.gender.forEach((k) => (gameState.genderSettings[k] = GR_WORK.gender[k])),
                        (gameState.raceSettings = {}),
                        GR_KEYS.race.forEach((k) => (gameState.raceSettings[k] = GR_WORK.race[k])),
                        grRenderDistribution(),
                        hide(),
                        showNotification("⚧️ Gender & race settings saved!", "success"),
                        "function" == typeof saveGame && saveGame();
                });
        grRenderDistribution();
    })();
    const Xt = $("chatAttachBtn"),
        Zt = $("attachmentMenu");
    Xt &&
        Zt &&
        (Xt.addEventListener("click", (e) => {
            e.stopPropagation();
            const t = "block" === Zt.style.display;
            Zt.style.display = t ? "none" : "block";
        }),
        document.addEventListener("click", (e) => {
            Xt.contains(e.target) || Zt.contains(e.target) || (Zt.style.display = "none");
        }),
        document.querySelectorAll(".attach-menu-item").forEach((e) => {
            e.addEventListener("click", () => {
                const t = e.dataset.action;
                (Zt.style.display = "none"),
                    "send-money" === t
                        ? (function (e = null) {
                              !e && gameState.activeChat && (e = gameState.activeChat.id);
                              window.currentMoneyContext = { employeeId: e };
                              const t = gameState.cash || 0;
                              $("sendMoneyBalance").textContent = "$" + formatCash(t);
                              const n = Math.max(100, Math.floor(0.01 * t)),
                                  a = Math.max(1e3, Math.floor(0.05 * t)),
                                  o = Math.max(1e4, Math.floor(0.1 * t));
                              ($("moneySmall").textContent = "$" + formatCash(n)),
                                  ($("moneyMedium").textContent = "$" + formatCash(a)),
                                  ($("moneyLarge").textContent = "$" + formatCash(o)),
                                  (dn.value = ""),
                                  ($("moneyMessage").value = ""),
                                  (sn.style.display = "flex");
                          })()
                        : "give-gift" === t
                          ? "function" == typeof window.openGiftSelectionModal && window.openGiftSelectionModal()
                          : "request" === t
                            ? ($("requestImageModal").style.display = "flex")
                            : "send" === t
                              ? ($("sendImageModal").style.display = "flex")
                              : "request-post" === t
                                ? ($("requestPostModal").style.display = "flex")
                                : "visualize" === t
                                  ? visualizeCurrentScene()
                                  : "intimate-encounter" === t && showEncounterRequestModal();
            });
        }));
    const en = $("sendImageModal"),
        tn = $("closeSendImageModal"),
        nn = $("cancelSendImage"),
        an = $("confirmSendImage"),
        on = $("sendImagePrompt");
    on && setupMentionAutocomplete(on, "sendImageMentionSuggestions"),
        tn &&
            tn.addEventListener("click", () => {
                (en.style.display = "none"), (on.value = "");
            }),
        nn &&
            nn.addEventListener("click", () => {
                (en.style.display = "none"), (on.value = "");
            }),
        an &&
            an.addEventListener("click", async () => {
                const e = on.value.trim();
                e && ((en.style.display = "none"), (on.value = ""), await sendImageToNPC(e));
            });
    const sn = $("sendMoneyModal"),
        rn = $("closeSendMoneyModal"),
        ln = $("cancelSendMoney"),
        cn = $("confirmSendMoney"),
        dn = $("customMoneyAmount");
    rn &&
        rn.addEventListener("click", () => {
            (sn.style.display = "none"), (dn.value = ""), ($("moneyMessage").value = "");
        }),
        ln &&
            ln.addEventListener("click", () => {
                (sn.style.display = "none"), (dn.value = ""), ($("moneyMessage").value = "");
            }),
        document.querySelectorAll(".money-preset").forEach((e) => {
            e.addEventListener("click", () => {
                const t = e.dataset.preset,
                    n = gameState.cash || 0;
                let a = 0;
                "small" === t
                    ? (a = Math.max(100, Math.floor(0.01 * n)))
                    : "medium" === t
                      ? (a = Math.max(1e3, Math.floor(0.05 * n)))
                      : "large" === t && (a = Math.max(1e4, Math.floor(0.1 * n))),
                    dn && ((dn.value = a), dn.focus());
            }),
                e.addEventListener("mouseenter", () => {
                    (e.style.background = "var(--l-green)"), (e.style.borderColor = "var(--l-green)");
                }),
                e.addEventListener("mouseleave", () => {
                    (e.style.background = "var(--l-line)"), (e.style.borderColor = "var(--l-green)");
                });
        }),
        cn &&
            cn.addEventListener("click", async () => {
                const e = parseInt(dn.value) || 0,
                    t = gameState.cash || 0,
                    n = $("moneyMessage").value.trim();
                if (e <= 0) return void showNotification("❌ Please enter a valid amount", "error");
                if (e > t) return void showNotification("❌ Insufficient funds!", "error");
                (sn.style.display = "none"), (dn.value = ""), ($("moneyMessage").value = "");
                const a =
                    (window.currentMoneyContext || {}).employeeId ||
                    (gameState.activeChat ? gameState.activeChat.id : null);
                a
                    ? (await sendMoneyToNPC(e, n, a), (window.currentMoneyContext = null))
                    : showNotification("❌ No recipient selected", "error");
            });
    const pn = $("giftSelectionModal"),
        mn = $("closeGiftSelectionModal"),
        un = $("cancelGiftSelection"),
        gn = $("giftSelectionGrid"),
        hn = $("giftSelectionEmpty");
    let yn = null;
    window.openGiftSelectionModal = function () {
        if (!gameState.activeChat) return void console.error("[Gift Modal] No active chat");
        const e = gameState.activeChat;
        if (((yn = e.id), !pn)) return void console.error("[Gift Modal] Modal element not found");
        const t = $("giftRecipientName");
        t && (t.textContent = `Giving a gift to ${e.name}`);
        const n = e.giftPreferences || { loves: [], hates: [], learnedLoves: [], learnedHates: [] };
        n.learnedLoves || (n.learnedLoves = []), n.learnedHates || (n.learnedHates = []);
        const a =
                n.loves
                    .map((e) => {
                        if (n.learnedLoves.includes(e)) {
                            const t = GIFT_CATEGORIES[e];
                            return t ? `${t.emoji} ${t.name}` : e;
                        }
                        return "❓ ?????";
                    })
                    .join(", ") || "Unknown",
            o =
                n.hates
                    .map((e) => {
                        if (n.learnedHates.includes(e)) {
                            const t = GIFT_CATEGORIES[e];
                            return t ? `${t.emoji} ${t.name}` : e;
                        }
                        return "❓ ?????";
                    })
                    .join(", ") || "Unknown",
            i = $("giftLovesHint"),
            s = $("giftHatesHint");
        i && (i.textContent = a),
            s && (s.textContent = o),
            (function (e) {
                const t = gameState.giftInventory?.items || [];
                if (0 === t.length) return (gn.style.display = "none"), void (hn.style.display = "block");
                (gn.style.display = "grid"), (hn.style.display = "none"), (gn.innerHTML = "");
                const npc = e;
                t.forEach((e) => {
                    const t = GIFT_CATEGORIES[e.category],
                        a = t ? t.emoji : "🎁",
                        o = t ? t.name : e.category,
                        pv = giftReactionPreview(npc, e);
                    let i = "neutral",
                        s = "var(--l-ink-dim-2)",
                        r = `${pv.emoji} ${pv.label}`;
                    "love" === pv.tier || "like" === pv.tier
                        ? ((i = "loves"), (s = "var(--l-green)"))
                        : "dislike" === pv.tier && ((i = "hates"), (s = "var(--l-red)"));
                    const l = document.createElement("div");
                    (l.style.cssText = `\n          background: var(--surface-2);\n          border-radius: 10px;\n          padding: 15px;\n          cursor: pointer;\n          transition: all 0.2s;\n          border: 2px solid ${"loves" === i ? "var(--l-green)" : "hates" === i ? "var(--l-red)" : "var(--l-line)"};\n          position: relative;\n        `),
                        (l.innerHTML = `\n          <div style="font-size: 2.5rem; text-align: center; margin-bottom: 8px;">${a}</div>\n          <h4 style="margin: 0 0 5px 0; font-size: 0.95rem; color: var(--l-ink); text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${e.name}">${e.name}</h4>\n          <p style="margin: 0 0 8px 0; font-size: 0.75rem; color: var(--text-dim); text-align: center;">${o}</p>\n          <p style="margin: 0 0 8px 0; font-size: 0.9rem; color: var(--positive); text-align: center; font-weight: 600;">$${formatCash(e.price)}</p>\n          <p style="margin: 0; font-size: 0.75rem; color: ${s}; text-align: center; font-weight: 600;">${r}</p>\n        `),
                        l.addEventListener("mouseenter", () => {
                            (l.style.transform = "translateY(-5px)"),
                                (l.style.boxShadow =
                                    "0 8px 20px " +
                                    ("loves" === i
                                        ? "rgba(78,204,163,0.3)"
                                        : "hates" === i
                                          ? "rgba(233,69,96,0.3)"
                                          : "rgba(102,126,234,0.3)"));
                        }),
                        l.addEventListener("mouseleave", () => {
                            (l.style.transform = "translateY(0)"), (l.style.boxShadow = "none");
                        }),
                        l.addEventListener("click", () => {
                            gn.querySelectorAll("div").forEach((e) => {
                                (e.style.borderColor =
                                    "loves" === e.dataset.matchType
                                        ? "var(--l-green)"
                                        : "hates" === e.dataset.matchType
                                          ? "var(--l-red)"
                                          : "var(--l-line)"),
                                    (e.style.borderWidth = "2px");
                            }),
                                (l.style.borderColor = "var(--l-cyan)"),
                                (l.style.borderWidth = "3px"),
                                (window.selectedGift = e);
                            const t = $("sendGiftBtn");
                            t && ((t.disabled = !1), (t.style.opacity = "1"), (t.style.cursor = "pointer"));
                        }),
                        (l.dataset.matchType = i),
                        gn.appendChild(l);
                });
            })(e),
            console.log("[Gift Modal] Opening modal for", e.name),
            (pn.style.display = "flex");
    };
    const fn = $("sendGiftBtn");
    fn &&
        fn.addEventListener("click", async () => {
            if (!window.selectedGift || !yn) return;
            const e = window.selectedGift,
                t = yn,
                n = gameState.employees.find((e) => e.id === t);
            if (!n) return void showNotification("Employee not found!", "error");
            const a = $("giftPersonalMessage"),
                o = a ? a.value.trim() : "";
            (pn.style.display = "none"),
                (window.selectedGift = null),
                a && (a.value = ""),
                (fn.disabled = !0),
                (fn.style.opacity = "0.5");
            const i = gameState.giftInventory.items.find((t) => t.id === e.id);
            i &&
                ((i.quantity = (i.quantity || 1) - 1),
                i.quantity <= 0 &&
                    (gameState.giftInventory.items = gameState.giftInventory.items.filter((t) => t.id !== e.id)));
            const s = gameState.chatHistory[n.id] || [],
                r = GIFT_CATEGORIES[e.category];
            s.push({
                sender: "player",
                content: o || "🎁 Gave a gift",
                timestamp: gameState.time?.currentTime || Date.now(),
                isPlayer: !0,
                giftData: {
                    name: e.name,
                    price: e.price,
                    category: e.category,
                    categoryName: r?.name || e.category,
                    categoryEmoji: r?.emoji || "🎁",
                    description: e.description,
                    imageUrl: e.imageUrl,
                },
            }),
                (n.lastPlayerMessageTime = gameState.time?.currentTime || Date.now()),
                (gameState.chatHistory[n.id] = s),
                gameState.activeChat && gameState.activeChat.id === n.id && refreshChatDisplay(),
                gameState.activeChat && gameState.activeChat.id === n.id && showTypingIndicator(n);
            await giveGiftToEmployee(n.id, e, o);
            gameState.activeChat &&
                gameState.activeChat.id === n.id &&
                (hideTypingIndicator(), refreshChatDisplay()),
                updateUI();
        }),
        mn &&
            mn.addEventListener("click", () => {
                (pn.style.display = "none"), (yn = null), (window.selectedGift = null);
                const e = $("sendGiftBtn");
                e && ((e.disabled = !0), (e.style.opacity = "0.5"));
                const t = $("giftPersonalMessage");
                t && (t.value = "");
            }),
        un &&
            un.addEventListener("click", () => {
                (pn.style.display = "none"), (yn = null), (window.selectedGift = null);
                const e = $("sendGiftBtn");
                e && ((e.disabled = !0), (e.style.opacity = "0.5"));
                const t = $("giftPersonalMessage");
                t && (t.value = "");
            });
    const bn = $("giftPersonalMessage"),
        vn = $("giftMessageCharCount");
    bn &&
        vn &&
        bn.addEventListener("input", () => {
            const e = bn.value.length;
            (vn.textContent = e), (vn.style.color = e > 450 ? "var(--l-red)" : e > 400 ? "var(--l-orange-2)" : "var(--l-neutral-6)");
        });
    const wn = $("counterOfferModal"),
        xn = $("closeCounterOfferModal"),
        Sn = $("cancelCounterOffer"),
        kn = $("confirmCounterOffer"),
        Tn = $("counterAmount"),
        Cn = $("counterJustification");
    xn &&
        xn.addEventListener("click", () => {
            (wn.style.display = "none"), (Tn.value = ""), (Cn.value = "");
        }),
        Sn &&
            Sn.addEventListener("click", () => {
                (wn.style.display = "none"), (Tn.value = ""), (Cn.value = "");
            }),
        kn &&
            kn.addEventListener("click", async () => {
                await submitCounterOffer();
            });
    const En = $("requestImageModal"),
        $n = $("closeRequestImageModal"),
        In = $("requestManualBtn"),
        Mn = $("requestManualInput"),
        Pn = $("requestImageMode"),
        An = $("cancelRequestManual"),
        Nn = $("confirmRequestManual"),
        Ln = $("requestImagePrompt");
    Ln && setupMentionAutocomplete(Ln, "requestImageMentionSuggestions"),
        $n &&
            $n.addEventListener("click", () => {
                (En.style.display = "none"),
                    (Mn.style.display = "none"),
                    (Pn.querySelector("div").style.display = "grid"),
                    (In.style.display = "block"),
                    (Ln.value = "");
            }),
        document.querySelectorAll(".request-preset").forEach((e) => {
            e.addEventListener("click", async () => {
                const t = e.dataset.preset;
                (En.style.display = "none"), await requestImageFromNPC(t);
            }),
                e.addEventListener("mouseenter", () => {
                    (e.style.background = "var(--l-cyan)"), (e.style.color = "var(--l-on-accent)");
                }),
                e.addEventListener("mouseleave", () => {
                    (e.style.background = "var(--l-line)"), (e.style.color = "var(--l-ink)");
                });
        }),
        In &&
            In.addEventListener("click", () => {
                (Pn.querySelector("div").style.display = "none"),
                    (In.style.display = "none"),
                    (Mn.style.display = "block");
            }),
        An &&
            An.addEventListener("click", () => {
                (Mn.style.display = "none"),
                    (Pn.querySelector("div").style.display = "grid"),
                    (In.style.display = "block"),
                    (Ln.value = "");
            }),
        Nn &&
            Nn.addEventListener("click", async () => {
                const e = Ln.value.trim();
                e &&
                    ((En.style.display = "none"),
                    (Mn.style.display = "none"),
                    (Pn.querySelector("div").style.display = "grid"),
                    (In.style.display = "block"),
                    (Ln.value = ""),
                    await requestImageFromNPC(null, e));
            });
    const _n = $("requestPostModal"),
        Rn = $("closeRequestPostModal"),
        Dn = $("requestPostCustomBtn"),
        Fn = $("requestPostCustomInput"),
        Gn = $("requestPostMode"),
        Bn = $("cancelRequestPostCustom"),
        On = $("confirmRequestPostCustom"),
        qn = $("requestPostPrompt");
    Rn &&
        Rn.addEventListener("click", () => {
            (_n.style.display = "none"),
                (Fn.style.display = "none"),
                (Gn.querySelector("div").style.display = "grid"),
                (Dn.style.display = "block"),
                (qn.value = "");
        }),
        document.querySelectorAll(".request-post-preset").forEach((e) => {
            e.addEventListener("mouseenter", () => {
                (e.style.background = "var(--l-cyan)"), (e.style.color = "var(--l-on-accent)");
            }),
                e.addEventListener("mouseleave", () => {
                    (e.style.background = "var(--l-line)"), (e.style.color = "var(--l-ink)");
                }),
                e.addEventListener("click", async () => {
                    const t = e.dataset.preset;
                    (_n.style.display = "none"), await requestPostFromNPC(t);
                });
        }),
        Dn &&
            Dn.addEventListener("click", () => {
                (Gn.querySelector("div").style.display = "none"),
                    (Dn.style.display = "none"),
                    (Fn.style.display = "block");
            }),
        Bn &&
            Bn.addEventListener("click", () => {
                (Fn.style.display = "none"),
                    (Gn.querySelector("div").style.display = "grid"),
                    (Dn.style.display = "block"),
                    (qn.value = "");
            }),
        On &&
            On.addEventListener("click", async () => {
                const e = qn.value.trim();
                e &&
                    ((_n.style.display = "none"),
                    (Fn.style.display = "none"),
                    (Gn.querySelector("div").style.display = "grid"),
                    (Dn.style.display = "block"),
                    (qn.value = ""),
                    await requestPostFromNPC(null, e));
            });
    const zn = $("createGroupBtn");
    zn && zn.addEventListener("click", () => openCreateGroupModal());
    const jn = $("closeCreateGroupModal");
    jn &&
        jn.addEventListener("click", () => {
            const e = $("createGroupModal");
            e && (e.style.display = "none"),
                (window.selectedGroupParticipants = new Set()),
                (window.convertFromEmployeeId = null);
        });
    const Hn = $("cancelCreateGroup");
    Hn &&
        Hn.addEventListener("click", () => {
            const e = $("createGroupModal");
            e && (e.style.display = "none"),
                (window.selectedGroupParticipants = new Set()),
                (window.convertFromEmployeeId = null);
        });
    const Un = $("confirmCreateGroup");
    Un && Un.addEventListener("click", () => createGroupFromModal());
    const Yn = $("participantSearch");
    Yn && Yn.addEventListener("input", () => renderParticipantGrid());
    const Wn = $("groupSearchInput");
    Wn && Wn.addEventListener("input", () => renderGroupsList());
    const Vn = $("sendGroupMessageBtn");
    Vn && Vn.addEventListener("click", () => sendGroupMessage());
    const Kn = $("groupInput");
    Kn &&
        (Kn.addEventListener("keypress", (e) => {
            "Enter" !== e.key ||
                groupAutocompleteState?.isActive ||
                (e.preventDefault(), sendGroupMessage(), resetGroupAutocompleteState());
        }),
        Kn.addEventListener("input", (e) => {
            groupAutocompleteState?.isActive || showCommandHintPopup(Kn, !0);
        })),
        initGroupCharacterAutocomplete();
    const Qn = $("clearQueueBtn");
    Qn && Qn.addEventListener("click", () => clearSpeakerQueue());
    // Clear AI text / image request queues (these buttons were previously unwired).
    // Resolves pending jobs with a fallback so awaiting callers don't hang, empties the
    // queue + persisted pending list, and refreshes the queue UI. In-flight jobs finish.
    const _clearQueue = (q, pendingKey, label) => {
        const n = q.requestQueue.length;
        q.requestQueue.forEach((j) => {
            try {
                j.resolve(q.getFallbackResponse(j.description, new Error("Queue cleared by user")));
            } catch (e) {}
        });
        q.requestQueue = [];
        gameState.pendingAIRequests && (gameState.pendingAIRequests[pendingKey] = []);
        q.updateUI && q.updateUI();
        showNotification(`🗑️ Cleared ${n} queued ${label} request${1 === n ? "" : "s"}`);
    };
    const _clrAI = $("clearAIQueueBtn");
    _clrAI && _clrAI.addEventListener("click", () => _clearQueue(AIRequestQueue, "text", "AI text"));
    const _clrImg = $("clearImageQueueBtn");
    _clrImg && _clrImg.addEventListener("click", () => _clearQueue(ImageRequestQueue, "image", "image"));
    const Jn = $("groupSettingsBtn");
    Jn && Jn.addEventListener("click", () => openGroupSettings());
    const Xn = $("deleteGroupBtn");
    Xn &&
        Xn.addEventListener("click", () => {
            gameState.activeGroup && deleteGroup(gameState.activeGroup);
        });
    const Zn = $("closeGroupSettingsModal");
    Zn && Zn.addEventListener("click", () => closeGroupSettings());
    const ea = $("saveGroupSettings");
    ea && ea.addEventListener("click", () => saveGroupSettings());
    const ta = $("deleteGroupFromSettings");
    ta &&
        ta.addEventListener("click", () => {
            closeGroupSettings(), gameState.activeGroup && deleteGroup(gameState.activeGroup);
        });
    const na = $("addParticipantBtn");
    na && na.addEventListener("click", () => openAddParticipantSelector());
    const aa = $("autoGenerateGroupContext");
    aa && aa.addEventListener("click", () => autoGenerateGroupScenarioContext());
    const oa = $("clearGroupContext");
    oa && oa.addEventListener("click", () => clearGroupScenarioContext());
    const ia = $("autoGenerateChatContext");
    ia && ia.addEventListener("click", () => autoGenerateChatScenarioContext());
    const sa = $("clearChatContext");
    sa && sa.addEventListener("click", () => clearChatScenarioContext());
    const ra = $("chatScenarioContext");
    ra && ra.addEventListener("blur", () => saveChatScenarioContext());
    const la = $("playerPostBtn");
    la &&
        la.addEventListener("click", () => {
            openPlayerPostComposer();
        }),
        document.querySelectorAll(".algo-sort-btn").forEach((e) => {
            e.addEventListener("click", () => {
                document.querySelectorAll(".algo-sort-btn").forEach((e) => {
                    e.classList.remove("active");
                }),
                    e.classList.add("active");
                const t = e.dataset.sort;
                gameState.socialNetwork.algorithm.sort = t;
                const n = $("bestTimeFrameSelector");
                n && (n.style.display = "best" === t ? "block" : "none"), renderSocialFeed(!0);
            });
        });
    const ca = $("bestTimeFrameSelect");
    ca &&
        ca.addEventListener("change", (e) => {
            gameState.socialNetwork.algorithm.bestTimeFrame = e.target.value;
            const t = $("bestTimeFrame");
            if (t) {
                const n = {
                    hour: "Past Hour",
                    day: "Past 24h",
                    week: "Past Week",
                    month: "Past Month",
                    all: "All Time",
                };
                t.textContent = n[e.target.value] || "All Time";
            }
            renderSocialFeed(!0);
        }),
        document.querySelectorAll(".content-filter-btn").forEach((e) => {
            e.addEventListener("click", () => {
                document.querySelectorAll(".content-filter-btn").forEach((e) => {
                    e.classList.remove("active");
                }),
                    e.classList.add("active"),
                    (gameState.socialNetwork.algorithm.contentRating = e.dataset.rating),
                    renderSocialFeed(!0);
            });
        });
    const da = $("postTypeFilter");
    da &&
        (da.addEventListener("change", (e) => {
            const t = e.target.value || "all";
            console.log("[Social Filter] Post type changed to:", t),
                (gameState.socialNetwork.algorithm.postType = t),
                renderSocialFeed(!0);
        }),
        gameState.socialNetwork?.algorithm?.postType && (da.value = gameState.socialNetwork.algorithm.postType));
    const pa = $("authorFilter");
    if (pa) {
        const Ha = () => {
            const e = pa.value;
            (pa.innerHTML =
                '\n          <option value="all">Everyone</option>\n          <option value="player">My Posts</option>\n        '),
                gameState.employees
                    .filter((e) => "active" === e.employmentStatus)
                    .sort((e, t) => e.name.localeCompare(t.name))
                    .forEach((e) => {
                        const t = document.createElement("option");
                        (t.value = e.id), (t.textContent = e.name), pa.appendChild(t);
                    }),
                e && Array.from(pa.options).some((t) => t.value === e) && (pa.value = e);
        };
        Ha(),
            pa.addEventListener("change", (e) => {
                (gameState.socialNetwork.algorithm.author = e.target.value), renderSocialFeed(!0);
            }),
            window.addEventListener("employeesUpdated", Ha);
    }
    const ma = $("engagementFilter");
    ma &&
        ma.addEventListener("change", (e) => {
            (gameState.socialNetwork.algorithm.engagement = e.target.value), renderSocialFeed(!0);
        });
    const ua = $("feedSearchInput"),
        ga = $("clearSearchBtn"),
        ha = $("searchResultsCount");
    if (ua) {
        let Ua;
        ua.addEventListener("input", (e) => {
            const t = e.target.value;
            ga && (ga.style.display = t ? "block" : "none"),
                clearTimeout(Ua),
                (Ua = setTimeout(() => {
                    if (((gameState.socialNetwork.algorithm.searchQuery = t), renderSocialFeed(!0), ha && t)) {
                        const e = filterAndSortPosts();
                        (ha.style.display = "block"),
                            (ha.textContent = `Found ${e.length} post${1 !== e.length ? "s" : ""}`);
                    } else ha && (ha.style.display = "none");
                }, 300));
        });
    }
    ga &&
        ua &&
        ga.addEventListener("click", () => {
            (ua.value = ""),
                (gameState.socialNetwork.algorithm.searchQuery = ""),
                (ga.style.display = "none"),
                ha && (ha.style.display = "none"),
                renderSocialFeed(!0);
        });
    const ya = $("refreshFeedBtn");
    ya &&
        ya.addEventListener("click", () => {
            console.log("[Social] Refresh button clicked - forcing full render"),
                renderSocialFeed(!0),
                showNotification("🔄 Feed refreshed!", 1500);
        });
    const fa = $("testGeneratePostBtn");
    fa &&
        fa.addEventListener("click", () => {
            generateTestPost();
        });
    const ba = $("closePlayerPostModal");
    ba &&
        ba.addEventListener("click", () => {
            closePlayerPostModal();
        });
    const va = $("cancelPlayerPost");
    va &&
        va.addEventListener("click", () => {
            closePlayerPostModal();
        }),
        document.querySelectorAll(".post-type-btn").forEach((e) => {
            e.addEventListener("click", () => {
                document.querySelectorAll(".post-type-btn").forEach((e) => {
                    e.classList.remove("active"), (e.style.borderColor = "var(--l-line)"), (e.style.color = "var(--l-ink-dim-2)");
                }),
                    e.classList.add("active"),
                    (e.style.borderColor = "var(--l-cyan)"),
                    (e.style.color = "var(--l-ink)");
                const t = e.dataset.type,
                    n = $("playerPostImageSection"),
                    a = $("generatePlayerPostImage"),
                    o = $("playerPostImagePrompt");
                $("playerPostAltText");
                "text" === t
                    ? (n && (n.style.display = "none"), a && (a.style.display = "none"))
                    : (n && (n.style.display = "block"),
                      a && (a.style.display = "inline-block"),
                      "image" === t && o
                          ? (o.placeholder =
                                'Describe the image (e.g., "@TheBoss at a party"). Type @ to autocomplete!')
                          : "selfie" === t &&
                            o &&
                            (o.placeholder =
                                'Describe your selfie (e.g., "@player in workout clothes"). Type @ to autocomplete!'));
            });
        });
    const wa = $("playerPostImagePrompt");
    wa && setupMentionAutocomplete(wa, "postImageMentionSuggestions");
    const xa = $("generatePlayerPostImage");
    xa &&
        xa.addEventListener("click", async () => {
            await generatePlayerPostImage_handler();
        });
    const Sa = $("playerPostRegenerateImg");
    Sa &&
        Sa.addEventListener("click", async () => {
            await generatePlayerPostImage_handler();
        });
    const ka = $("submitPlayerPost");
    ka &&
        ka.addEventListener("click", () => {
            submitPlayerPostToFeed();
        });
    const Ta = $("captionCharCount");
    vt &&
        Ta &&
        vt.addEventListener("input", () => {
            const e = vt.value.length;
            (Ta.textContent = e), (Ta.style.color = e > 500 ? "var(--l-red)" : "var(--l-neutral-6)");
        }),
        document.addEventListener("click", (e) => {
            if (e.target.closest(".like-btn")) {
                handleLikePost(e.target.closest(".like-btn").dataset.postId);
            }
            if (e.target.closest(".comment-btn")) {
                openPostModal(e.target.closest(".comment-btn").dataset.postId);
            }
            if (e.target.closest(".submit-comment-btn")) {
                const t = e.target.closest(".submit-comment-btn").dataset.postId,
                    n = document.querySelector(`.comment-input[data-post-id="${t}"]`),
                    a = document.querySelector(`.reply-indicator[data-post-id="${t}"]`),
                    o = a && "none" !== a.style.display ? a.getAttribute("data-reply-to-id") : null;
                n && addCommentToPost(t, n.value, o);
            }
        }),
        document.addEventListener("keypress", (e) => {
            if ("Enter" === e.key && e.target.classList.contains("comment-input")) {
                const t = e.target.dataset.postId,
                    n = document.querySelector(`.reply-indicator[data-post-id="${t}"]`),
                    a = n && "none" !== n.style.display ? n.getAttribute("data-reply-to-id") : null;
                addCommentToPost(t, e.target.value, a);
            }
        }),
        document.addEventListener("click", (e) => {
            if (e.target.closest(".reply-to-comment-btn")) {
                const t = e.target.closest(".reply-to-comment-btn"),
                    n = t.dataset.postId,
                    a = t.dataset.commentId,
                    o = t.dataset.authorName,
                    i = t.dataset.authorId,
                    s = t.dataset.authorUsername,
                    r = document.querySelector(`.comment-input[data-post-id="${n}"]`),
                    l = document.querySelector(`.reply-indicator[data-post-id="${n}"]`);
                r &&
                    l &&
                    ((l.querySelector(".reply-text").textContent = `Replying to ${o}`),
                    (l.style.display = "block"),
                    l.setAttribute("data-reply-to-id", a),
                    "player" !== i && s && (r.value.includes(`@${s}`) || (r.value = `@${s} `)),
                    r.focus());
            }
        }),
        document.addEventListener("click", (e) => {
            if (e.target.closest(".cancel-reply-btn")) {
                const t = e.target.closest(".cancel-reply-btn").dataset.postId,
                    n = document.querySelector(`.reply-indicator[data-post-id="${t}"]`);
                n && ((n.style.display = "none"), n.removeAttribute("data-reply-to-id"));
            }
        });
    const Ca = $("buyClickPowerBtn");
    Ca && Ca.addEventListener("click", buyClickPower);
    const Ea = $("buyGoldenTouchBtn");
    Ea && Ea.addEventListener("click", buyGoldenTouch);
    const $a = $("buyTimeDilationBtn");
    $a && $a.addEventListener("click", buyTimeDilation);
    const Ia = $("buyEmpireBuilderBtn");
    Ia && Ia.addEventListener("click", buyEmpireBuilder);
    const Ma = $("prestigeBtn");
    Ma && Ma.addEventListener("click", showPrestigeModal);
    const Pa = $("closePrestigeModal");
    Pa &&
        Pa.addEventListener("click", () => {
            const e = $("prestigeModal");
            e && (e.style.display = "none");
        });
    const Aa = $("cancelPrestige");
    Aa &&
        Aa.addEventListener("click", () => {
            const e = $("prestigeModal");
            e && (e.style.display = "none");
        });
    const Na = $("confirmPrestige");
    Na && Na.addEventListener("click", executePrestige);
    const La = () => {
        gameState.lastInteractionTime = Date.now();
    };
    document.addEventListener("click", La),
        document.addEventListener("keydown", La),
        document.addEventListener("touchstart", La),
        document.addEventListener("scroll", La),
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                const e = Date.now();
                (gameState.pageHiddenTime = e),
                    (gameState.lastPlayTime = e),
                    gameState.time && (gameState.time._offlinePaused = !0),
                    saveGame(!1);
            } else {
                const awayMs = Date.now() - (gameState.pageHiddenTime || Date.now());
                checkAfkIncome(awayMs),
                    applyOfflineTimePassage(awayMs, "tab refocus"),
                    (gameState.pageHiddenTime = null),
                    (gameState.lastInteractionTime = Date.now());
            }
        }),
        window.addEventListener("beforeunload", () => {
            // If the tab was already hidden, the player left then (the hide handler stamped it).
            document.hidden || markPlayerPresent();
            try {
                "function" == typeof saveGame && saveGame(!1);
            } catch (e) {}
        });
}
function switchTab(e) {
    "invest" === e && ((e = "upgrades"), (capitalPane = "invest")),
        (gameState.activeTab = e),
        document.querySelectorAll(".tab-btn").forEach((t) => {
            t.dataset.tab === e
                ? (t.classList.add("active"), (t.style.color = "var(--l-red)"))
                : (t.classList.remove("active"), (t.style.color = "var(--l-ink)"));
        }),
        document.querySelectorAll(".tab-content").forEach((e) => {
            e.hidden = !0;
        });
    const t = $(`${e}Tab`);
    t && ((t.hidden = !1), updateTabContent(e));
}
