/**
 * BEYOND THE ORBIT — FLIGHT OPERATIONS GAMEPLAY DECK
 * =================================================
 * Team Orbitera | NASA Space Apps Challenge 2026
 * 
 * Interactive real-time mission control gameplay:
 * - Real-time orbital journey with animated spacecraft position & flight timeline
 * - Target science zones passing through sensor footprint
 * - Active flight controls: Deploy Sensors, Downlink Telemetry, Execute Trajectory Burns, Power Modes
 * - Subsystem telemetry (Power, Fuel/Delta-V, Buffer, Health, Signal Link)
 * - Scientific Decadal survey objectives completed through gameplay
 * - Hardware-consequence crisis anomaly interventions
 */

class FlightDeck {
    constructor(uiController) {
        this.ui = uiController;
        this.isRunning = false;
        this.timeWarp = 1; // 0=Pause, 1=1x Realtime, 5=5x Warp, 20=20x Max
        this.missionPhase = 1; // 1 to 6
        this.missionTimeSec = 0;
        this.orbitTheta = 0; // 0 to 2*PI
        this.altitudeKm = 100;
        this.deltaVMs = 750;
        this.propellantKg = 140;
        this.batteryCapacityWh = 1200;
        this.batteryCurrentWh = 1200;
        this.dataBufferMb = 0;
        this.maxBufferMb = 16000;
        this.dataDownlinkedMb = 0;
        this.scienceScore = 0;
        this.healthPct = 100;
        this.powerMode = "cruise"; // "science", "cruise", "safe"

        this.isDaylight = true;
        this.isGroundContact = true;
        this.activeTargetInCone = null;
        this.objectiveProgress = {}; // objId -> 0 to 100%

        this.anomalies = [];
        this.activeAnomaly = null;

        this.lastTime = Date.now();
        this.timer = null;
    }

    start(missionId, designCalc) {
        this.missionId = missionId;
        this.design = designCalc;
        const mission = GAME_DATA.missions[missionId];
        const comps = designCalc.selectedComponents;

        this.isRunning = true;
        this.timeWarp = 1;
        this.missionPhase = 1;
        this.missionTimeSec = 0;
        this.orbitTheta = 0;
        this.altitudeKm = mission.destination === "Moon" ? 100 : (mission.destination === "Mars" ? 320 : 250);
        this.deltaVMs = comps.propulsion.deltaVMs || 750;
        this.propellantKg = comps.propulsion.massKg * 0.65;
        this.batteryCapacityWh = comps.battery.capacityWh || 1200;
        this.batteryCurrentWh = this.batteryCapacityWh;
        this.dataBufferMb = 0;
        this.maxBufferMb = comps.avionics.storageGb * 1024 || 16000;
        this.dataDownlinkedMb = 0;
        this.scienceScore = 0;
        this.healthPct = 100;
        this.powerMode = "cruise";

        // Setup Decadal Objectives
        this.objectiveProgress = {};
        mission.scientificObjectives.forEach(obj => {
            this.objectiveProgress[obj.id] = 0;
        });

        // Setup geographic science targets on surface
        this.initScienceTargets(mission.destination);

        // Queue mission crisis events
        const rawEvents = EventsEngine.events[missionId] || [];
        this.anomalies = rawEvents.map((ev, i) => ({
            ...ev,
            triggerProgress: 0.16 + (i * 0.18),
            handled: false
        }));
        this.activeAnomaly = null;

        if (this.timer) clearInterval(this.timer);
        this.lastTime = Date.now();
        this.timer = setInterval(() => this.tick(), 60);

        this.renderObjectivesList();
        this.postLog("MISSION IGNITION: Spacecraft inserted into flight corridor. Telemetry carrier locked.");
    }

    stop() {
        this.isRunning = false;
        if (this.timer) clearInterval(this.timer);
    }

    setTimeWarp(speed) {
        this.timeWarp = speed;
        if (window.AudioFX) window.AudioFX.playClick();
    }

