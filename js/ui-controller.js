/**
 * BEYOND THE ORBIT — MASTER UI & GAME CONTROLLER
 * ==============================================
 * Team Orbitera | NASA Space Apps Challenge 2026
 * 
 * Orchestrates the complete 5-screen game flow:
 * 1. Cinematic Opening Prologue (Massive planet, spacecraft, glowing orbital logo)
 * 2. Planetary Reconnaissance & Target Selection (Moon, Mars, Europa cards)
 * 3. CAD Cleanroom Spacecraft Engineering Hangar (3-column layout, turntable craft)
 * 4. Active Flight Operations Gameplay Deck (orbital trajectory, viewfinder, actions)
 * 5. Aerospace Systems Evaluation & Flight Debrief (laurel wreath, report, scorecard)
 */

class UIController {
    constructor() {
        this.currentScreen = "landing";
        this.selectedMissionId = "lunar_explorer";
        this.activeSubsystem = "power";

        this.config = {
            launchVehicle: "lv_medium",
            architecture: "polar_low_orbit",
            structure: "struct_aluminum",
            powerGen: "pwr_silicon",
            battery: "bat_li_ion",
            comms: "comm_x_band",
            avionics: "av_rad750",
            propulsion: "prop_monoprop",
            thermal: "thm_active",
            instruments: ["camera", "spectrometer"],
            groundSegment: "ground_nsn",
            userSegment: "user_multicenter"
        };

        this.simState = {
            healthPct: 100.0,
            powerPct: 100.0,
            dataCollectedMb: 0.0,
            dataTransmittedMb: 0.0,
            sciencePoints: 0.0,
            log: []
        };

        this.hangar = new HangarBuilder();
        this.flightSim = new FlightSimulator(this);
        window.flightSimulator = this.flightSim;

        this.landingAnimFrame = null;
        this.missionTimer = null;
        this.missionSecondsElapsed = 0;

        this.init();
    }

    init() {
        this.bindEvents();
        this.setMission("lunar_explorer", false);
        this.showScreen("landing");
    }

