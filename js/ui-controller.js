/**
 * UI CONTROLLER & SCREEN STATE MACHINE
 * =====================================
 * BEYOND THE ORBIT - Space Mission Design Game
 * Team Orbitera | NASA Space Apps Challenge 2026
 * 
 * Manages screen routing, live calculations, spacecraft SVG rendering,
 * simulation progression, and report generation.
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
            eventIdx: 0,
            healthPct: 100.0,
            powerPct: 100.0,
            dataCollectedMb: 0.0,
            dataTransmittedMb: 0.0,
            sciencePoints: 0.0,
            log: [],
            completed: false
        };

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
            btn.addEventListener("click", (e) => {
                const target = btn.getAttribute("data-nav-target");
                window.AudioFX.playClick();
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
                window.AudioFX.playClick();
                this.resetSimulation();
                this.showScreen("landing");
            });
        }

        // Subsystem Tab Switching
        document.querySelectorAll(".tab-btn").forEach(tab => {
            tab.addEventListener("click", () => {
                window.AudioFX.playClick();
                document.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
                document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
                tab.classList.add("active");
                const targetTab = tab.getAttribute("data-tab");
                const targetContent = document.getElementById(`tab-${targetTab}`);
                if (targetContent) targetContent.classList.add("active");
            });
        });
    }

    showScreen(screenId) {
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

        if (screenId === "planning") {
            this.renderPlanningScreen();
        } else if (screenId === "simulation") {
            this.renderSimulationScreen();
        } else if (screenId === "debrief") {
            this.renderDebriefScreen();
        }
    }

    setMission(missionId, transitionToPlanning = true) {
        this.selectedMissionId = missionId;
        const mission = GAME_DATA.missions[missionId];
        this.config.architecture = mission.architectures[0].id;

        // Sensible defaults
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

        this.resetSimulation();

        // Update UI highlights on mission cards
        document.querySelectorAll(".mission-card").forEach(c => {
            if (c.getAttribute("data-mission-id") === missionId) {
                c.classList.add("selected");
            } else {
                c.classList.remove("selected");
            }
        });

        if (transitionToPlanning) {
            window.AudioFX.playClick();
            this.showScreen("planning");
        }
    }

    resetSimulation() {
        this.simState = {
            eventIdx: 0,
            healthPct: 100.0,
            powerPct: 100.0,
            dataCollectedMb: 0.0,
            dataTransmittedMb: 0.0,
            sciencePoints: 0.0,
            log: [],
            completed: false
        };
    }

    renderAll() {
        this.renderMissionsScreen();
        this.renderPlanningScreen();
    }

    // =========================================================
    // SCREEN 2: MISSIONS SELECTION
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
                <div class="mission-card ${isSelected ? 'selected' : ''}" data-mission-id="${m.id}">
                    <div>
                        <div class="mission-dest-badge">${m.destination} · ${m.difficultyStars}</div>
                        <div class="mission-card-title">${m.name}</div>
                        <div class="mission-card-diff">${m.difficulty}</div>
                        <div class="mission-planet-preview">
                            ${this.getPlanetSvg(m.destination)}
                        </div>
                        <p style="font-size: 13px; color: #CAD5E8; line-height: 1.5; margin: 10px 0;">
                            ${m.overview.slice(0, 160)}...
                        </p>
                    </div>
                    <div>
                        <div class="mission-stat-pill-row">
                            <div class="mission-stat-pill">
                                <label style="color:#9BAAC2;">Distance</label>
                                <span>${distanceStr}</span>
                            </div>
                            <div class="mission-stat-pill">
                                <label style="color:#9BAAC2;">Budget</label>
                                <span style="color:#FFB547;">$${m.budgetMillion}M</span>
                            </div>
                            <div class="mission-stat-pill">
                                <label style="color:#9BAAC2;">Solar Flux</label>
                                <span>${fact.solar_irradiance_wm2} W/m²</span>
                            </div>
                            <div class="mission-stat-pill">
                                <label style="color:#9BAAC2;">Light Delay</label>
                                <span>${fact.light_time_one_way_s >= 60 ? (fact.light_time_one_way_s/60).toFixed(1)+'m' : fact.light_time_one_way_s+'s'}</span>
                            </div>
                        </div>
                        <button class="btn-primary" style="width: 100%;" onclick="window.app.setMission('${m.id}')">
                            SELECT ${m.name.toUpperCase()}
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    }

    // =========================================================
    // SCREEN 3: SPACECRAFT ENGINEERING LAB
    // =========================================================
    renderPlanningScreen() {
        const mission = GAME_DATA.missions[this.selectedMissionId];
        const calc = GameEngine.calculateMissionDesign(this.selectedMissionId, this.config);

        // Update header & mission title
        const planHeader = document.getElementById("planning-mission-title");
        if (planHeader) planHeader.textContent = `${mission.name.toUpperCase()} — FLIGHT INTEGRATION`;

        // Update live telemetry row
        const massVal = document.getElementById("tel-mass-val");
        const massSub = document.getElementById("tel-mass-sub");
        if (massVal) {
            massVal.textContent = `${calc.totalMassKg} kg`;
            massVal.style.color = calc.totalMassKg > calc.lvMaxPayloadKg ? "#FF5263" : "#43D9FF";
            massSub.textContent = `Cap: ${calc.lvMaxPayloadKg} kg (${calc.massMarginPct}% margin)`;
        }

        const costVal = document.getElementById("tel-cost-val");
        const costSub = document.getElementById("tel-cost-sub");
        if (costVal) {
            costVal.textContent = `$${calc.totalCostMillion}M`;
            costVal.style.color = calc.budgetMarginMillion < 0 ? "#FF5263" : "#FFB547";
            costSub.textContent = `Budget: $${calc.budgetMillion}M (Res: $${calc.budgetMarginMillion}M)`;
        }

        const pwrVal = document.getElementById("tel-pwr-val");
        const pwrSub = document.getElementById("tel-pwr-sub");
        if (pwrVal) {
            pwrVal.textContent = `${calc.powerBalanceW >= 0 ? '+' : ''}${calc.powerBalanceW} W`;
            pwrVal.style.color = calc.powerBalanceW < -20 ? "#FF5263" : (calc.powerBalanceW < 0 ? "#FFB547" : "#43D9FF");
            pwrSub.textContent = `Gen: ${calc.powerGenerationW}W | Load: ${calc.powerConsumptionW}W`;
        }

        const dataVal = document.getElementById("tel-data-val");
        const dataSub = document.getElementById("tel-data-sub");
        if (dataVal) {
            dataVal.textContent = `${calc.dailyDownlinkCapacityMb} MB/d`;
            dataVal.style.color = calc.dataBalanceMb < 0 ? "#FFB547" : "#43D9FF";
            dataSub.textContent = `Payload Gen: ${calc.dailyDataGeneratedMb} MB/d`;
        }

        const relVal = document.getElementById("tel-rel-val");
        const relSub = document.getElementById("tel-rel-sub");
        if (relVal) {
            relVal.textContent = `${calc.compositeReliabilityPct}%`;
            relVal.style.color = calc.compositeReliabilityPct >= 80 ? "#43D9FF" : "#FFB547";
            relSub.textContent = `Science Yield: ${calc.projectedScienceYield} pts`;
        }

        // Render Validation Critique Box
        const critiqueBox = document.getElementById("validation-critique-box");
        if (critiqueBox) {
            let critiqueHtml = "";
            calc.blockers.forEach(b => {
                critiqueHtml += `<div style="color:#FF5263; font-size:12.5px; margin-bottom:6px;">✖ <strong>BLOCKER:</strong> ${b}</div>`;
            });
            calc.warnings.forEach(w => {
                critiqueHtml += `<div style="color:#FFB547; font-size:12px; margin-bottom:5px;">▲ <strong>CAUTION:</strong> ${w}</div>`;
            });
            calc.confirmations.slice(0, 2).forEach(c => {
                critiqueHtml += `<div style="color:#43D9FF; font-size:12px; margin-bottom:4px;">✔ <strong>VERIFIED:</strong> ${c}</div>`;
            });
            critiqueBox.innerHTML = critiqueHtml;
        }

        // Update Status Badge
        const statusBadge = document.getElementById("planning-status-badge");
        if (statusBadge) {
            statusBadge.className = `badge ${calc.validationStatus === 'READY FOR LAUNCH' ? 'badge-ready' : (calc.validationStatus === 'NEEDS ATTENTION' ? 'badge-attention' : 'badge-blocked')}`;
            statusBadge.textContent = calc.validationStatus;
        }

        // Render Schematic Viewport
        const schemViewport = document.getElementById("schematic-viewport");
        if (schemViewport) {
            schemViewport.innerHTML = this.renderSpacecraftSvg(calc);
        }

        // Render Tab Option Cards
        this.renderLaunchSegmentOptions(mission, calc);
        this.renderSpaceSegmentOptions(mission, calc);
        this.renderArchitectureOptions(mission, calc);
        this.renderGroundUserSegmentOptions(mission, calc);

        // Update Launch Button
        const launchBtn = document.getElementById("launch-action-btn");
        if (launchBtn) {
            if (calc.validationStatus === "LAUNCH BLOCKED") {
                launchBtn.className = "btn-primary btn-disabled";
                launchBtn.innerHTML = "✖ LAUNCH BLOCKED (RESOLVE CONFLICTS)";
                launchBtn.onclick = () => window.AudioFX.playAlert();
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
                <strong>[NASA SMD Launch Segment]</strong> The launch vehicle provides translunar or interplanetary injection energy (C3). Overloading vehicle capacity triggers an immediate launch abort.
            </div>
            <div class="component-option-grid">
                ${lvs.map(lv => {
                    const isSelected = lv.id === this.config.launchVehicle;
                    const cap = lv.maxPayloadKg[mission.destination];
                    return `
                        <div class="comp-card ${isSelected ? 'active' : ''}" onclick="window.app.updateConfig('launchVehicle', '${lv.id}')">
                            <div class="comp-info">
                                <h4>${lv.name} <span style="font-size:12px; color:#9BAAC2;">(${lv.class})</span></h4>
                                <p>${lv.pros} · Reliability: ${(lv.reliability * 100).toFixed(0)}%</p>
                            </div>
                            <div class="comp-specs">
                                <div class="comp-cost">$${lv.costMillion}M</div>
                                <div class="comp-mass">${cap} kg cap</div>
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
        const avionics = Object.values(GAME_DATA.avionics);
        const propulsions = Object.values(GAME_DATA.propulsions);
        const thermals = Object.values(GAME_DATA.thermals);
        const instruments = Object.values(GAME_DATA.instruments);

        container.innerHTML = `
            <div class="nasa-callout">
                <strong>[NASA CubeSat 101 Subsystems]</strong> Integrate structure, power generation, battery reserves, avionics, radio/optical comms, propulsion, thermal loops, and scientific sensors.
            </div>

            <!-- Structure -->
            <div class="section-subtitle" style="margin: 10px 0 6px 0; color:#43D9FF; font-weight:bold;">1. BUS STRUCTURE & RADIATION SHIELDING</div>
            <div class="component-option-grid">
                ${structures.map(s => `
                    <div class="comp-card ${s.id === this.config.structure ? 'active' : ''}" onclick="window.app.updateConfig('structure', '${s.id}')">
                        <div class="comp-info">
                            <h4>${s.name}</h4>
                            <p>${s.desc}</p>
                        </div>
                        <div class="comp-specs">
                            <div class="comp-cost">$${s.costMillion}M</div>
                            <div class="comp-mass">${s.massKg} kg</div>
                        </div>
                    </div>
                `).join("")}
            </div>

            <!-- Power Generation -->
            <div class="section-subtitle" style="margin: 14px 0 6px 0; color:#43D9FF; font-weight:bold;">2. ELECTRICAL POWER SUBSYSTEM (EPS)</div>
            <div class="component-option-grid">
                ${powers.map(p => `
                    <div class="comp-card ${p.id === this.config.powerGen ? 'active' : ''}" onclick="window.app.updateConfig('powerGen', '${p.id}')">
                        <div class="comp-info">
                            <h4>${p.name}</h4>
                            <p>${p.desc}</p>
                        </div>
                        <div class="comp-specs">
                            <div class="comp-cost">$${p.costMillion}M</div>
                            <div class="comp-mass">${p.basePowerW}W base (${p.massKg} kg)</div>
                        </div>
                    </div>
                `).join("")}
            </div>

            <!-- Energy Storage -->
            <div class="section-subtitle" style="margin: 14px 0 6px 0; color:#43D9FF; font-weight:bold;">3. ENERGY STORAGE (BATTERY)</div>
            <div class="component-option-grid">
                ${batteries.map(b => `
                    <div class="comp-card ${b.id === this.config.battery ? 'active' : ''}" onclick="window.app.updateConfig('battery', '${b.id}')">
                        <div class="comp-info">
                            <h4>${b.name}</h4>
                            <p>${b.desc}</p>
                        </div>
                        <div class="comp-specs">
                            <div class="comp-cost">$${b.costMillion}M</div>
                            <div class="comp-mass">${b.capacityWh} Wh (${b.massKg} kg)</div>
                        </div>
                    </div>
                `).join("")}
            </div>

            <!-- Communications -->
            <div class="section-subtitle" style="margin: 14px 0 6px 0; color:#43D9FF; font-weight:bold;">4. RADIO & OPTICAL COMMUNICATIONS</div>
            <div class="component-option-grid">
                ${comms.map(c => `
                    <div class="comp-card ${c.id === this.config.comms ? 'active' : ''}" onclick="window.app.updateConfig('comms', '${c.id}')">
                        <div class="comp-info">
                            <h4>${c.name}</h4>
                            <p>${c.desc}</p>
                        </div>
                        <div class="comp-specs">
                            <div class="comp-cost">$${c.costMillion}M</div>
                            <div class="comp-mass">${c.maxDataRateMbDay} MB/d (${c.massKg} kg)</div>
                        </div>
                    </div>
                `).join("")}
            </div>

            <!-- Scientific Instruments Selection -->
            <div class="section-subtitle" style="margin: 14px 0 6px 0; color:#43D9FF; font-weight:bold;">5. SCIENTIFIC INSTRUMENT PAYLOAD (SELECT MULTIPLE)</div>
            <div class="component-option-grid">
                ${instruments.map(inst => {
                    const isInstalled = this.config.instruments.includes(inst.id);
                    return `
                        <div class="comp-card ${isInstalled ? 'active' : ''}" onclick="window.app.toggleInstrument('${inst.id}')">
                            <div class="comp-info">
                                <h4>${inst.name} ${isInstalled ? '✔ [INSTALLED]' : '+ [ADD]'}</h4>
                                <p>${inst.desc} · <em>${inst.nasaAnalogue}</em></p>
                            </div>
                            <div class="comp-specs">
                                <div class="comp-cost">+$${inst.costMillion}M</div>
                                <div class="comp-mass">+${inst.scienceVal} pts (${inst.massKg} kg)</div>
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
                <strong>[NASA Mission Architecture]</strong> Simplified orbital geometry and trajectory models for ${mission.destination}. 
                Trajectory design balances science observation geometry, solar illumination periods, and station-keeping fuel.
            </div>
            <div class="component-option-grid">
                ${mission.architectures.map(arch => {
                    const isSelected = arch.id === this.config.architecture;
                    return `
                        <div class="comp-card ${isSelected ? 'active' : ''}" onclick="window.app.updateConfig('architecture', '${arch.id}')">
                            <div class="comp-info">
                                <h4>${arch.name}</h4>
                                <p>${arch.description} · Comms Window: ${arch.commWindowPct}%</p>
                            </div>
                            <div class="comp-specs">
                                <div class="comp-cost">+$${arch.complexityCost}M</div>
                                <div class="comp-mass">${arch.scienceMultiplier}x Yield (+${arch.complexityMass} kg)</div>
                            </div>
                        </div>
                    `;
                }).join("")}
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
                <strong>[NASA Ground & User Segments]</strong> A mission does not end at launch. Telemetry must be collected across interplanetary light travel times and translated into findings by science working groups.
            </div>
            <div class="section-subtitle" style="margin: 10px 0 6px 0; color:#43D9FF; font-weight:bold;">GROUND TRACKING NETWORK</div>
            <div class="component-option-grid">
                ${grounds.map(g => `
                    <div class="comp-card ${g.id === this.config.groundSegment ? 'active' : ''}" onclick="window.app.updateConfig('groundSegment', '${g.id}')">
                        <div class="comp-info">
                            <h4>${g.name}</h4>
                            <p>${g.desc} · Contact: ${g.contactHoursDay} hrs/day</p>
                        </div>
                        <div class="comp-specs">
                            <div class="comp-cost">$${g.costMillion}M</div>
                            <div class="comp-mass">${(g.downlinkEfficiency * 100).toFixed(0)}% Eff</div>
                        </div>
                    </div>
                `).join("")}
            </div>

            <div class="section-subtitle" style="margin: 14px 0 6px 0; color:#43D9FF; font-weight:bold;">SCIENCE USER PIPELINE</div>
            <div class="component-option-grid">
                ${users.map(u => `
                    <div class="comp-card ${u.id === this.config.userSegment ? 'active' : ''}" onclick="window.app.updateConfig('userSegment', '${u.id}')">
                        <div class="comp-info">
                            <h4>${u.name}</h4>
                            <p>${u.desc}</p>
                        </div>
                        <div class="comp-specs">
                            <div class="comp-cost">$${u.costMillion}M</div>
                            <div class="comp-mass">${u.scienceMultiplier}x Multiplier</div>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
    }

    updateConfig(key, val) {
        window.AudioFX.playClick();
        this.config[key] = val;
        this.renderPlanningScreen();
    }

    toggleInstrument(instId) {
        window.AudioFX.playClick();
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
            window.AudioFX.playAlert();
            return;
        }

        window.AudioFX.playLaunch();
        if (window.spaceCanvas) {
            window.spaceCanvas.setWarp(true);
            setTimeout(() => {
                window.spaceCanvas.setWarp(false);
                this.resetSimulation();
                this.showScreen("simulation");
            }, 1400);
        } else {
            this.resetSimulation();
            this.showScreen("simulation");
        }
    }

    // =========================================================
    // SCREEN 4: MISSION SIMULATION FLIGHT DECK
    // =========================================================
    renderSimulationScreen() {
        const mission = GAME_DATA.missions[this.selectedMissionId];
        const eventsList = EventsEngine.events[this.selectedMissionId] || [];
        const calc = GameEngine.calculateMissionDesign(this.selectedMissionId, this.config);

        // Update telemetry HUD
        const hVal = document.getElementById("hud-health-val");
        if (hVal) {
            hVal.textContent = `${this.simState.healthPct.toFixed(0)}%`;
            hVal.style.color = this.simState.healthPct > 70 ? "#43D9FF" : (this.simState.healthPct > 40 ? "#FFB547" : "#FF5263");
        }
        const pVal = document.getElementById("hud-power-val");
        if (pVal) {
            pVal.textContent = `${this.simState.powerPct.toFixed(0)}%`;
            pVal.style.color = this.simState.powerPct > 60 ? "#43D9FF" : (this.simState.powerPct > 30 ? "#FFB547" : "#FF5263");
        }
        const dColVal = document.getElementById("hud-datacol-val");
        if (dColVal) dColVal.textContent = `${this.simState.dataCollectedMb.toFixed(0)} MB`;

        const dTxVal = document.getElementById("hud-datatx-val");
        if (dTxVal) dTxVal.textContent = `${this.simState.dataTransmittedMb.toFixed(0)} MB`;

        const sVal = document.getElementById("hud-science-val");
        if (sVal) sVal.textContent = `${this.simState.sciencePoints.toFixed(0)}`;

        // Render current crisis event or mission complete
        const crisisContainer = document.getElementById("crisis-event-container");
        if (!crisisContainer) return;

        const currIdx = this.simState.eventIdx;
        if (currIdx >= eventsList.length || this.simState.completed) {
            crisisContainer.innerHTML = `
                <div class="hud-panel" style="text-align:center; padding: 40px 20px;">
                    <h2 style="font-family:var(--font-heading); color:#43D9FF; font-size:28px;">FLIGHT MISSION COMPLETE</h2>
                    <p style="color:#CAD5E8; max-width:620px; margin: 12px auto 24px auto;">
                        All flight mission phases and planetary anomalies executed. Telemetry recorded. 
                        Data downlinked to ground science teams for systems engineering debrief.
                    </p>
                    <button class="btn-primary" onclick="window.app.showScreen('debrief')">
                        📊 COMMENCE MISSION EVALUATION & DEBRIEF
                    </button>
                </div>
            `;
        } else {
            const ev = eventsList[currIdx];
            crisisContainer.innerHTML = `
                <div class="crisis-card">
                    <div class="crisis-card-header">
                        <span class="crisis-phase">${ev.phase}</span>
                        <span class="badge badge-ready">EVENT ${currIdx + 1} OF ${eventsList.length}</span>
                    </div>
                    <h3 class="crisis-title">${ev.title}</h3>
                    <p class="crisis-desc">${ev.description}</p>
                    <div class="nasa-callout">
                        <strong>[NASA Flight Context]</strong> ${ev.nasaContext}
                    </div>

                    <div style="font-family:var(--font-telemetry); font-size:13px; color:#43D9FF; font-weight:bold; margin-top:16px;">
                        SELECT FLIGHT COMMAND DECISION:
                    </div>
                    <div class="choices-container">
                        ${ev.choices.map((c, cIdx) => `
                            <button class="choice-btn" onclick="window.app.executeChoice(${currIdx}, ${cIdx})">
                                <div class="choice-btn-title">OPTION ${String.fromCharCode(65 + cIdx)}: ${c.text}</div>
                                <div class="choice-btn-desc">${c.explanation}</div>
                            </button>
                        `).join("")}
                    </div>
                </div>
            `;
        }

        // Render Visual Viewports on Simulation Screen
        const simPlanetViewport = document.getElementById("sim-planet-viewport");
        if (simPlanetViewport) simPlanetViewport.innerHTML = this.getPlanetSvg(mission.destination);

        const simCraftViewport = document.getElementById("sim-spacecraft-viewport");
        if (simCraftViewport) simCraftViewport.innerHTML = this.renderSpacecraftSvg(calc);

        // Render flight log feed
        const logFeed = document.getElementById("flight-log-feed");
        if (logFeed) {
            logFeed.innerHTML = this.simState.log.map(item => `
                <div class="log-entry">
                    <span class="log-phase">${item.phase}</span>: <strong>${item.eventTitle}</strong><br>
                    <span style="color:#9BAAC2;">Decision: ${item.choiceText}</span>
                    <div class="log-conseq">${item.consequence}</div>
                </div>
            `).reverse().join("") || `<div style="color:#64748B; padding:10px;">Awaiting telemetry pings...</div>`;
        }
    }

    executeChoice(eventIdx, choiceIdx) {
        window.AudioFX.playClick();
        const calc = GameEngine.calculateMissionDesign(this.selectedMissionId, this.config);
        const result = EventsEngine.applyChoice(this.selectedMissionId, eventIdx, choiceIdx, this.simState, calc);

        result.simState.eventIdx = eventIdx + 1;
        const eventsList = EventsEngine.events[this.selectedMissionId] || [];
        if (result.simState.eventIdx >= eventsList.length) {
            result.simState.completed = true;
            window.AudioFX.playSuccess();
        }

        this.simState = result.simState;
        this.renderSimulationScreen();
    }

    // =========================================================
    // SCREEN 5: MISSION DEBRIEF & SCORING
    // =========================================================
    renderDebriefScreen() {
        const mission = GAME_DATA.missions[this.selectedMissionId];
        const calc = GameEngine.calculateMissionDesign(this.selectedMissionId, this.config);
        const debrief = GameEngine.evaluateMission(this.selectedMissionId, calc, this.simState);

        // Header score
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

        // Categories progress bars
        const catContainer = document.getElementById("debrief-categories-container");
        if (catContainer) {
            const cats = Object.values(debrief.categories);
            catContainer.innerHTML = cats.map(cat => `
                <div class="score-bar-row">
                    <div class="score-bar-header">
                        <span style="color:#F4F7FF;">${cat.name}</span>
                        <span style="color:#43D9FF; font-family:var(--font-heading);">${cat.score} / ${cat.max}</span>
                    </div>
                    <div class="score-progress-track">
                        <div class="score-progress-fill" style="width: ${cat.pct}%;"></div>
                    </div>
                </div>
            `).join("");
        }

        // Matched Objectives
        const objContainer = document.getElementById("debrief-objectives-list");
        if (objContainer) {
            objContainer.innerHTML = debrief.matchedObjectives.map(obj => {
                const color = obj.status === "Fully Achieved" ? "#43D9FF" : (obj.status === "Partially Achieved" ? "#FFB547" : "#FF5263");
                return `<li style="margin-bottom:6px; color:#E0E8F5;"><strong>${obj.title}</strong> — <span style="color:${color}; font-weight:bold;">${obj.status}</span></li>`;
            }).join("");
        }

        // Lessons Learned & Suggestions
        const lessonsContainer = document.getElementById("debrief-lessons-list");
        if (lessonsContainer) {
            lessonsContainer.innerHTML = debrief.lessonsLearned.map(l => `<li style="margin-bottom:6px; color:#CAD5E8;">${l}</li>`).join("");
        }
        const sugContainer = document.getElementById("debrief-suggestions-list");
        if (sugContainer) {
            sugContainer.innerHTML = debrief.suggestions.map(s => `<li style="margin-bottom:6px; color:#43D9FF;">💡 <strong>Recommendation:</strong> ${s}</li>`).join("");
        }
    }

    printReport() {
        window.AudioFX.playClick();
        window.print();
    }

    // =========================================================
    // SVG RENDERING HELPERS
    // =========================================================
    getPlanetSvg(destination) {
        if (destination === "Moon") {
            return `
            <svg viewBox="0 0 300 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="mGlow" cx="45%" cy="45%" r="50%">
                        <stop offset="60%" stop-color="#C5CBD3"/>
                        <stop offset="95%" stop-color="#9AA3B0"/>
                        <stop offset="100%" stop-color="#4B5568"/>
                    </radialGradient>
                </defs>
                <ellipse cx="150" cy="80" rx="120" ry="38" fill="none" stroke="#43D9FF" stroke-width="1.5" stroke-dasharray="5,4" opacity="0.6"/>
                <circle cx="150" cy="80" r="42" fill="url(#mGlow)"/>
                <circle cx="138" cy="65" r="7" fill="#9AA3B0" opacity="0.6"/>
                <circle cx="165" cy="90" r="10" fill="#9AA3B0" opacity="0.5"/>
                <circle cx="145" cy="96" r="6" fill="#9AA3B0" opacity="0.6"/>
                <g transform="translate(245, 68)">
                    <rect x="-6" y="-3" width="12" height="6" fill="#43D9FF" rx="1"/>
                    <line x1="-14" y1="0" x2="-6" y2="0" stroke="#FFB547" stroke-width="2"/>
                    <line x1="6" y1="0" x2="14" y2="0" stroke="#FFB547" stroke-width="2"/>
                </g>
            </svg>`;
        } else if (destination === "Mars") {
            return `
            <svg viewBox="0 0 300 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="marsG" cx="45%" cy="45%" r="55%">
                        <stop offset="50%" stop-color="#E05A36"/>
                        <stop offset="90%" stop-color="#A8381A"/>
                        <stop offset="100%" stop-color="#5C1B0A"/>
                    </radialGradient>
                </defs>
                <ellipse cx="150" cy="80" rx="125" ry="42" fill="none" stroke="#FFB547" stroke-width="1.5" stroke-dasharray="5,4" opacity="0.6"/>
                <circle cx="150" cy="80" r="44" fill="url(#marsG)"/>
                <ellipse cx="150" cy="38" rx="14" ry="4" fill="#F8FAFC" opacity="0.9"/>
                <path d="M 125 80 Q 150 88 175 78" stroke="#5C1B0A" stroke-width="3" fill="none" opacity="0.7"/>
                <g transform="translate(55, 66)">
                    <rect x="-6" y="-3" width="12" height="6" fill="#FFB547" rx="1"/>
                    <line x1="-15" y1="0" x2="-6" y2="0" stroke="#43D9FF" stroke-width="2"/>
                    <line x1="6" y1="0" x2="15" y2="0" stroke="#43D9FF" stroke-width="2"/>
                </g>
            </svg>`;
        } else {
            return `
            <svg viewBox="0 0 300 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="eGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="60%" stop-color="#E2E8F0"/>
                        <stop offset="90%" stop-color="#94A3B8"/>
                        <stop offset="100%" stop-color="#334155"/>
                    </radialGradient>
                </defs>
                <circle cx="45" cy="80" r="75" fill="#B45309" opacity="0.4"/>
                <circle cx="210" cy="80" r="36" fill="url(#eGlow)"/>
                <path d="M 188 66 Q 210 80 230 70" stroke="#9A3412" stroke-width="1.2" fill="none" opacity="0.7"/>
                <path d="M 195 90 Q 215 84 235 94" stroke="#9A3412" stroke-width="1.2" fill="none" opacity="0.7"/>
                <path d="M 210 44 C 206 28, 214 28, 210 20" stroke="#38BDF8" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                <circle cx="210" cy="20" r="3" fill="#38BDF8"/>
            </svg>`;
        }
    }

    renderSpacecraftSvg(calc) {
        const comps = calc.selectedComponents;
        const pwr = comps.powerGen.id;
        const struct = comps.structure.id;
        const comm = comps.comms.id;
        const instCount = comps.instruments.length;

        const busStroke = struct === "struct_vault" ? "#FF5263" : (struct === "struct_carbon" ? "#43D9FF" : "#CAD5E8");
        const busFill = struct === "struct_vault" ? "#152442" : "#101B30";

        let powerVisualLeft = "";
        let powerVisualRight = "";

        if (pwr.includes("mmrtg")) {
            powerVisualLeft = `
                <rect x="55" y="92" width="34" height="26" fill="#D97706" rx="2" stroke="#F59E0B" stroke-width="1.5"/>
                <line x1="62" y1="92" x2="62" y2="118" stroke="#78350F" stroke-width="1.5"/>
                <line x1="72" y1="92" x2="72" y2="118" stroke="#78350F" stroke-width="1.5"/>
                <line x1="89" y1="105" x2="110" y2="105" stroke="#94A3B8" stroke-width="2.5"/>
                <text x="59" y="108" font-family="'Rajdhani', sans-serif" font-size="9" fill="#FEF3C7" font-weight="bold">MMRTG</text>
            `;
            powerVisualRight = `
                <rect x="235" y="96" width="28" height="18" fill="#334155" rx="2" stroke="#94A3B8" stroke-width="1"/>
                <line x1="210" y1="105" x2="235" y2="105" stroke="#94A3B8" stroke-width="2.5"/>
            `;
        } else if (pwr === "pwr_ultraflex") {
            powerVisualLeft = `
                <circle cx="62" cy="105" r="32" fill="#1E3A8A" stroke="#38BDF8" stroke-width="1.5"/>
                <circle cx="62" cy="105" r="18" fill="none" stroke="#60A5FA" stroke-width="1" stroke-dasharray="3,3"/>
                <line x1="94" y1="105" x2="110" y2="105" stroke="#CAD5E8" stroke-width="3"/>
            `;
            powerVisualRight = `
                <circle cx="258" cy="105" r="32" fill="#1E3A8A" stroke="#38BDF8" stroke-width="1.5"/>
                <circle cx="258" cy="105" r="18" fill="none" stroke="#60A5FA" stroke-width="1" stroke-dasharray="3,3"/>
                <line x1="210" y1="105" x2="226" y2="105" stroke="#CAD5E8" stroke-width="3"/>
            `;
        } else {
            powerVisualLeft = `
                <rect x="35" y="86" width="75" height="38" fill="#0C2556" stroke="#2563EB" stroke-width="1.5" rx="1"/>
                <line x1="60" y1="86" x2="60" y2="124" stroke="#1D4ED8" stroke-width="1"/>
                <line x1="85" y1="86" x2="85" y2="124" stroke="#1D4ED8" stroke-width="1"/>
                <line x1="110" y1="105" x2="115" y2="105" stroke="#94A3B8" stroke-width="3"/>
            `;
            powerVisualRight = `
                <rect x="210" y="86" width="75" height="38" fill="#0C2556" stroke="#2563EB" stroke-width="1.5" rx="1"/>
                <line x1="235" y1="86" x2="235" y2="124" stroke="#1D4ED8" stroke-width="1"/>
                <line x1="260" y1="86" x2="260" y2="124" stroke="#1D4ED8" stroke-width="1"/>
                <line x1="205" y1="105" x2="210" y2="105" stroke="#94A3B8" stroke-width="3"/>
            `;
        }

        let dishSvg = "";
        if (comm === "comm_ka_optical") {
            dishSvg = `
                <path d="M 135 68 Q 160 46 185 68" stroke="#43D9FF" stroke-width="2.5" fill="none"/>
                <line x1="160" y1="54" x2="160" y2="68" stroke="#43D9FF" stroke-width="2"/>
                <circle cx="160" cy="52" r="3" fill="#38BDF8"/>
                <rect x="166" y="55" width="5" height="11" fill="#FF5263" rx="1"/>
            `;
        } else if (comm === "comm_x_band") {
            dishSvg = `
                <path d="M 138 70 Q 160 50 182 70" stroke="#CBD5E1" stroke-width="2.5" fill="none"/>
                <line x1="160" y1="58" x2="160" y2="70" stroke="#CBD5E1" stroke-width="2"/>
                <circle cx="160" cy="56" r="2.5" fill="#43D9FF"/>
            `;
        } else {
            dishSvg = `
                <line x1="160" y1="48" x2="160" y2="70" stroke="#94A3B8" stroke-width="2"/>
                <circle cx="160" cy="46" r="3" fill="#FFB547"/>
            `;
        }

        return `
        <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <line x1="15" y1="165" x2="305" y2="165" stroke="#1A2844" stroke-width="1"/>
            <line x1="160" y1="20" x2="160" y2="160" stroke="#1A2844" stroke-width="1" stroke-dasharray="3,3"/>

            ${powerVisualLeft}
            ${powerVisualRight}

            <!-- Central Bus -->
            <rect x="115" y="70" width="90" height="70" fill="${busFill}" stroke="${busStroke}" stroke-width="2" rx="4"/>
            <rect x="125" y="80" width="70" height="34" fill="#0B1224" stroke="#1E2D4A" stroke-width="1" rx="2"/>

            <text x="133" y="94" font-family="'Orbitron', sans-serif" font-size="8.5" fill="#43D9FF">BUS: ${comps.structure.name.slice(0, 11)}</text>
            <text x="133" y="106" font-family="'Rajdhani', sans-serif" font-size="9" fill="#9BAAC2">${instCount} PAYLOADS ACTIVE</text>

            ${dishSvg}

            <!-- Thruster Nozzle -->
            <polygon points="148,140 172,140 176,154 144,154" fill="#334155" stroke="#64748B" stroke-width="1"/>

            <text x="15" y="24" font-family="'Orbitron', sans-serif" font-size="10" fill="#43D9FF">SPACECRAFT SCHEMATIC</text>
            <text x="15" y="174" font-family="'Rajdhani', sans-serif" font-size="10" fill="#9BAAC2">TOTAL MASS: ${calc.totalMassKg} KG · POWER: ${calc.powerGenerationW} W</text>
        </svg>
        `;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.spaceCanvas = new SpaceCanvas("space-canvas");
    window.app = new UIController();
});