    initScienceTargets(destination) {
        if (destination === "Moon") {
            this.scienceTargets = [
                { id: "tgt_shackleton", name: "Shackleton Crater (PSR Ice Trap)", angle: Math.PI * 0.35, objId: "lunar_obj_1", inst: "radar", rewardPts: 35, yieldMb: 1400 },
                { id: "tgt_cabeus", name: "Cabeus Basin Volatiles Deposit", angle: Math.PI * 1.05, objId: "lunar_obj_1", inst: "spectrometer", rewardPts: 35, yieldMb: 1800 },
                { id: "tgt_maria", name: "Basaltic Highlands & Regolith Strata", angle: Math.PI * 1.65, objId: "lunar_obj_2", inst: "camera", rewardPts: 30, yieldMb: 2400 }
            ];
        } else if (destination === "Mars") {
            this.scienceTargets = [
                { id: "tgt_jezero", name: "Jezero Crater Sedimentary Delta", angle: Math.PI * 0.3, objId: "mars_obj_1", inst: "spectrometer", rewardPts: 35, yieldMb: 1900 },
                { id: "tgt_valles", name: "Valles Marineris Wall Bedding", angle: Math.PI * 0.95, objId: "mars_obj_3", inst: "camera", rewardPts: 30, yieldMb: 2500 },
                { id: "tgt_polar", name: "Planum Australe Glacial Ice Cap", angle: Math.PI * 1.6, objId: "mars_obj_2", inst: "radar", rewardPts: 35, yieldMb: 1600 }
            ];
        } else {
            this.scienceTargets = [
                { id: "tgt_thrace", name: "Thrace Macula Cryo-Plume Eruption", angle: Math.PI * 0.28, objId: "europa_obj_2", inst: "spectrometer", rewardPts: 40, yieldMb: 2800 },
                { id: "tgt_conamara", name: "Conamara Chaos Rafted Ice Shell", angle: Math.PI * 0.98, objId: "europa_obj_1", inst: "radar", rewardPts: 40, yieldMb: 2600 },
                { id: "tgt_saline", name: "Induced Salinity Magnetic Current", angle: Math.PI * 1.62, objId: "europa_obj_3", inst: "particle_detector", rewardPts: 30, yieldMb: 1100 }
            ];
        }
    }