    bindEvents() {
        // Navigation buttons
        document.querySelectorAll("[data-nav-target]").forEach(btn => {
            btn.addEventListener("click", () => {
                const target = btn.getAttribute("data-nav-target");
                if (window.AudioFX) window.AudioFX.playClick();
                this.showScreen(target);
            });
        });

        // Audio toggle button
        const audioBtn = document.getElementById("audio-toggle-btn");
        if (audioBtn) {
            audioBtn.addEventListener("click", () => {
                const muted = window.AudioFX.toggleMute();
                audioBtn.innerHTML = muted ? "🔇 AUDIO: MUTED" : "🔊 AUDIO: ACTIVE";
            });
        }

        // Audio volume slider
        const volSlider = document.getElementById("audio-volume-slider");
        if (volSlider) {
            volSlider.addEventListener("input", (e) => {
                if (window.AudioFX) window.AudioFX.setVolume(e.target.value);
            });
        }

        // Start mission button from landing page (activates ambience & systems chime)
        const startHeroBtn = document.querySelector("#screen-landing [data-nav-target='selection']");
        if (startHeroBtn) {
            startHeroBtn.addEventListener("click", () => {
                if (window.AudioFX) {
                    window.AudioFX.playStartup();
                    window.AudioFX.startAmbience();
                }
            });
        }

        // Reset button
        const resetBtn = document.getElementById("reset-btn");
        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                if (window.AudioFX) window.AudioFX.playClick();
                this.flightSim.stop();
                if (this.missionTimer) clearInterval(this.missionTimer);
                this.showScreen("landing");
            });
        }

        // Crumb launch link
        const crumbLaunch = document.getElementById("crumb-launch-link");
        if (crumbLaunch) {
            crumbLaunch.addEventListener("click", () => this.launchMission());
        }

        // Subsystem Category Nav in Hangar (Left Column)
        document.querySelectorAll(".comp-nav-item").forEach(item => {
            item.addEventListener("click", () => {
                if (window.AudioFX) window.AudioFX.playClick();
                document.querySelectorAll(".comp-nav-item").forEach(b => b.classList.remove("active"));
                item.classList.add("active");
                this.activeSubsystem = item.getAttribute("data-subsystem");
                this.renderSubsystemOptions();
            });
        });

        // Launch Action Button
        const launchBtn = document.getElementById("launch-action-btn");
        if (launchBtn) {
            launchBtn.addEventListener("click", () => this.launchMission());
        }

        // Flight Deck Time Warp Buttons
        document.querySelectorAll(".warp-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".warp-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                const speed = parseFloat(btn.getAttribute("data-warp-speed"));
                this.flightSim.setTimeWarp(speed);
            });
        });

        // Flight Action Deck Buttons
        const scanBtn = document.getElementById("action-scan-btn");
        if (scanBtn) scanBtn.addEventListener("click", () => this.flightSim.executeScan());

        const downBtn = document.getElementById("action-downlink-btn");
        if (downBtn) downBtn.addEventListener("click", () => this.flightSim.executeDownlink());

        const burnBtn = document.getElementById("action-burn-btn");
        if (burnBtn) burnBtn.addEventListener("click", () => this.flightSim.executeBurn());

        const powerToggleBtn = document.getElementById("action-power-btn");
        if (powerToggleBtn) {
            powerToggleBtn.addEventListener("click", () => {
                const nextMode = this.flightSim.powerMode === "cruise" ? "science" : (this.flightSim.powerMode === "science" ? "safe" : "cruise");
                this.flightSim.setPowerMode(nextMode);
                const modeLabel = document.getElementById("power-mode-label");
                if (modeLabel) modeLabel.textContent = `POWER: ${nextMode.toUpperCase()}`;
            });
        }

        const endMissionBtn = document.getElementById("action-end-mission-btn");
        if (endMissionBtn) {
            // Hide the manual finalize button — it's emergency-only, revealed after 3 mins
            endMissionBtn.style.display = "none";
            endMissionBtn.addEventListener("click", () => {
                if (window.AudioFX) window.AudioFX.playSuccess();
                this.flightSim.stop();
                if (this.missionTimer) clearInterval(this.missionTimer);
                this.showScreen("debrief");
            });
        }
    }

    showScreen(screenId) {
        // Stop landing animation if leaving landing
        if (this.currentScreen === "landing" && screenId !== "landing") {
            if (this.landingAnimFrame) {
                cancelAnimationFrame(this.landingAnimFrame);
                this.landingAnimFrame = null;
            }
            document.body.classList.remove("screen-landing");
        } else if (screenId === "landing") {
            document.body.classList.add("screen-landing");
        }

        // Clear debrief body class when leaving debrief
        if (this.currentScreen === "debrief" && screenId !== "debrief") {
            document.body.classList.remove("debrief-moon", "debrief-mars", "debrief-europa");
        }

        // Handle leaving flight simulation screen
        if (this.currentScreen === "simulation" && screenId !== "simulation") {
            this.flightSim.stop();
            if (this.missionTimer) clearInterval(this.missionTimer);
        }

        // Animated screen transition flash
        const flashEl = document.createElement("div");
        flashEl.className = "screen-flash-overlay";
        document.body.appendChild(flashEl);
        setTimeout(() => flashEl.remove(), 700);

        this.currentScreen = screenId;
        document.querySelectorAll(".game-screen").forEach(el => el.classList.remove("active-screen"));
        const targetScreen = document.getElementById(`screen-${screenId}`);
        if (targetScreen) targetScreen.classList.add("active-screen");

        // Update nav bar active state
        document.querySelectorAll(".nav-step-btn").forEach(btn => {
            if (btn.getAttribute("data-nav-target") === screenId) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        window.scrollTo({ top: 0, behavior: "smooth" });

        if (screenId === "landing") {
            this.startLandingAnimation();
        } else if (screenId === "selection") {
            this.renderMissionsScreen();
        } else if (screenId === "planning") {
            this.renderPlanningScreen();
        } else if (screenId === "simulation") {
            this.startSimulationDeck();
        } else if (screenId === "debrief") {
            this.renderDebriefScreen();
        }
    }

    setMission(missionId, transitionToPlanning = true) {
        this.selectedMissionId = missionId;
        const mission = GAME_DATA.missions[missionId];
        this.config.architecture = mission.architectures[0].id;

        // Sensible initial configuration tailored to destination
        if (missionId === "europa_frontier") {
            this.config.launchVehicle = "lv_heavy";
            this.config.structure = "struct_vault";
            this.config.powerGen = "pwr_mmrtg";
            this.config.groundSegment = "ground_dsn_34m";
            this.config.thermal = "thm_nuclear_rhu";
            this.config.instruments = ["radar", "spectrometer", "particle_detector"];
        } else if (missionId === "mars_discovery") {
            this.config.launchVehicle = "lv_medium";
            this.config.structure = "struct_aluminum";
            this.config.powerGen = "pwr_ultraflex";
            this.config.groundSegment = "ground_nsn";
            this.config.instruments = ["camera", "spectrometer", "radar"];
        } else {
            this.config.launchVehicle = "lv_medium";
            this.config.structure = "struct_aluminum";
            this.config.powerGen = "pwr_silicon";
            this.config.groundSegment = "ground_nsn";
            this.config.instruments = ["camera", "spectrometer"];
        }

        // Highlight selected card
        document.querySelectorAll(".dest-card").forEach(c => {
            if (c.getAttribute("data-mission-id") === missionId) c.classList.add("selected");
            else c.classList.remove("selected");
        });

        if (transitionToPlanning) {
            if (window.AudioFX) window.AudioFX.playClick();
            this.showScreen("planning");
        }
    }

    // =========================================================
    // SCREEN 1: CINEMATIC OPENING PROLOGUE
    // =========================================================
    startLandingAnimation() {
        if (!window.spaceRenderer) return;

        const loop = () => {
            if (this.currentScreen !== "landing") return;
            window.spaceRenderer.renderLandingPlanet("landing-planet-canvas");
            window.spaceRenderer.renderLandingCraft("landing-craft-canvas");
            this.landingAnimFrame = requestAnimationFrame(loop);
        };

        if (this.landingAnimFrame) cancelAnimationFrame(this.landingAnimFrame);
        this.landingAnimFrame = requestAnimationFrame(loop);
    }

    // =========================================================
    // SCREEN 2: DESTINATION RECONNAISSANCE
    // =========================================================
    renderMissionsScreen() {
        const container = document.getElementById("missions-card-grid");
        if (!container) return;

        const missions = Object.values(GAME_DATA.missions);

        // Map destination → photo asset
        const destPhotos = {
            "Moon":   "assets/dest_card_moon.jpg",
            "Mars":   "assets/dest_card_mars.jpg",
            "Europa": "assets/dest_card_europa.jpg"
        };
        const destGradients = {
            "Moon":   "linear-gradient(to top, rgba(5,7,11,0.95) 0%, rgba(10,15,24,0.5) 55%, rgba(5,7,11,0.1) 100%)",
            "Mars":   "linear-gradient(to top, rgba(10,4,2,0.95) 0%, rgba(20,8,4,0.5) 55%, rgba(5,7,11,0.1) 100%)",
            "Europa": "linear-gradient(to top, rgba(2,5,15,0.95) 0%, rgba(4,8,20,0.5) 55%, rgba(5,7,11,0.1) 100%)"
        };
        const destDifficulty = {
            "Moon":   { diff:"Easy",   challenge:"Craters & Dust",  focus:"Lunar Geology",    icon:"🌕" },
            "Mars":   { diff:"Medium", challenge:"Dust Storms",     focus:"Signs of Life",    icon:"🔴" },
            "Europa": { diff:"Hard",   challenge:"Extreme Cold",    focus:"Subsurface Ocean", icon:"🧊" }
        };
        const destNames = {
            "Moon":   { title:"THE MOON",  subtitle:"Study our closest neighbor" },
            "Mars":   { title:"MARS",      subtitle:"Uncover the Red Planet" },
            "Europa": { title:"EUROPA",    subtitle:"Explore the Ocean World" }
        };

        container.innerHTML = missions.map(m => {
            const isSelected = m.id === this.selectedMissionId;
            const info = destDifficulty[m.destination] || {};
            const names = destNames[m.destination] || {};
            const photo = destPhotos[m.destination] || "";
            const grad = destGradients[m.destination] || "";

            return `
                <div class="dest-card ${isSelected ? 'selected' : ''}" data-mission-id="${m.id}" onclick="window.app.setMission('${m.id}', false)">
                    <div class="dest-planet-viewport" style="background-image: url('${photo}'); background-size:cover; background-position:center;">
                        <div class="dest-planet-gradient" style="background: ${grad};"></div>
                        <div class="dest-planet-label">${info.icon || ''} ${names.title || m.destination.toUpperCase()}</div>
                    </div>

                    <div class="dest-card-body">
                        <div class="dest-card-name">${names.title || m.destination.toUpperCase()}</div>
                        <div class="dest-card-tagline">— ${names.subtitle || ''} —</div>

                        <div class="dest-info-grid">
                            <div class="dest-info-item">
                                <span class="icon">📊</span>
                                <span class="label">Difficulty:</span>
                                <span class="value">${info.diff || '—'}</span>
                            </div>
                            <div class="dest-info-item">
                                <span class="icon">💰</span>
                                <span class="label">Budget:</span>
                                <span class="value" style="color:var(--accent-amber);">$${m.budgetMillion}M</span>
                            </div>
                            <div class="dest-info-item" style="grid-column: span 2;">
                                <span class="icon">⚠️</span>
                                <span class="label">Key Challenge:</span>
                                <span class="value">${info.challenge || '—'}</span>
                            </div>
                            <div class="dest-info-item" style="grid-column: span 2;">
                                <span class="icon">🔬</span>
                                <span class="label">Focus:</span>
                                <span class="value" style="color:var(--accent-cyan);">${info.focus || '—'}</span>
                            </div>
                        </div>

                        <button class="dest-select-btn" onclick="event.stopPropagation(); window.app.setMission('${m.id}', true);">
                            ${isSelected ? '✔ CONFIGURE SPACECRAFT ›' : 'SELECT DESTINATION ›'}
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    }

    // =========================================================
    // SCREEN 3: CAD CLEANROOM SPACECRAFT LAB
    // =========================================================
    renderPlanningScreen() {
        const mission = GAME_DATA.missions[this.selectedMissionId];
        const calc = GameEngine.calculateMissionDesign(this.selectedMissionId, this.config);

        // Update Mission Stats
        const massVal = document.getElementById("tel-mass-val");
        if (massVal) {
            massVal.textContent = `${calc.totalMassKg} kg`;
            massVal.style.color = calc.totalMassKg > calc.lvMaxPayloadKg ? "#FF2A55" : "var(--accent-cyan)";
        }

        const costVal = document.getElementById("tel-cost-val");
        if (costVal) {
            costVal.textContent = `$${calc.totalCostMillion}M`;
            costVal.style.color = calc.budgetMarginMillion < 0 ? "#FF2A55" : "var(--accent-amber)";
        }

        const pwrVal = document.getElementById("tel-pwr-val");
        if (pwrVal) {
            pwrVal.textContent = `${calc.powerBalanceW >= 0 ? '+' : ''}${calc.powerBalanceW} W`;
            pwrVal.style.color = calc.powerBalanceW < -20 ? "#FF2A55" : (calc.powerBalanceW < 0 ? "#FFB800" : "var(--accent-cyan)");
        }

        const relVal = document.getElementById("tel-rel-val");
        if (relVal) {
            relVal.textContent = `${calc.compositeReliabilityPct}%`;
        }

        // Readiness Banner
        const readinessTitle = document.getElementById("readiness-title-text");
        const readinessSub = document.getElementById("readiness-sub-text");
        const readinessBox = document.getElementById("readiness-badge-box");
        const statusBadge = document.getElementById("planning-status-badge");

        if (calc.validationStatus === "READY FOR LAUNCH") {
            if (readinessTitle) readinessTitle.textContent = "READY for Launch";
            if (readinessSub) readinessSub.textContent = "All systems within NASA margins";
            if (readinessBox) readinessBox.style.borderColor = "var(--accent-green)";
            if (statusBadge) {
                statusBadge.className = "badge badge-ready";
                statusBadge.textContent = "READY for Launch";
            }
        } else if (calc.validationStatus === "NEEDS ATTENTION") {
            if (readinessTitle) readinessTitle.textContent = "ATTENTION REQUIRED";
            if (readinessSub) readinessSub.textContent = calc.warnings[0] || "Review subsystem trade-offs";
            if (readinessBox) readinessBox.style.borderColor = "var(--accent-amber)";
            if (statusBadge) {
                statusBadge.className = "badge badge-attention";
                statusBadge.textContent = "NEEDS ATTENTION";
            }
        } else {
            if (readinessTitle) readinessTitle.textContent = "LAUNCH BLOCKED";
            if (readinessSub) readinessSub.textContent = calc.blockers[0] || "Mass or budget capacity exceeded";
            if (readinessBox) readinessBox.style.borderColor = "var(--accent-red)";
            if (statusBadge) {
                statusBadge.className = "badge badge-blocked";
                statusBadge.textContent = "LAUNCH BLOCKED";
            }
        }

        // Render CAD Turntable Spacecraft Viewport
        const schemViewport = document.getElementById("schematic-viewport");
        if (schemViewport) {
            schemViewport.innerHTML = this.hangar.renderCleanroomBlueprint(calc, mission.destination);
        }

        // Render Critique
        const critiqueBox = document.getElementById("validation-critique-box");
        if (critiqueBox) {
            let critiqueHtml = "";
            calc.blockers.forEach(b => {
                critiqueHtml += `<div style="color:var(--accent-red); font-size:11px; margin-bottom:4px;">✖ <strong>BLOCKER:</strong> ${b}</div>`;
            });
            calc.warnings.forEach(w => {
                critiqueHtml += `<div style="color:var(--accent-amber); font-size:11px; margin-bottom:4px;">▲ <strong>CAUTION:</strong> ${w}</div>`;
            });
            critiqueBox.innerHTML = critiqueHtml;
        }

        // Render Subsystem Options (Left Column)
        this.renderSubsystemOptions();

        // Update Launch CTA
        const launchBtn = document.getElementById("launch-action-btn");
        if (launchBtn) {
            if (calc.validationStatus === "LAUNCH BLOCKED") {
                launchBtn.className = "btn-primary btn-disabled";
                launchBtn.innerHTML = "✖ LAUNCH BLOCKED";
                launchBtn.onclick = () => { if (window.AudioFX) window.AudioFX.playAlert(); };
            } else {
                launchBtn.className = "btn-primary";
                launchBtn.innerHTML = calc.validationStatus === "READY FOR LAUNCH" 
                    ? "CONFIRM DESIGN ›" 
                    : "ACCEPT RISKS & LAUNCH ›";
                launchBtn.onclick = () => this.launchMission();
            }
        }
    }

    renderSubsystemOptions() {
        const container = document.getElementById("subsystem-options-container");
        if (!container) return;

        const sub = this.activeSubsystem;
        const mission = GAME_DATA.missions[this.selectedMissionId];
        let items = [];
        let configKey = "";
        let isMulti = false;

        if (sub === "power") {
            items = Object.values(GAME_DATA.powerGenerations);
            configKey = "powerGen";
        } else if (sub === "propulsion") {
            items = Object.values(GAME_DATA.propulsions);
            configKey = "propulsion";
        } else if (sub === "comms") {
            items = Object.values(GAME_DATA.communications);
            configKey = "comms";
        } else if (sub === "thermal") {
            items = Object.values(GAME_DATA.structures);
            configKey = "structure";
        } else if (sub === "camera") {
            // Camera toggle
            const cam = GAME_DATA.instruments["camera"];
            items = [cam];
            isMulti = true;
        } else if (sub === "spectrometer") {
            const spec = GAME_DATA.instruments["spectrometer"];
            items = [spec];
            isMulti = true;
        }

        container.innerHTML = items.map(item => {
            const isSelected = isMulti 
                ? this.config.instruments.includes(item.id) 
                : this.config[configKey] === item.id;

            return `
                <div class="subsystem-option-card ${isSelected ? 'selected' : ''}" onclick="window.app.selectSubsystemOption('${sub}', '${item.id}')">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-family:var(--font-ui); font-size:13px; font-weight:700; color:var(--text-white);">${item.name}</span>
                        <span style="font-family:var(--font-display); font-size:11px; color:var(--accent-amber);">$${item.costMillion}M</span>
                    </div>
                    <div style="font-size:11px; color:var(--text-dim); margin-top:2px;">${item.desc || item.pros || ""}</div>
                </div>
            `;
        }).join("");

        // Update Bottom Detail Box
        this.updateHangarDetailBox(sub, items[0]);
    }

    selectSubsystemOption(sub, itemId) {
        if (window.AudioFX) window.AudioFX.playClick();

        if (sub === "power") {
            this.config.powerGen = itemId;
        } else if (sub === "propulsion") {
            this.config.propulsion = itemId;
        } else if (sub === "comms") {
            this.config.comms = itemId;
        } else if (sub === "thermal") {
            this.config.structure = itemId;
        } else if (sub === "camera" || sub === "spectrometer") {
            if (this.config.instruments.includes(itemId)) {
                this.config.instruments = this.config.instruments.filter(id => id !== itemId);
            } else {
                this.config.instruments.push(itemId);
            }
        }

        this.renderPlanningScreen();
    }

    updateHangarDetailBox(sub, item) {
        const titleEl = document.getElementById("detail-comp-title");
        const descEl = document.getElementById("detail-comp-desc");
        const statsEl = document.getElementById("detail-comp-stats");

        if (!titleEl || !item) return;

        titleEl.textContent = item.name;
        descEl.textContent = item.desc || "Optimized aerospace hardware engineered for extreme space environments.";

        const pwrVal = item.basePowerW ? `+${item.basePowerW}W Base` : (item.powerW ? `-${item.powerW}W Load` : "+20% Power");
        const massVal = item.massKg ? `+${item.massKg} kg` : "+50 kg";
        const costVal = item.costMillion ? `$${item.costMillion}M` : "$1.2M";

        statsEl.innerHTML = `
            <span class="tag tag-pwr">${pwrVal}</span>
            <span class="tag tag-mass">${massVal}</span>
            <span class="tag tag-cost">${costVal}</span>
        `;
    }

    launchMission() {
        const calc = GameEngine.calculateMissionDesign(this.selectedMissionId, this.config);
        if (calc.validationStatus === "LAUNCH BLOCKED") {
            if (window.AudioFX) window.AudioFX.playAlert();
            return;
        }

        const mission = GAME_DATA.missions[this.selectedMissionId];
        const modal = document.getElementById("launch-modal-container");
        if (!modal) {
            if (window.AudioFX) window.AudioFX.playLaunch();
            this.showScreen("simulation");
            return;
        }

        // Setup telemetry labels
        const lvEl = document.getElementById("launch-lv-name");
        if (lvEl) lvEl.textContent = calc.selectedComponents.launchVehicle.name;

        const destEl = document.getElementById("launch-target-dest");
        if (destEl) destEl.textContent = `${mission.destination} Injection`;

        const digitsEl = document.getElementById("launch-countdown-digits");
        const statusEl = document.getElementById("launch-status-text");
        const progBar = document.getElementById("launch-progress-bar");

        modal.style.display = "flex";

        // Setup launch plume canvas animation
        const canvas = document.getElementById("launch-anim-canvas");
        let animActive = true;
        let launchParticles = [];

        if (canvas) {
            const ctx = canvas.getContext("2d");
            canvas.width = canvas.clientWidth || 680;
            canvas.height = canvas.clientHeight || 450;

            const renderPlume = () => {
                if (!animActive) return;
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Spawn flame/spark particles
                const originX = canvas.width * 0.5;
                const originY = canvas.height * 0.42;

                for (let i = 0; i < 4; i++) {
                    launchParticles.push({
                        x: originX + (Math.random() - 0.5) * 30,
                        y: originY,
                        vx: (Math.random() - 0.5) * 5,
                        vy: Math.random() * 8 + 4,
                        size: Math.random() * 12 + 6,
                        life: 1.0,
                        color: Math.random() > 0.4 ? "#FF9500" : (Math.random() > 0.5 ? "#FF3B30" : "#FFCC00")
                    });
                }

                // Update & draw particles
                for (let i = launchParticles.length - 1; i >= 0; i--) {
                    const p = launchParticles[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    p.size *= 0.96;
                    p.life -= 0.03;

                    if (p.life <= 0) {
                        launchParticles.splice(i, 1);
                        continue;
                    }

                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = p.life * 0.7;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.globalAlpha = 1.0;

                requestAnimationFrame(renderPlume);
            };
            requestAnimationFrame(renderPlume);
        }

        const skipBtn = document.getElementById("skip-launch-btn");
        const finishLaunch = () => {
            animActive = false;
            modal.style.display = "none";
            this.showScreen("simulation");
        };

        if (skipBtn) skipBtn.onclick = finishLaunch;

        // Sequence timeline
        if (digitsEl) digitsEl.textContent = "T - 00:03";
        if (statusEl) statusEl.textContent = "TERMINAL COUNTDOWN SEQUENCE INITIATED";
        if (progBar) progBar.style.width = "20%";

        setTimeout(() => {
            if (!animActive) return;
            if (digitsEl) digitsEl.textContent = "T - 00:02";
            if (statusEl) statusEl.textContent = "MAIN ENGINE VALVES OPEN · TURBOPUMPS AT 100%";
            if (progBar) progBar.style.width = "45%";
            if (window.AudioFX) window.AudioFX.playClick();
        }, 1000);

        setTimeout(() => {
            if (!animActive) return;
            if (digitsEl) digitsEl.textContent = "T - 00:01";
            if (statusEl) statusEl.textContent = "MAIN ENGINE IGNITION SEQUENCE START";
            if (progBar) progBar.style.width = "75%";
            if (window.AudioFX) window.AudioFX.playLaunch();
        }, 2000);

        setTimeout(() => {
            if (!animActive) return;
            if (digitsEl) digitsEl.textContent = "LIFTOFF!";
            if (statusEl) statusEl.textContent = "WE HAVE LIFTOFF OF BEYOND THE ORBIT!";
            if (progBar) progBar.style.width = "100%";
        }, 2800);

        setTimeout(() => {
            if (!animActive) return;
            finishLaunch();
        }, 3600);
    }

    // =========================================================
    // SCREEN 4: FLIGHT OPERATIONS DECK
    // =========================================================
    startSimulationDeck() {
        const calc = GameEngine.calculateMissionDesign(this.selectedMissionId, this.config);
        const mission = GAME_DATA.missions[this.selectedMissionId];

        // Header Title
        const phaseTitle = document.getElementById("sim-mission-phase-title");
        if (phaseTitle) phaseTitle.textContent = `Mission: ${mission.name}`;

        // Initialize Elapsed Timer
        this.missionSecondsElapsed = 0; // Start from 0:00
        const timerDigits = document.getElementById("mission-elapsed-time");
        if (this.missionTimer) clearInterval(this.missionTimer);
        this.missionTimer = setInterval(() => {
            if (this.flightSim.timeWarp > 0) {
                this.missionSecondsElapsed += Math.round(this.flightSim.timeWarp);
                const hrs = Math.floor(this.missionSecondsElapsed / 3600).toString().padStart(2, '0');
                const mins = Math.floor((this.missionSecondsElapsed % 3600) / 60).toString().padStart(2, '0');
                const secs = (this.missionSecondsElapsed % 60).toString().padStart(2, '0');
                if (timerDigits) timerDigits.textContent = `${hrs}:${mins}:${secs}`;
            }
        }, 1000);

        // Start FlightSimulator loop
        this.flightSim.start(this.selectedMissionId, calc);

        // Render Objectives Checklist on HUD
        this.renderFlightObjectivesList(mission);

        // Reveal the emergency manual debrief button after 3 minutes (safety net)
        const endMissionBtn = document.getElementById("action-end-mission-btn");
        if (endMissionBtn) {
            endMissionBtn.style.display = "none";
            clearTimeout(this._endBtnRevealTimer);
            this._endBtnRevealTimer = setTimeout(() => {
                if (endMissionBtn && this.currentScreen === "simulation") {
                    endMissionBtn.style.display = "block";
                    endMissionBtn.textContent = "⏹ END MISSION EARLY";
                    endMissionBtn.title = "Emergency: Manually end the mission and go to debrief";
                }
            }, 180000); // 3 minutes
        }
    }

    renderFlightObjectivesList(mission) {
        const objList = document.getElementById("sim-objectives-checklist");
        if (!objList) return;

        objList.innerHTML = `
            <div class="objective-check-item done">✔ Reach ${mission.destination}</div>
            <div class="objective-check-item done">✔ Insert Orbit</div>
            ${mission.scientificObjectives.map(obj => {
                const isComplete = (this.flightSim.objectiveProgress[obj.id] || 0) >= 80;
                return `
                    <div class="objective-check-item ${isComplete ? 'done' : ''}" id="hud-obj-${obj.id}">
                        ${isComplete ? '✔' : '○'} ${obj.title.slice(0, 24)}...
                    </div>
                `;
            }).join("")}
            <div class="objective-check-item ${this.flightSim.dataDownlinkedMb > 500 ? 'done' : ''}" id="hud-obj-downlink">
                ${this.flightSim.dataDownlinkedMb > 500 ? '✔' : '○'} Transmit Telemetry
            </div>
        `;
    }

    // =========================================================
    // SCREEN 5: FLIGHT DEBRIEF & SCORING
    // =========================================================
    renderDebriefScreen() {
        const mission = GAME_DATA.missions[this.selectedMissionId];
        const calc = GameEngine.calculateMissionDesign(this.selectedMissionId, this.config);
        const debrief = GameEngine.evaluateMission(this.selectedMissionId, calc, this.simState);

        // ── Destination-specific cinematic background ──────────────────────
        document.body.classList.remove("debrief-moon", "debrief-mars", "debrief-europa");
        const dest = mission ? mission.destination : "";
        if (dest === "Moon")   document.body.classList.add("debrief-moon");
        else if (dest === "Mars")   document.body.classList.add("debrief-mars");
        else if (dest === "Europa") document.body.classList.add("debrief-europa");

        // ── Update debrief tagline with destination name ───────────────────
        const debriefTagline = document.querySelector(".debrief-tagline");
        if (debriefTagline) {
            const destEmoji = { Moon: "🌕", Mars: "🔴", Europa: "🧊" };
            debriefTagline.textContent = `Mission to ${dest} complete — a journey beyond the orbit! ${destEmoji[dest] || "🚀"}`;
        }

        // Left Summary Card
        const destVal = document.getElementById("debrief-dest-val");
        if (destVal) destVal.textContent = mission.destination;

        const objCompVal = document.getElementById("debrief-obj-completed-val");
        const completedCount = debrief.matchedObjectives.filter(o => o.status.includes("Achieved")).length;
        if (objCompVal) objCompVal.textContent = `${completedCount} / ${mission.scientificObjectives.length}`;

        const collectedVal = document.getElementById("debrief-collected-val");
        if (collectedVal) collectedVal.textContent = `${Math.round(this.simState.dataCollectedMb / 1024 * 10) / 10} GB`;

        const transVal = document.getElementById("debrief-transmitted-val");
        if (transVal) transVal.textContent = `${Math.round(this.simState.dataTransmittedMb / 1024 * 10) / 10} GB`;

        const relVal = document.getElementById("debrief-rel-val");
        if (relVal) relVal.textContent = `${calc.compositeReliabilityPct}%`;

        const scoreNum = document.getElementById("debrief-score-num");
        if (scoreNum) {
            const scaledScore = Math.round(debrief.totalScore * 98.5);
            scoreNum.textContent = `★ ${scaledScore.toLocaleString()}`;
        }

        // Right Outcome Card
        const outcomeBadge = document.getElementById("debrief-score-badge");
        const outcomeIcon = document.getElementById("outcome-circle-icon");
        const outcomeSummary = document.getElementById("debrief-summary-text");

        if (outcomeBadge) {
            outcomeBadge.textContent = debrief.outcomeBadge;
            outcomeBadge.style.color = debrief.outcomeColor;
        }
        if (outcomeIcon) {
            outcomeIcon.style.borderColor = debrief.outcomeColor;
            outcomeIcon.style.color = debrief.outcomeColor;
        }
        if (outcomeSummary) outcomeSummary.textContent = debrief.summaryText;

        // Play appropriate mission debrief resolution sound
        if (window.AudioFX) {
            if (debrief.totalScore >= 60 || (debrief.outcomeBadge && debrief.outcomeBadge.includes("SUCCESS"))) {
                window.AudioFX.playSuccess();
            } else {
                window.AudioFX.playFailure();
            }
        }

        // 100-Point Category Breakdown
        const catContainer = document.getElementById("debrief-categories-container");
        if (catContainer) {
            const cats = Object.values(debrief.categories);
            catContainer.innerHTML = cats.map(cat => `
                <div style="margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; font-family:var(--font-ui); font-size:13.5px; font-weight:700; margin-bottom:4px;">
                        <span style="color:var(--text-white);">${cat.name}</span>
                        <span style="color:var(--accent-cyan); font-family:var(--font-display);">${cat.score} / ${cat.max}</span>
                    </div>
                    <div class="score-progress-track">
                        <div class="score-progress-fill" style="width: ${cat.pct}%;"></div>
                    </div>
                </div>
            `).join("");
        }

        // Objectives List
        const objContainer = document.getElementById("debrief-objectives-list");
        if (objContainer) {
            objContainer.innerHTML = debrief.matchedObjectives.map(obj => {
                const color = obj.status === "Fully Achieved" ? "var(--accent-green)" : (obj.status === "Partially Achieved" ? "var(--accent-amber)" : "var(--accent-red)");
                return `<li style="margin-bottom:6px; color:var(--text-white);"><strong>${obj.title}</strong> — <span style="color:${color}; font-weight:bold;">${obj.status}</span></li>`;
            }).join("");
        }

        // Lessons Learned
        const lessonsContainer = document.getElementById("debrief-lessons-list");
        if (lessonsContainer) {
            lessonsContainer.innerHTML = debrief.lessonsLearned.map(l => `<li style="margin-bottom:6px; color:var(--text-light); font-size:13px;">${l}</li>`).join("");
        }

        // Suggestions
        const sugContainer = document.getElementById("debrief-suggestions-list");
        if (sugContainer) {
            sugContainer.innerHTML = debrief.suggestions.map(s => `<li style="margin-bottom:6px; color:var(--accent-cyan); font-size:13px;">💡 <strong>Recommendation:</strong> ${s}</li>`).join("");
        }
    }

    printReport() {
        if (window.AudioFX) window.AudioFX.playClick();
        window.print();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.spaceRenderer = new SpaceRenderer("space-canvas");
    window.app = new UIController();
});
