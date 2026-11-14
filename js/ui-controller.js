/**
 * BEYOND THE ORBIT — MASTER UI & GAME CONTROLLER
 * ==============================================
 * Team Orbitera | NASA Space Apps Challenge 2026
 * 
 * Orchestrates the complete 5-screen game flow:
 * 1. Cinematic Opening Prologue
 * 2. Planetary Reconnaissance Destination Selection
 * 3. CAD Cleanroom Spacecraft Engineering Lab
 * 4. Active Flight Operations Gameplay Deck
 * 5. Aerospace Systems Evaluation & Flight Debrief
 */

class UIController {
    constructor() {
        this.currentScreen = "landing";
        this.selectedMissionId = "lunar_explorer";
        this.activePlanningTab = "launch";

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

        this.init();
    }

    init() {
        this.bindEvents();
        this.setMission("lunar_explorer", false);
        this.showScreen("landing");
        this.renderAll();
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

        // Reset button
        const resetBtn = document.getElementById("reset-btn");
        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                if (window.AudioFX) window.AudioFX.playClick();
                this.flightSim.stop();
                this.showScreen("landing");
            });
        }

        // Subsystem Tab Switching in Hangar
        document.querySelectorAll(".tab-btn").forEach(tab => {
            tab.addEventListener("click", () => {
                if (window.AudioFX) window.AudioFX.playClick();
                document.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
                document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
                tab.classList.add("active");
                const targetTab = tab.getAttribute("data-tab");
                const targetContent = document.getElementById(`tab-${targetTab}`);
                if (targetContent) targetContent.classList.add("active");
            });
        });

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
                if (modeLabel) modeLabel.textContent = nextMode.toUpperCase();
            });
        }

        const endMissionBtn = document.getElementById("action-end-mission-btn");
        if (endMissionBtn) {
            endMissionBtn.addEventListener("click", () => {
                if (window.AudioFX) window.AudioFX.playSuccess();
                this.flightSim.stop();
                this.showScreen("debrief");
            });
        }
    }

    showScreen(screenId) {
        // Handle leaving simulation screen
        if (this.currentScreen === "simulation" && screenId !== "simulation") {
            this.flightSim.stop();
        }

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
            this.renderLandingScreen();
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

        // Sensible defaults tailored to destination
        if (missionId === "europa_frontier") {
            this.config.launchVehicle = "lv_heavy";
            this.config.structure = "struct_vault";
            this.config.powerGen = "pwr_mmrtg";
            this.config.groundSegment = "ground_dsn_34m";
            this.config.thermal = "thm_nuclear_rhu";
            this.config.instruments = ["radar", "spectrometer", "particle_detector"];
        } else if (missionId === "mars_discovery") {
            this.config.launchVehicle = "lv_medium";
            this.config.powerGen = "pwr_ultraflex";
            this.config.groundSegment = "ground_nsn";
            this.config.instruments = ["camera", "spectrometer", "radar"];
        } else {
            this.config.launchVehicle = "lv_medium";
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

    renderAll() {
        this.renderLandingScreen();
        this.renderMissionsScreen();
        this.renderPlanningScreen();
    }

    // =========================================================
    // SCREEN 1: CINEMATIC OPENING PROLOGUE
    // =========================================================
    renderLandingScreen() {
        const canvas = document.getElementById("hero-planet-canvas");
        if (canvas && window.spaceRenderer) {
            const ctx = canvas.getContext('2d');
            const w = canvas.width = canvas.clientWidth;
            const h = canvas.height = canvas.clientHeight;
            ctx.fillStyle = '#060B18';
            ctx.fillRect(0, 0, w, h);
            window.spaceRenderer.drawPlanetOnContext(ctx, w / 2, h / 2, Math.min(w, h) * 0.36, "Moon", 0.4);
        }
    }

    // =========================================================
    // SCREEN 2: DESTINATION RECONNAISSANCE
    // =========================================================
    renderMissionsScreen() {
        const container = document.getElementById("missions-card-grid");
        if (!container) return;

        const missions = Object.values(GAME_DATA.missions);
        container.innerHTML = missions.map(m => {
            const isSelected = m.id === this.selectedMissionId;
            const fact = NASA_DATA.planetaryFactSheets[m.destination];
            const distanceStr = m.destination === "Moon" ? "384,400 km" : (m.destination === "Mars" ? "225M km" : "628M km");

            return `
                <div class="dest-card ${isSelected ? 'selected' : ''}" data-mission-id="${m.id}" onclick="window.app.setMission('${m.id}')">
                    <div>
                        <div class="dest-badge">${m.destination.toUpperCase()} · ${m.difficultyStars}</div>
                        <div class="dest-title">${m.name}</div>
                        <div style="font-family:'Rajdhani', sans-serif; font-size:13px; color:#00F0FF; margin-bottom:10px;">${m.difficulty}</div>
                        
                        <div class="dest-planet-canvas-box">
                            <canvas id="canvas-preview-${m.id}" style="width:100%; height:100%;"></canvas>
                        </div>

                        <p style="font-size: 13px; color: #CAD5E8; line-height: 1.5; margin: 10px 0; min-height: 58px;">
                            ${m.overview.slice(0, 160)}...
                        </p>
                    </div>

                    <div>
                        <div class="dest-stat-pills">
                            <div class="dest-pill">
                                <label style="color:#9BAAC2;">Distance</label>
                                <span>${distanceStr}</span>
                            </div>
                            <div class="dest-pill">
                                <label style="color:#9BAAC2;">Budget Cap</label>
                                <span style="color:#FFB800;">$${m.budgetMillion}M</span>
                            </div>
                            <div class="dest-pill">
                                <label style="color:#9BAAC2;">Solar Flux</label>
                                <span>${fact.solar_irradiance_wm2} W/m²</span>
                            </div>
                            <div class="dest-pill">
                                <label style="color:#9BAAC2;">Light Delay</label>
                                <span>${fact.light_time_one_way_s >= 60 ? (fact.light_time_one_way_s/60).toFixed(1)+'m' : fact.light_time_one_way_s+'s'}</span>
                            </div>
                        </div>

                        <button class="btn-primary" style="width: 100%; margin-top:8px;">
                            CHOOSE ${m.name.toUpperCase()}
                        </button>
                    </div>
                </div>
            `;
        }).join("");

        // Render mini planet previews onto canvas cards
        setTimeout(() => {
            missions.forEach(m => {
                const c = document.getElementById(`canvas-preview-${m.id}`);
                if (c && window.spaceRenderer) {
                    const ctx = c.getContext('2d');
                    const w = c.width = c.clientWidth;
                    const h = c.height = c.clientHeight;
                    ctx.fillStyle = '#060B18';
                    ctx.fillRect(0, 0, w, h);
                    window.spaceRenderer.drawPlanetOnContext(ctx, w / 2, h / 2, Math.min(w, h) * 0.35, m.destination, 0.2);
                }
            });
        }, 50);
    }

    // =========================================================
    // SCREEN 3: CAD CLEANROOM SPACECRAFT LAB
    // =========================================================
    renderPlanningScreen() {
        const mission = GAME_DATA.missions[this.selectedMissionId];
        const calc = GameEngine.calculateMissionDesign(this.selectedMissionId, this.config);

        // Header Title
        const planHeader = document.getElementById("planning-mission-title");
        if (planHeader) planHeader.textContent = `${mission.name.toUpperCase()} — CLEANROOM INTEGRATION`;

        // Telemetry Row
        const massVal = document.getElementById("tel-mass-val");
        const massSub = document.getElementById("tel-mass-sub");
        if (massVal) {
            massVal.textContent = `${calc.totalMassKg} kg`;
            massVal.style.color = calc.totalMassKg > calc.lvMaxPayloadKg ? "#FF2A55" : "#00F0FF";
            massSub.textContent = `Limit: ${calc.lvMaxPayloadKg} kg (${calc.massMarginPct}% margin)`;
        }

        const costVal = document.getElementById("tel-cost-val");
        const costSub = document.getElementById("tel-cost-sub");
        if (costVal) {
            costVal.textContent = `$${calc.totalCostMillion}M`;
            costVal.style.color = calc.budgetMarginMillion < 0 ? "#FF2A55" : "#FFB800";
            costSub.textContent = `Cap: $${calc.budgetMillion}M (Reserve: $${calc.budgetMarginMillion}M)`;
        }

        const pwrVal = document.getElementById("tel-pwr-val");
        const pwrSub = document.getElementById("tel-pwr-sub");
        if (pwrVal) {
            pwrVal.textContent = `${calc.powerBalanceW >= 0 ? '+' : ''}${calc.powerBalanceW} W`;
            pwrVal.style.color = calc.powerBalanceW < -20 ? "#FF2A55" : (calc.powerBalanceW < 0 ? "#FFB800" : "#00F0FF");
            pwrSub.textContent = `Gen: ${calc.powerGenerationW}W | Load: ${calc.powerConsumptionW}W`;
        }

        const dataVal = document.getElementById("tel-data-val");
        const dataSub = document.getElementById("tel-data-sub");
        if (dataVal) {
            dataVal.textContent = `${calc.dailyDownlinkCapacityMb} MB/d`;
            dataVal.style.color = calc.dataBalanceMb < 0 ? "#FFB800" : "#00F0FF";
            dataSub.textContent = `Payload Gen: ${calc.dailyDataGeneratedMb} MB/d`;
        }

        const relVal = document.getElementById("tel-rel-val");
        const relSub = document.getElementById("tel-rel-sub");
        if (relVal) {
            relVal.textContent = `${calc.compositeReliabilityPct}%`;
            relVal.style.color = calc.compositeReliabilityPct >= 80 ? "#00F0FF" : "#FFB800";
            relSub.textContent = `Science Yield: ${calc.projectedScienceYield} pts`;
        }

        // Status Badge
        const statusBadge = document.getElementById("planning-status-badge");
        if (statusBadge) {
            statusBadge.className = `badge ${calc.validationStatus === 'READY FOR LAUNCH' ? 'badge-ready' : (calc.validationStatus === 'NEEDS ATTENTION' ? 'badge-attention' : 'badge-blocked')}`;
            statusBadge.textContent = calc.validationStatus;
        }

        // Render CAD Blueprint Viewport
        const schemViewport = document.getElementById("schematic-viewport");
        if (schemViewport) {
            schemViewport.innerHTML = this.hangar.renderCleanroomBlueprint(calc, mission.destination);
        }

        // Critique Box
        const critiqueBox = document.getElementById("validation-critique-box");
        if (critiqueBox) {
            let critiqueHtml = "";
            calc.blockers.forEach(b => {
                critiqueHtml += `<div style="color:#FF2A55; font-size:12.5px; margin-bottom:5px;">✖ <strong>BLOCKER:</strong> ${b}</div>`;
            });
            calc.warnings.forEach(w => {
                critiqueHtml += `<div style="color:#FFB800; font-size:12px; margin-bottom:4px;">▲ <strong>CAUTION:</strong> ${w}</div>`;
            });
            calc.confirmations.slice(0, 2).forEach(c => {
                critiqueHtml += `<div style="color:#00F0FF; font-size:12px; margin-bottom:3px;">✔ <strong>VERIFIED:</strong> ${c}</div>`;
            });
            critiqueBox.innerHTML = critiqueHtml;
        }

        // Render Tab Option Cards
        this.renderLaunchSegmentOptions(mission, calc);
        this.renderSpaceSegmentOptions(mission, calc);
        this.renderArchitectureOptions(mission, calc);
        this.renderGroundUserSegmentOptions(mission, calc);

        // Update Launch CTA
        const launchBtn = document.getElementById("launch-action-btn");
        if (launchBtn) {
            if (calc.validationStatus === "LAUNCH BLOCKED") {
                launchBtn.className = "btn-primary btn-disabled";
                launchBtn.innerHTML = "✖ LAUNCH BLOCKED (RESOLVE CONFLICTS)";
                launchBtn.onclick = () => { if (window.AudioFX) window.AudioFX.playAlert(); };
            } else {
                launchBtn.className = "btn-primary";
                launchBtn.innerHTML = calc.validationStatus === "READY FOR LAUNCH" 
                    ? "🚀 LAUNCH MISSION INTO FLIGHT" 
                    : "⚠ ACCEPT RISKS & LAUNCH";
                launchBtn.onclick = () => this.launchMission();
            }
        }
    }

    renderLaunchSegmentOptions(mission, calc) {
        const container = document.getElementById("tab-launch");
        if (!container) return;

        const lvs = Object.values(GAME_DATA.launchVehicles);
        container.innerHTML = `
            <div class="nasa-callout">
                <strong>[NASA SMD Launch Segment]</strong> Ensure your vehicle produces sufficient trans-planetary injection velocity (C3). Overloading fairing limits aborts launch immediately.
            </div>
            <div class="component-option-grid">
                ${lvs.map(lv => {
                    const isSelected = lv.id === this.config.launchVehicle;
                    const cap = lv.maxPayloadKg[mission.destination];
                    return `
                        <div class="comp-card ${isSelected ? 'active' : ''}" onclick="window.app.updateConfig('launchVehicle', '${lv.id}')">
                            <div>
                                <h4 style="font-family:'Rajdhani', sans-serif; font-size:15px; font-weight:700; color:#F4F7FF;">
                                    ${lv.name} <span style="font-size:12px; color:#9BAAC2;">(${lv.class})</span>
                                </h4>
                                <p style="font-size:12px; color:#9BAAC2;">${lv.pros} · Reliability: ${(lv.reliability * 100).toFixed(0)}%</p>
                            </div>
                            <div style="text-align:right;">
                                <div style="color:#FFB800; font-family:'Orbitron', sans-serif; font-weight:bold;">$${lv.costMillion}M</div>
                                <div style="color:#00F0FF; font-size:12px;">${cap} kg cap</div>
                            </div>
                        </div>
                    `;
                }).join("")}
            </div>
        `;
    }

    renderSpaceSegmentOptions(mission, calc) {
        const container = document.getElementById("tab-space");
        if (!container) return;

        const structures = Object.values(GAME_DATA.structures);
        const powers = Object.values(GAME_DATA.powerGenerations);
        const batteries = Object.values(GAME_DATA.batteries);
        const comms = Object.values(GAME_DATA.communications);
        const instruments = Object.values(GAME_DATA.instruments);

        container.innerHTML = `
            <div class="nasa-callout">
                <strong>[NASA Spacecraft Subsystems]</strong> Integrate structure, power generation, battery buffers, deep-space avionics, radio/optical comms, and scientific payloads.
            </div>

            <!-- Structure -->
            <div style="font-family:'Rajdhani', sans-serif; font-size:13px; color:#00F0FF; font-weight:bold; margin: 10px 0 6px 0;">1. STRUCTURE & RADIATION SHIELDING</div>
            <div>
                ${structures.map(s => `
                    <div class="comp-card ${s.id === this.config.structure ? 'active' : ''}" onclick="window.app.updateConfig('structure', '${s.id}')">
                        <div>
                            <h4 style="font-family:'Rajdhani', sans-serif; font-size:15px; font-weight:700; color:#F4F7FF;">${s.name}</h4>
                            <p style="font-size:12px; color:#9BAAC2;">${s.desc}</p>
                        </div>
                        <div style="text-align:right;">
                            <div style="color:#FFB800; font-family:'Orbitron', sans-serif;">$${s.costMillion}M</div>
                            <div style="color:#00F0FF; font-size:12px;">${s.massKg} kg</div>
                        </div>
                    </div>
                `).join("")}
            </div>

            <!-- Power Generation -->
            <div style="font-family:'Rajdhani', sans-serif; font-size:13px; color:#00F0FF; font-weight:bold; margin: 14px 0 6px 0;">2. ELECTRICAL POWER SUBSYSTEM (EPS)</div>
            <div>
                ${powers.map(p => `
                    <div class="comp-card ${p.id === this.config.powerGen ? 'active' : ''}" onclick="window.app.updateConfig('powerGen', '${p.id}')">
                        <div>
                            <h4 style="font-family:'Rajdhani', sans-serif; font-size:15px; font-weight:700; color:#F4F7FF;">${p.name}</h4>
                            <p style="font-size:12px; color:#9BAAC2;">${p.desc}</p>
                        </div>
                        <div style="text-align:right;">
                            <div style="color:#FFB800; font-family:'Orbitron', sans-serif;">$${p.costMillion}M</div>
                            <div style="color:#00F0FF; font-size:12px;">${p.basePowerW}W base</div>
                        </div>
                    </div>
                `).join("")}
            </div>

            <!-- Batteries -->
            <div style="font-family:'Rajdhani', sans-serif; font-size:13px; color:#00F0FF; font-weight:bold; margin: 14px 0 6px 0;">3. ENERGY STORAGE (BATTERY)</div>
            <div>
                ${batteries.map(b => `
                    <div class="comp-card ${b.id === this.config.battery ? 'active' : ''}" onclick="window.app.updateConfig('battery', '${b.id}')">
                        <div>
                            <h4 style="font-family:'Rajdhani', sans-serif; font-size:15px; font-weight:700; color:#F4F7FF;">${b.name}</h4>
                            <p style="font-size:12px; color:#9BAAC2;">${b.desc}</p>
                        </div>
                        <div style="text-align:right;">
                            <div style="color:#FFB800; font-family:'Orbitron', sans-serif;">$${b.costMillion}M</div>
                            <div style="color:#00F0FF; font-size:12px;">${b.capacityWh} Wh</div>
                        </div>
                    </div>
                `).join("")}
            </div>

            <!-- Communications -->
            <div style="font-family:'Rajdhani', sans-serif; font-size:13px; color:#00F0FF; font-weight:bold; margin: 14px 0 6px 0;">4. RADIO & OPTICAL COMMUNICATIONS</div>
            <div>
                ${comms.map(c => `
                    <div class="comp-card ${c.id === this.config.comms ? 'active' : ''}" onclick="window.app.updateConfig('comms', '${c.id}')">
                        <div>
                            <h4 style="font-family:'Rajdhani', sans-serif; font-size:15px; font-weight:700; color:#F4F7FF;">${c.name}</h4>
                            <p style="font-size:12px; color:#9BAAC2;">${c.desc}</p>
                        </div>
                        <div style="text-align:right;">
                            <div style="color:#FFB800; font-family:'Orbitron', sans-serif;">$${c.costMillion}M</div>
                            <div style="color:#00F0FF; font-size:12px;">${c.maxDataRateMbDay} MB/d</div>
                        </div>
                    </div>
                `).join("")}
            </div>

            <!-- Scientific Instruments Multi-Select -->
            <div style="font-family:'Rajdhani', sans-serif; font-size:13px; color:#00F0FF; font-weight:bold; margin: 14px 0 6px 0;">5. SCIENTIFIC PAYLOAD SENSORS (CLICK TO TOGGLE)</div>
            <div>
                ${instruments.map(inst => {
                    const isInstalled = this.config.instruments.includes(inst.id);
                    return `
                        <div class="comp-card ${isInstalled ? 'active' : ''}" onclick="window.app.toggleInstrument('${inst.id}')">
                            <div>
                                <h4 style="font-family:'Rajdhani', sans-serif; font-size:15px; font-weight:700; color:#F4F7FF;">
                                    ${inst.name} ${isInstalled ? '✔ [INSTALLED]' : '+ [ADD]'}
                                </h4>
                                <p style="font-size:12px; color:#9BAAC2;">${inst.desc} · <em>${inst.nasaAnalogue}</em></p>
                            </div>
                            <div style="text-align:right;">
                                <div style="color:#FFB800; font-family:'Orbitron', sans-serif;">+$${inst.costMillion}M</div>
                                <div style="color:#00FF88; font-size:12px;">+${inst.scienceVal} pts (${inst.massKg}kg)</div>
                            </div>
                        </div>
                    `;
                }).join("")}
            </div>
        `;
    }

    renderArchitectureOptions(mission, calc) {
        const container = document.getElementById("tab-orbit");
        if (!container) return;

        container.innerHTML = `
            <div class="nasa-callout">
                <strong>[NASA Mission Architecture]</strong> Flight trajectory balancing observation geometry, ground station communication contact windows, and station-keeping fuel.
            </div>
            <div>
                ${mission.architectures.map(arch => `
                    <div class="comp-card ${arch.id === this.config.architecture ? 'active' : ''}" onclick="window.app.updateConfig('architecture', '${arch.id}')">
                        <div>
                            <h4 style="font-family:'Rajdhani', sans-serif; font-size:15px; font-weight:700; color:#F4F7FF;">${arch.name}</h4>
                            <p style="font-size:12px; color:#9BAAC2;">${arch.description}</p>
                        </div>
                        <div style="text-align:right;">
                            <div style="color:#FFB800; font-family:'Orbitron', sans-serif;">+$${arch.complexityCost}M</div>
                            <div style="color:#00F0FF; font-size:12px;">${arch.scienceMultiplier}x Science (+${arch.complexityMass}kg)</div>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
    }

    renderGroundUserSegmentOptions(mission, calc) {
        const container = document.getElementById("tab-ground");
        if (!container) return;

        const grounds = Object.values(GAME_DATA.groundSegments);
        const users = Object.values(GAME_DATA.userSegments);

        container.innerHTML = `
            <div class="nasa-callout">
                <strong>[NASA Ground & User Segments]</strong> A mission does not end at rocket separation. Ground tracking networks receive telemetry across light-speed delays for scientific distribution.
            </div>
            <div style="font-family:'Rajdhani', sans-serif; font-size:13px; color:#00F0FF; font-weight:bold; margin: 10px 0 6px 0;">EARTH GROUND TRACKING NETWORK</div>
            <div>
                ${grounds.map(g => `
                    <div class="comp-card ${g.id === this.config.groundSegment ? 'active' : ''}" onclick="window.app.updateConfig('groundSegment', '${g.id}')">
                        <div>
                            <h4 style="font-family:'Rajdhani', sans-serif; font-size:15px; font-weight:700; color:#F4F7FF;">${g.name}</h4>
                            <p style="font-size:12px; color:#9BAAC2;">${g.desc} · Contact: ${g.contactHoursDay} hrs/day</p>
                        </div>
                        <div style="text-align:right;">
                            <div style="color:#FFB800; font-family:'Orbitron', sans-serif;">$${g.costMillion}M</div>
                            <div style="color:#00F0FF; font-size:12px;">${(g.downlinkEfficiency * 100).toFixed(0)}% Link Eff</div>
                        </div>
                    </div>
                `).join("")}
            </div>

            <div style="font-family:'Rajdhani', sans-serif; font-size:13px; color:#00F0FF; font-weight:bold; margin: 14px 0 6px 0;">SCIENCE USER PIPELINE</div>
            <div>
                ${users.map(u => `
                    <div class="comp-card ${u.id === this.config.userSegment ? 'active' : ''}" onclick="window.app.updateConfig('userSegment', '${u.id}')">
                        <div>
                            <h4 style="font-family:'Rajdhani', sans-serif; font-size:15px; font-weight:700; color:#F4F7FF;">${u.name}</h4>
                            <p style="font-size:12px; color:#9BAAC2;">${u.desc}</p>
                        </div>
                        <div style="text-align:right;">
                            <div style="color:#FFB800; font-family:'Orbitron', sans-serif;">$${u.costMillion}M</div>
                            <div style="color:#00F0FF; font-size:12px;">${u.scienceMultiplier}x Multiplier</div>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
    }

    updateConfig(key, val) {
        if (window.AudioFX) window.AudioFX.playClick();
        this.config[key] = val;
        this.renderPlanningScreen();
    }

    toggleInstrument(instId) {
        if (window.AudioFX) window.AudioFX.playClick();
        if (this.config.instruments.includes(instId)) {
            this.config.instruments = this.config.instruments.filter(i => i !== instId);
        } else {
            this.config.instruments.push(instId);
        }
        this.renderPlanningScreen();
    }

    launchMission() {
        const calc = GameEngine.calculateMissionDesign(this.selectedMissionId, this.config);
        if (calc.validationStatus === "LAUNCH BLOCKED") {
            if (window.AudioFX) window.AudioFX.playAlert();
            return;
        }

        if (window.AudioFX) window.AudioFX.playLaunch();
        if (window.spaceRenderer) {
            window.spaceRenderer.setWarp(true);
            setTimeout(() => {
                window.spaceRenderer.setWarp(false);
                this.showScreen("simulation");
            }, 1400);
        } else {
            this.showScreen("simulation");
        }
    }

    // =========================================================
    // SCREEN 4: FLIGHT OPERATIONS DECK
    // =========================================================
    startSimulationDeck() {
        const calc = GameEngine.calculateMissionDesign(this.selectedMissionId, this.config);
        const mission = GAME_DATA.missions[this.selectedMissionId];

        // Update target title
        const deckTitle = document.getElementById("sim-deck-title");
        if (deckTitle) deckTitle.textContent = `${mission.name.toUpperCase()} FLIGHT OPERATIONS`;

        // Start FlightSimulator engine loop!
        this.flightSim.start(this.selectedMissionId, calc);

        // Render scientific decadal objectives on sidebar
        const objList = document.getElementById("sim-objectives-checklist");
        if (objList) {
            objList.innerHTML = mission.scientificObjectives.map(obj => `
                <div style="background:#070E1E; border:1px solid #1E2D4A; border-radius:6px; padding:10px; margin-bottom:8px;">
                    <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:bold; color:#F4F7FF;">
                        <span>${obj.title}</span>
                        <span id="obj-pct-${obj.id}" style="color:#00F0FF;">0%</span>
                    </div>
                    <div style="background:#0D192E; height:5px; border-radius:3px; margin-top:5px; overflow:hidden;">
                        <div id="obj-bar-${obj.id}" style="background:#00F0FF; width:0%; height:100%;"></div>
                    </div>
                </div>
            `).join("");
        }
    }

    // =========================================================
    // SCREEN 5: FLIGHT DEBRIEF & SCORING
    // =========================================================
    renderDebriefScreen() {
        const mission = GAME_DATA.missions[this.selectedMissionId];
        const calc = GameEngine.calculateMissionDesign(this.selectedMissionId, this.config);
        const debrief = GameEngine.evaluateMission(this.selectedMissionId, calc, this.simState);

        const scoreNum = document.getElementById("debrief-score-num");
        const scoreBadge = document.getElementById("debrief-score-badge");
        const scoreSummary = document.getElementById("debrief-summary-text");

        if (scoreNum) {
            scoreNum.textContent = `${debrief.totalScore} / 100`;
            scoreNum.style.color = debrief.outcomeColor;
        }
        if (scoreBadge) {
            scoreBadge.textContent = debrief.outcomeBadge;
            scoreBadge.style.color = debrief.outcomeColor;
        }
        if (scoreSummary) scoreSummary.textContent = debrief.summaryText;

        const catContainer = document.getElementById("debrief-categories-container");
        if (catContainer) {
            const cats = Object.values(debrief.categories);
            catContainer.innerHTML = cats.map(cat => `
                <div style="margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; font-family:'Rajdhani', sans-serif; font-size:13.5px; font-weight:700; margin-bottom:4px;">
                        <span style="color:#F4F7FF;">${cat.name}</span>
                        <span style="color:#00F0FF; font-family:'Orbitron', sans-serif;">${cat.score} / ${cat.max}</span>
                    </div>
                    <div class="score-progress-track">
                        <div class="score-progress-fill" style="width: ${cat.pct}%;"></div>
                    </div>
                </div>
            `).join("");
        }

        const objContainer = document.getElementById("debrief-objectives-list");
        if (objContainer) {
            objContainer.innerHTML = debrief.matchedObjectives.map(obj => {
                const color = obj.status === "Fully Achieved" ? "#00FF88" : (obj.status === "Partially Achieved" ? "#FFB800" : "#FF2A55");
                return `<li style="margin-bottom:6px; color:#E0E8F5;"><strong>${obj.title}</strong> — <span style="color:${color}; font-weight:bold;">${obj.status}</span></li>`;
            }).join("");
        }

        const lessonsContainer = document.getElementById("debrief-lessons-list");
        if (lessonsContainer) {
            lessonsContainer.innerHTML = debrief.lessonsLearned.map(l => `<li style="margin-bottom:6px; color:#CAD5E8;">${l}</li>`).join("");
        }

        const sugContainer = document.getElementById("debrief-suggestions-list");
        if (sugContainer) {
            sugContainer.innerHTML = debrief.suggestions.map(s => `<li style="margin-bottom:6px; color:#00F0FF;">💡 <strong>Recommendation:</strong> ${s}</li>`).join("");
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