    tick() {
        if (!this.isRunning || this.timeWarp === 0) return;

        const now = Date.now();
        const dt = (now - this.lastTime) / 1000;
        this.lastTime = now;

        const effectiveDt = dt * this.timeWarp;
        this.missionTimeSec += effectiveDt;

        const comps = this.design.selectedComponents;
        const env = GAME_DATA.missions[this.missionId].env;

        // Advance Orbit (simulated 1 orbit = 120 seconds in realtime)
        const orbitRate = (2 * Math.PI / 120.0) * effectiveDt;
        this.orbitTheta = (this.orbitTheta + orbitRate) % (2 * Math.PI);

        // Update Mission Phase Timeline (1 to 6)
        const totalSimDuration = 480; // 8 minutes simulated mission baseline
        const progressRatio = Math.min(1.0, this.missionTimeSec / totalSimDuration);
        this.missionPhase = Math.min(6, Math.floor(progressRatio * 6) + 1);

        // Day vs Eclipse Shadow (shadow between 0.45*PI and 0.82*PI)
        this.isDaylight = !(this.orbitTheta >= Math.PI * 0.45 && this.orbitTheta <= Math.PI * 0.82);

        // DSN Ground Station Contact Window (occultation between 0.52*PI and 0.78*PI)
        this.isGroundContact = !(this.orbitTheta >= Math.PI * 0.52 && this.orbitTheta <= Math.PI * 0.78);

        // Subsystem Power Calculation
        let pwrGenW = 0;
        if (comps.powerGen.type === "solar") {
            if (this.isDaylight) {
                pwrGenW = comps.powerGen.basePowerW * (env.solarFluxScale || 1.0);
            }
        } else {
            // MMRTG continuous nuclear electricity
            pwrGenW = comps.powerGen.basePowerW;
        }

        let pwrLoadW = comps.avionics.powerW + comps.thermal.powerW;
        if (this.powerMode === "science") {
            pwrLoadW += comps.instruments.reduce((s, i) => s + i.powerW, 0) + (comps.comms.powerW * 0.8);
        } else if (this.powerMode === "cruise") {
            pwrLoadW += (comps.comms.powerW * 0.3);
        } else {
            // Safe mode: minimum housekeeping
            pwrLoadW = Math.max(12, pwrLoadW * 0.5);
        }

        const netW = pwrGenW - pwrLoadW;
        const dWh = (netW * effectiveDt) / 3600.0;
        this.batteryCurrentWh = Math.max(0, Math.min(this.batteryCapacityWh, this.batteryCurrentWh + dWh));

        // Battery brownout damage
        if (this.batteryCurrentWh <= 0) {
            this.healthPct = Math.max(10, this.healthPct - (0.4 * effectiveDt));
        }

        // Detect Surface Science Targets in Sensor Footprint
        this.activeTargetInCone = null;
        for (const tgt of this.scienceTargets) {
            const diff = Math.abs(this.orbitTheta - tgt.angle);
            if (diff < 0.22 || diff > (Math.PI * 2 - 0.22)) {
                this.activeTargetInCone = tgt;
                break;
            }
        }

        // Check Crisis Anomalies
        if (!this.activeAnomaly) {
            for (const anom of this.anomalies) {
                if (!anom.handled && progressRatio >= anom.triggerProgress) {
                    anom.handled = true;
                    this.triggerCrisisAnomaly(anom);
                    break;
                }
            }
        }

        // Render HUD
        this.updateFlightHUD(pwrGenW, pwrLoadW, progressRatio);
    }

    triggerCrisisAnomaly(anom) {
        this.activeAnomaly = anom;
        this.timeWarp = 1; // Drop to 1x realtime
        if (window.AudioFX) window.AudioFX.playAlert();
        this.showCrisisModal(anom);
    }

    resolveAnomaly(choiceIdx) {
        if (!this.activeAnomaly) return;
        const anom = this.activeAnomaly;
        const choice = anom.choices[choiceIdx];

        const simWrapper = {
            healthPct: this.healthPct,
            powerPct: (this.batteryCurrentWh / this.batteryCapacityWh) * 100,
            dataCollectedMb: this.dataBufferMb,
            dataTransmittedMb: this.dataDownlinkedMb,
            sciencePoints: this.scienceScore,
            log: this.ui.simState.log
        };

        const result = EventsEngine.applyChoice(
            this.missionId,
            anom.id.includes("1") ? 0 : (anom.id.includes("2") ? 1 : (anom.id.includes("3") ? 2 : (anom.id.includes("4") ? 3 : 4))),
            choiceIdx,
            simWrapper,
            this.design
        );

        this.healthPct = result.simState.healthPct;
        this.scienceScore = result.simState.sciencePoints;
        this.ui.simState.log = result.simState.log;

        if (window.AudioFX) window.AudioFX.playClick();
        this.postLog(`COMMAND DISPATCHED [${anom.title}]: ${choice.text}`);
        this.postLog(`TELEMETRY UPDATE: ${result.consequence}`);

        this.activeAnomaly = null;
        const modal = document.getElementById("anomaly-modal-container");
        if (modal) modal.style.display = "none";
    }

    // --- ACTIVE PLAYER FLIGHT CONTROLS ---

    executeScan() {
        if (!this.isRunning) return;
        const comps = this.design.selectedComponents;
        const insts = comps.instruments;

        if (insts.length === 0) {
            this.postLog("SCAN REJECT: No scientific instruments integrated on payload bus.");
            if (window.AudioFX) window.AudioFX.playAlert();
            return;
        }

        if (this.batteryCurrentWh < 35 && !this.isDaylight) {
            this.postLog("POWER REJECT: Battery storage too low to fire active radar in eclipse.");
            if (window.AudioFX) window.AudioFX.playAlert();
            return;
        }

        if (window.AudioFX) window.AudioFX.playClick();

        if (this.activeTargetInCone) {
            const tgt = this.activeTargetInCone;
            const hasSensor = insts.some(i => i.id === tgt.inst);
            const yieldData = hasSensor ? tgt.yieldMb : tgt.yieldMb * 0.35;
            const pts = hasSensor ? tgt.rewardPts : tgt.rewardPts * 0.3;

            const room = this.maxBufferMb - this.dataBufferMb;
            const stored = Math.min(room, yieldData);
            this.dataBufferMb += stored;

            // Advance Decadal Objective progress
            this.objectiveProgress[tgt.objId] = Math.min(100, (this.objectiveProgress[tgt.objId] || 0) + 35);
            this.renderObjectivesList();

            if (hasSensor) {
                this.postLog(`SCIENCE ACQUIRED [${tgt.name}]: +${stored} MB high-resolution radar/spectral telemetry buffered.`);
                if (window.AudioFX) window.AudioFX.playSuccess();
            } else {
                this.postLog(`LOW-FIDELITY OBSERVATION [${tgt.name}]: Missing dedicated ${tgt.inst}. Secondary data (+${stored} MB) recorded.`);
            }

            if (stored < yieldData) {
                this.postLog("MEMORY BUFFER SATURATED: Onboard storage at 100% capacity! Downlink required.");
                if (window.AudioFX) window.AudioFX.playAlert();
            }
        } else {
            const baseYield = 280;
            const stored = Math.min(this.maxBufferMb - this.dataBufferMb, baseYield);
            this.dataBufferMb += stored;
            this.postLog(`GLOBAL SURVEY: Wide-angle baseline topography recorded (+${stored} MB).`);
        }
    }

    executeDownlink() {
        if (!this.isRunning) return;
        if (!this.isGroundContact) {
            this.postLog("DOWNLINK BLOCKED: Radio line-of-sight occulted by planetary body. Awaiting AOS.");
            if (window.AudioFX) window.AudioFX.playAlert();
            return;
        }

        if (this.dataBufferMb <= 0) {
            this.postLog("DOWNLINK IDLE: Buffer clear. No un-downlinked science packets to transmit.");
            return;
        }

        const comps = this.design.selectedComponents;
        const ground = comps.groundSegment;
        const comm = comps.comms;

        if (window.AudioFX) window.AudioFX.playClick();

        const chunkSize = Math.min(this.dataBufferMb, (comm.maxDataRateMbDay * ground.downlinkEfficiency) / 7.5);
        this.dataBufferMb -= chunkSize;
        this.dataDownlinkedMb += chunkSize;

        const earned = Math.round((chunkSize / 180.0) * comps.userSegment.scienceMultiplier);
        this.scienceScore += earned;

        this.postLog(`CARRIER BURST [${ground.name}]: -${Math.round(chunkSize)} MB delivered. +${earned} Science Points verified.`);
        if (window.AudioFX) window.AudioFX.playSuccess();
    }

    executeBurn() {
        if (!this.isRunning) return;
        if (this.propellantKg <= 5) {
            this.postLog("PROPULSION EXHAUSTED: Fuel tanks empty (<5 kg). Delta-V reserves zero.");
            if (window.AudioFX) window.AudioFX.playAlert();
            return;
        }

        const comps = this.design.selectedComponents;
        this.propellantKg -= 18;
        this.deltaVMs = Math.max(0, this.deltaVMs - 90);
        this.altitudeKm = Math.max(35, this.altitudeKm - 30);

        if (window.AudioFX) window.AudioFX.playLaunch();
        this.postLog(`TRAJECTORY BURN [${comps.propulsion.name}]: Retrograde burn trimmed altitude to ${this.altitudeKm} km. ΔV remaining: ${this.deltaVMs} m/s.`);
    }

    setPowerMode(mode) {
        this.powerMode = mode;
        if (window.AudioFX) window.AudioFX.playClick();
        this.postLog(`POWER PROFILE: Switched to [${mode.toUpperCase()} MODE].`);
    }

    postLog(msg) {
        const feed = document.getElementById("flight-log-feed");
        if (!feed) return;

        const timeStr = new Date().toLocaleTimeString();
        const el = document.createElement("div");
        el.className = "log-entry";
        el.innerHTML = `<span style="color:#00F0FF; font-family:'Rajdhani', sans-serif;">[${timeStr}]</span> <span style="color:#E0E8F5;">${msg}</span>`;
        feed.insertBefore(el, feed.firstChild);

        if (!this.ui.simState.log) this.ui.simState.log = [];
        this.ui.simState.log.push({
            phase: `Phase ${this.missionPhase}`,
            eventTitle: "Flight Telemetry",
            choiceText: msg,
            consequence: "Recorded"
        });
    }

    renderObjectivesList() {
        const mission = GAME_DATA.missions[this.missionId];
        const container = document.getElementById("sim-objectives-checklist");
        if (!container) return;

        container.innerHTML = mission.scientificObjectives.map(obj => {
            const pct = Math.round(this.objectiveProgress[obj.id] || 0);
            return `
                <div style="background:#070E1E; border:1px solid #1E2D4A; border-radius:6px; padding:10px; margin-bottom:8px;">
                    <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:bold; color:#F4F7FF;">
                        <span>${obj.title}</span>
                        <span style="color:#00F0FF; font-family:'Orbitron', sans-serif;">${pct}%</span>
                    </div>
                    <div style="background:#0D192E; height:5px; border-radius:3px; margin-top:6px; overflow:hidden;">
                        <div style="background:#00F0FF; width:${pct}%; height:100%; transition:width 0.4s ease;"></div>
                    </div>
                </div>
            `;
        }).join("");
    }

    updateFlightHUD(pwrGenW, pwrLoadW, progressRatio) {
        const batPct = Math.round((this.batteryCurrentWh / this.batteryCapacityWh) * 100);
        const batEl = document.getElementById("hud-power-val");
        if (batEl) {
            batEl.textContent = `${batPct}%`;
            batEl.style.color = batPct > 60 ? "#00F0FF" : (batPct > 25 ? "#FFB800" : "#FF2A55");
        }

        const healthEl = document.getElementById("hud-health-val");
        if (healthEl) {
            healthEl.textContent = `${Math.round(this.healthPct)}%`;
            healthEl.style.color = this.healthPct > 70 ? "#00FF88" : (this.healthPct > 40 ? "#FFB800" : "#FF2A55");
        }

        const fuelEl = document.getElementById("hud-fuel-val");
        if (fuelEl) fuelEl.textContent = `${Math.round(this.propellantKg)} kg (${this.deltaVMs} m/s)`;

        const bufEl = document.getElementById("hud-datacol-val");
        if (bufEl) {
            bufEl.textContent = `${Math.round(this.dataBufferMb)} / ${this.maxBufferMb} MB`;
            bufEl.style.color = (this.dataBufferMb / this.maxBufferMb) > 0.85 ? "#FFB800" : "#00F0FF";
        }

        const sciEl = document.getElementById("hud-science-val");
        if (sciEl) sciEl.textContent = `${this.scienceScore}`;

        // Phase Stepper readout
        const phaseNames = [
            "1/6: LAUNCH & TLI",
            "2/6: TRANS-PLANETARY CRUISE",
            "3/6: RETROGRADE ORBIT INSERTION",
            "4/6: PRIMARY DECADAL SURVEY",
            "5/6: DEEP SURFACE & PLUME SWEEPS",
            "6/6: PLANETARY DISPOSAL PROTOCOL"
        ];
        const phaseBadge = document.getElementById("mission-phase-badge");
        if (phaseBadge) phaseBadge.textContent = phaseNames[this.missionPhase - 1] || "IN FLIGHT";

        // Target Sensor Badge
        const tgtBadge = document.getElementById("target-sensor-badge");
        if (tgtBadge) {
            if (this.activeTargetInCone) {
                tgtBadge.style.display = "inline-flex";
                tgtBadge.textContent = `🎯 TARGET IN SENSOR CONE: ${this.activeTargetInCone.name.toUpperCase()}`;
                tgtBadge.className = "badge badge-ready glow-cyan-pulse";
            } else {
                tgtBadge.style.display = "none";
            }
        }

        // Downlink Action Button Ready state
        const downBtn = document.getElementById("action-downlink-btn");
        if (downBtn) {
            if (this.isGroundContact && this.dataBufferMb > 0) {
                downBtn.classList.add("action-ready");
            } else {
                downBtn.classList.remove("action-ready");
            }
        }

        // Draw Interactive Radar Canvas
        if (window.spaceRenderer) {
            window.spaceRenderer.drawFlightDeckRadar(
                "flight-deck-radar-canvas",
                GAME_DATA.missions[this.missionId].destination,
                this.orbitTheta,
                this.altitudeKm,
                this.isDaylight,
                this.isGroundContact
            );
        }

        // Sync state to UI Controller for Screen 5
        this.ui.simState.healthPct = this.healthPct;
        this.ui.simState.powerPct = batPct;
        this.ui.simState.dataCollectedMb = this.dataDownlinkedMb + this.dataBufferMb;
        this.ui.simState.dataTransmittedMb = this.dataDownlinkedMb;
        this.ui.simState.sciencePoints = this.scienceScore;
    }

    showCrisisModal(anom) {
        let modal = document.getElementById("anomaly-modal-container");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "anomaly-modal-container";
            modal.className = "anomaly-modal-overlay";
            document.body.appendChild(modal);
        }

        modal.style.display = "flex";
        modal.innerHTML = `
            <div class="anomaly-modal-box">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #FF2A55; padding-bottom:10px;">
                    <span style="font-family:'Orbitron', sans-serif; font-size:14px; font-weight:800; color:#FF2A55; letter-spacing:1px;">
                        ⚠ OPERATIONAL ANOMALY DETECTED
                    </span>
                    <span class="badge badge-blocked glow-red-pulse">CRITICAL CRISIS</span>
                </div>
                <h3 style="font-family:'Orbitron', sans-serif; font-size:20px; color:#F4F7FF; margin:14px 0 8px 0;">
                    ${anom.title}
                </h3>
                <p style="font-size:14px; color:#CAD5E8; line-height:1.6; margin-bottom:14px;">
                    ${anom.description}
                </p>
                <div class="nasa-callout" style="border-left-color:#FFB800;">
                    <strong>[NASA Flight Context]</strong> ${anom.nasaContext}
                </div>
                <div style="font-family:'Rajdhani', sans-serif; font-size:13px; color:#00F0FF; font-weight:bold; margin-top:16px;">
                    EXECUTE EMERGENCY FLIGHT COMMAND:
                </div>
                <div class="choices-container">
                    ${anom.choices.map((c, idx) => `
                        <button class="choice-btn" onclick="window.flightSimulator.resolveAnomaly(${idx})">
                            <div class="choice-btn-title">OPTION ${String.fromCharCode(65 + idx)}: ${c.text}</div>
                            <div class="choice-btn-desc">${c.explanation}</div>
                        </button>
                    `).join("")}
                </div>
            </div>
        `;
    }
}

window.FlightDeck = FlightDeck;

