/**
 * BEYOND THE ORBIT — FLIGHT OPERATIONS GAME ENGINE
 * ================================================
 * Team Orbitera | NASA Space Apps Challenge 2026
 * 
 * Interactive real-time mission operations gameplay loop:
 * - Orbital mechanics & trajectory tracking (daylight, eclipse shadows)
 * - Ground station tracking windows (DSN line-of-sight & downlink)
 * - Target science zones passing through sensor footprint
 * - Active player controls: Sensor Scans, RF Downlinks, Trajectory Burns, Power Modes
 * - Subsystem telemetry (Power balance, Propellant, Buffer, Thermal, Health)
 * - Dynamic crisis anomaly interventions with hardware consequences
 */

class FlightSimulator {
    constructor(uiController) {
        this.ui = uiController;
        this.isRunning = false;
        this.timeWarp = 1; // 0=Pause, 1=Normal, 5=Fast, 20=Max Warp
        this.orbitAngle = 0; // 0 to 2*PI
        this.altitudeKm = 100;
        this.deltaVRemainingMs = 600;
        this.propellantKg = 120;
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
        this.activeTargetInSight = null;
        this.objectiveProgress = {}; // objId -> percentage

        this.anomalyQueue = [];
        this.activeAnomaly = null;

        this._missionCompletedTriggered = false;

        this.lastTimestamp = Date.now();
        this.loopInterval = null;
    }

    start(missionId, designCalc) {
        this.missionId = missionId;
        this.design = designCalc;
        const mission = GAME_DATA.missions[missionId];
        const comps = designCalc.selectedComponents;

        this.isRunning = true;
        this.timeWarp = 1;
        this.orbitAngle = 0;
        this.altitudeKm = mission.destination === "Moon" ? 100 : (mission.destination === "Mars" ? 320 : 250);
        this.flightPhase = 1;
        if (mission.destination === "Moon") {
            this.initialDistanceKm = 384400;
        } else if (mission.destination === "Mars") {
            this.initialDistanceKm = 225000000;
        } else {
            this.initialDistanceKm = 628000000;
        }
        this.distanceRemainingKm = this.initialDistanceKm;
        this.propellantKg = comps.propulsion.massKg * 0.65;
        this.deltaVRemainingMs = comps.propulsion.deltaVMs || 600;
        this.batteryCapacityWh = comps.battery.capacityWh || 1200;
        this.batteryCurrentWh = this.batteryCapacityWh;
        this.dataBufferMb = 0;
        this.maxBufferMb = comps.avionics.storageGb * 1024 || 16000;
        this.dataDownlinkedMb = 0;
        this.scienceScore = 0;
        this.healthPct = 100;
        this.powerMode = "cruise";

        // Initialize objective progress
        this.objectiveProgress = {};
        mission.scientificObjectives.forEach(obj => {
            this.objectiveProgress[obj.id] = 0;
        });

        // Initialize science target zones on planetary surface
        this.initScienceTargets(mission.destination);

        // Queue mission-specific crisis anomalies from EventsEngine
        const eventsList = EventsEngine.events[missionId] || [];
        this.anomalyQueue = eventsList.map((ev, idx) => ({
            ...ev,
            triggerOrbitAngle: (idx + 1) * (Math.PI * 1.8), // Trigger every ~0.9 orbit
            triggered: false
        }));
        this.activeAnomaly = null;
        this._missionCompletedTriggered = false;

        if (this.loopInterval) clearInterval(this.loopInterval);
        this.lastTimestamp = Date.now();
        this.loopInterval = setInterval(() => this.updateLoop(), 60);
    }

    stop() {
        this.isRunning = false;
        if (this.loopInterval) clearInterval(this.loopInterval);
    }

    setTimeWarp(speed) {
        this.timeWarp = speed;
        if (window.AudioFX) window.AudioFX.playClick();
    }

    initScienceTargets(destination) {
        if (destination === "Moon") {
            this.scienceTargets = [
                { id: "tgt_shackleton", name: "Shackleton Crater (PSR Cold Trap)", angle: Math.PI * 0.4, objectiveId: "lunar_obj_1", instReq: "radar", rewardPts: 30, dataYieldMb: 1200 },
                { id: "tgt_cabeus", name: "Cabeus Crater Volatile Deposit", angle: Math.PI * 1.1, objectiveId: "lunar_obj_1", instReq: "spectrometer", rewardPts: 35, dataYieldMb: 1600 },
                { id: "tgt_oceanus", name: "Basaltic Highlands & Pyroclastic Bed", angle: Math.PI * 1.7, objectiveId: "lunar_obj_2", instReq: "camera", rewardPts: 25, dataYieldMb: 2400 }
            ];
        } else if (destination === "Mars") {
            this.scienceTargets = [
                { id: "tgt_jezero", name: "Jezero Crater Paleolake Delta", angle: Math.PI * 0.35, objectiveId: "mars_obj_1", instReq: "spectrometer", rewardPts: 35, dataYieldMb: 1800 },
                { id: "tgt_valles", name: "Valles Marineris Sedimentary Strata", angle: Math.PI * 0.95, objectiveId: "mars_obj_3", instReq: "camera", rewardPts: 30, dataYieldMb: 2200 },
                { id: "tgt_polar", name: "Planum Australe CO2/Ice Cap", angle: Math.PI * 1.6, objectiveId: "mars_obj_2", instReq: "radar", rewardPts: 35, dataYieldMb: 1400 }
            ];
        } else {
            this.scienceTargets = [
                { id: "tgt_thrace", name: "Thrace Macula Active Cryo-Plume", angle: Math.PI * 0.3, objectiveId: "europa_obj_2", instReq: "spectrometer", rewardPts: 40, dataYieldMb: 2600 },
                { id: "tgt_conamara", name: "Conamara Chaos Rafted Ice Blocks", angle: Math.PI * 1.0, objectiveId: "europa_obj_1", instReq: "radar", rewardPts: 40, dataYieldMb: 2400 },
                { id: "tgt_saline", name: "Jovian Induced Magnetic Salinity Field", angle: Math.PI * 1.65, objectiveId: "europa_obj_3", instReq: "particle_detector", rewardPts: 30, dataYieldMb: 900 }
            ];
        }
    }

    updateLoop() {
        if (!this.isRunning || this.timeWarp === 0) return;

        const now = Date.now();
        const dt = (now - this.lastTimestamp) / 1000;
        this.lastTimestamp = now;

        const effectiveDt = dt * this.timeWarp;
        const comps = this.design.selectedComponents;
        const env = GAME_DATA.missions[this.missionId].env;

        // 0. Update Distance & Flight Phase
        if (this.flightPhase === 1) {
            const stepKm = (this.initialDistanceKm / 45) * effectiveDt;
            this.distanceRemainingKm = Math.max(this.initialDistanceKm * 0.4, this.distanceRemainingKm - stepKm);
            if (this.distanceRemainingKm <= this.initialDistanceKm * 0.45) {
                this.flightPhase = 2;
                this.postTelemetryLog("MID-COURSE CORRIDOR REACHED: Deep space trajectory nominal. Verification burn available.");
            }
        } else if (this.flightPhase === 2) {
            const stepKm = (this.initialDistanceKm / 60) * effectiveDt;
            this.distanceRemainingKm = Math.max(15000, this.distanceRemainingKm - stepKm);
            if (this.distanceRemainingKm <= 35000) {
                this.flightPhase = 3;
                const dest = GAME_DATA.missions[this.missionId].destination;
                this.postTelemetryLog(`PLANETARY ENCOUNTER: Entering ${dest} gravitational sphere. Execute orbital insertion burn.`);
            }
        } else if (this.flightPhase === 3) {
            this.distanceRemainingKm = Math.max(this.altitudeKm, this.distanceRemainingKm - (800 * effectiveDt));
            if (this.distanceRemainingKm <= this.altitudeKm + 50) {
                this.flightPhase = 4;
                this.postTelemetryLog(`ORBITAL INSERTION NOMINAL: Stable low parking orbit confirmed at ${this.altitudeKm} km altitude.`);
            }
        }

        // 1. Advance Orbital Motion
        const orbitalPeriodSec = 120; // Simulated orbit duration: 2 minutes
        const dAngle = (2 * Math.PI / orbitalPeriodSec) * effectiveDt;
        this.orbitAngle = (this.orbitAngle + dAngle) % (2 * Math.PI);

        // 2. Compute Environmental Lighting (Daylight vs Eclipse Shadow)
        // Eclipse occurs between 0.45*PI and 0.85*PI (behind the planet)
        this.isDaylight = !(this.orbitAngle >= Math.PI * 0.45 && this.orbitAngle <= Math.PI * 0.85);

        // 3. Compute Ground Station Contact Window (LOS vs LOS Occlusion)
        // Occultation behind planet occurs between 0.5*PI and 0.8*PI
        this.isGroundContact = !(this.orbitAngle >= Math.PI * 0.5 && this.orbitAngle <= Math.PI * 0.8);

        // 4. Power Balance Calculation
        let powerGenerationW = 0;
        if (comps.powerGen.type === "solar") {
            if (this.isDaylight) {
                powerGenerationW = comps.powerGen.basePowerW * (env.solarFluxScale || 1.0);
            }
        } else {
            // Nuclear MMRTG generates power day and night
            powerGenerationW = comps.powerGen.basePowerW;
        }

        // Consumption based on power mode
        let powerConsumptionW = comps.avionics.powerW + comps.thermal.powerW;
        if (this.powerMode === "science") {
            powerConsumptionW += comps.instruments.reduce((sum, i) => sum + i.powerW, 0) + (comps.comms.powerW * 0.8);
        } else if (this.powerMode === "cruise") {
            powerConsumptionW += (comps.comms.powerW * 0.3);
        } else {
            // Safe mode: minimum housekeeping
            powerConsumptionW = Math.max(15, powerConsumptionW * 0.5);
        }

        const netPowerW = powerGenerationW - powerConsumptionW;
        const energyDeltaWh = (netPowerW * effectiveDt) / 3600.0;
        this.batteryCurrentWh = Math.max(0, Math.min(this.batteryCapacityWh, this.batteryCurrentWh + energyDeltaWh));

        // Battery brownout warning & damage
        if (this.batteryCurrentWh <= 0) {
            this.healthPct = Math.max(10, this.healthPct - (0.5 * effectiveDt));
        }

        // 5. Detect Science Target in Sensor Cone
        this.activeTargetInSight = null;
        for (const tgt of this.scienceTargets) {
            const angleDiff = Math.abs(this.orbitAngle - tgt.angle);
            if (angleDiff < 0.25 || angleDiff > (Math.PI * 2 - 0.25)) {
                this.activeTargetInSight = tgt;
                break;
            }
        }

        // 6. Check for Anomaly Triggers
        if (!this.activeAnomaly) {
            for (const anom of this.anomalyQueue) {
                if (!anom.triggered && this.orbitAngle >= (anom.triggerOrbitAngle % (Math.PI * 2))) {
                    anom.triggered = true;
                    this.triggerAnomaly(anom);
                    break;
                }
            }
        }

        // 7. Render Updates
        this.updateHUD(powerGenerationW, powerConsumptionW, netPowerW);

        // 8. Automatic Continuous Mission Win & Loss Evaluation (No manual finalize button required)
        if (!this._missionCompletedTriggered && this.flightPhase === 4) {
            const mission = GAME_DATA.missions[this.missionId];
            const allObjectivesCompleted = mission.scientificObjectives.every(
                obj => (this.objectiveProgress[obj.id] || 0) >= 80
            );

            // Win condition: All scientific objectives fulfilled & telemetry downlinked (or high science yield achieved)
            if ((allObjectivesCompleted && this.dataDownlinkedMb > 800) || this.scienceScore >= 75) {
                this._missionCompletedTriggered = true;
                this.postTelemetryLog("🌟 MISSION OBJECTIVES ACHIEVED: All primary scientific exploration milestones complete. Telemetry archived.");
                this.postTelemetryLog("COMMENCING AUTOMATIC TRANSITION TO MISSION DEBRIEF...");
                if (window.AudioFX) window.AudioFX.playSuccess();
                setTimeout(() => {
                    if (this.ui && typeof this.ui.showScreen === 'function') {
                        this.ui.showScreen("debrief");
                    }
                }, 2800);
            }
        }

        // Loss condition: Vehicle destruction or critical unrecoverable failure
        if (!this._missionCompletedTriggered && (this.healthPct <= 0 || (this.batteryCurrentWh <= 0 && this.isDaylight === false && this.healthPct < 15))) {
            this._missionCompletedTriggered = true;
            this.postTelemetryLog("🚨 CRITICAL MISSION LOSS: Spacecraft structural integrity compromised. Vehicle lost.");
            this.postTelemetryLog("COMMENCING MISSION FAILURE INQUEST...");
            if (window.AudioFX) window.AudioFX.playFailure();
            setTimeout(() => {
                if (this.ui && typeof this.ui.showScreen === 'function') {
                    this.ui.showScreen("debrief");
                }
            }, 2500);
        }
    }

    triggerAnomaly(anom) {
        this.activeAnomaly = anom;
        this.timeWarp = 1; // Drop to real-time for anomaly response
        if (window.AudioFX) window.AudioFX.playAlert();
        this.renderAnomalyModal(anom);
    }

    resolveAnomalyChoice(choiceIdx) {
        if (!this.activeAnomaly) return;
        const anom = this.activeAnomaly;
        const choice = anom.choices[choiceIdx];

        // Apply choice using EventsEngine
        const simStateWrapper = {
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
            simStateWrapper,
            this.design
        );

        this.healthPct = result.simState.healthPct;
        this.scienceScore = result.simState.sciencePoints;
        this.ui.simState.log = result.simState.log;

        if (window.AudioFX) window.AudioFX.playClick();
        this.activeAnomaly = null;

        // Hide anomaly modal
        const modal = document.getElementById("anomaly-modal-container");
        if (modal) modal.style.display = "none";

        this.renderFlightLog();
    }

    // --- PLAYER COMMAND INTERACTIONS ---

    executeScan() {
        if (!this.isRunning) return;
        const comps = this.design.selectedComponents;
        const insts = comps.instruments;

        if (insts.length === 0) {
            this.postTelemetryLog("SCAN ABORTED: No scientific payloads installed on spacecraft.");
            if (window.AudioFX) window.AudioFX.playAlert();
            return;
        }

        if (this.batteryCurrentWh < 40 && this.isDaylight === false) {
            this.postTelemetryLog("POWER REJECT: Insufficient battery reserve for sensor activation in eclipse.");
            if (window.AudioFX) window.AudioFX.playAlert();
            return;
        }

        // Activate sensor visuals
        if (window.spaceRenderer) {
            window.spaceRenderer.setScanning(true);
            setTimeout(() => window.spaceRenderer.setScanning(false), 800);
        }

        if (window.AudioFX) window.AudioFX.playScan();

        if (this.activeTargetInSight) {
            const tgt = this.activeTargetInSight;
            const hasRequiredInst = insts.some(i => i.id === tgt.instReq);
            const yieldMb = hasRequiredInst ? tgt.dataYieldMb : tgt.dataYieldMb * 0.4;
            const pts = hasRequiredInst ? tgt.rewardPts : tgt.rewardPts * 0.3;

            // Buffer data
            const availableBuffer = this.maxBufferMb - this.dataBufferMb;
            const storedMb = Math.min(availableBuffer, yieldMb);
            this.dataBufferMb += storedMb;

            // Increment objective progress
            this.objectiveProgress[tgt.objectiveId] = Math.min(100, (this.objectiveProgress[tgt.objectiveId] || 0) + 40);

            if (hasRequiredInst) {
                this.postTelemetryLog(`SCAN ACQUIRED [${tgt.name}]: +${storedMb} MB telemetry buffered. Target objective at ${this.objectiveProgress[tgt.objectiveId]}%.`);
                if (window.AudioFX) window.AudioFX.playSuccess();
            } else {
                this.postTelemetryLog(`SUBOPTIMAL SCAN [${tgt.name}]: Missing dedicated ${tgt.instReq}. Low-fidelity data (+${storedMb} MB) buffered.`);
            }

            if (storedMb < yieldMb) {
                this.postTelemetryLog("MEMORY OVERFLOW WARNING: Onboard solid-state buffer full! Downlink required.");
                if (window.AudioFX) window.AudioFX.playAlert();
            }
        } else {
            // General orbital background survey
            const generalYield = 300;
            const stored = Math.min(this.maxBufferMb - this.dataBufferMb, generalYield);
            this.dataBufferMb += stored;
            this.postTelemetryLog(`BACKGROUND SCAN: Global baseline topography recorded (+${stored} MB).`);
        }
    }

    executeDownlink() {
        if (!this.isRunning) return;
        if (!this.isGroundContact) {
            this.postTelemetryLog("DOWNLINK BLOCKED: Radio line-of-sight occulted by planetary body.");
            if (window.AudioFX) window.AudioFX.playAlert();
            return;
        }

        if (this.dataBufferMb <= 0) {
            this.postTelemetryLog("DOWNLINK IDLE: Onboard buffer empty. No un-downlinked telemetry to transmit.");
            return;
        }

        const comps = this.design.selectedComponents;
        const ground = comps.groundSegment;
        const comm = comps.comms;

        // Visual beam
        if (window.spaceRenderer) {
            window.spaceRenderer.setDownlink(true);
            setTimeout(() => window.spaceRenderer.setDownlink(false), 900);
        }

        if (window.AudioFX) window.AudioFX.playDownlink();

        // Calculate packet transmission chunk
        const rateChunk = Math.min(this.dataBufferMb, (comm.maxDataRateMbDay * ground.downlinkEfficiency) / 8);
        this.dataBufferMb -= rateChunk;
        this.dataDownlinkedMb += rateChunk;

        // Convert delivered data to Science Score
        const earnedPts = Math.round((rateChunk / 200.0) * comps.userSegment.scienceMultiplier);
        this.scienceScore += earnedPts;

        this.postTelemetryLog(`DOWNLINK CONFIRMED [${ground.name}]: -${Math.round(rateChunk)} MB transmitted. +${earnedPts} Science Points archived at User Segment.`);
        if (window.AudioFX) window.AudioFX.playSuccess();
    }

    executeBurn() {
        if (!this.isRunning) return;
        if (this.propellantKg <= 5) {
            this.postTelemetryLog("PROPULSION ABORT: Propellant reserves depleted (<5 kg). Reaction thrusters empty.");
            if (window.AudioFX) window.AudioFX.playAlert();
            return;
        }

        const comps = this.design.selectedComponents;
        this.propellantKg -= 15;
        this.deltaVRemainingMs = Math.max(0, this.deltaVRemainingMs - 75);

        // Visual thruster plume
        if (window.spaceRenderer) {
            window.spaceRenderer.setThruster(true);
            setTimeout(() => window.spaceRenderer.setThruster(false), 1200);
        }

        if (window.AudioFX) window.AudioFX.playLaunch();

        const dest = GAME_DATA.missions[this.missionId].destination;
        if (this.flightPhase === 2) {
            this.flightPhase = 3;
            this.distanceRemainingKm = Math.min(this.distanceRemainingKm, 30000);
            this.postTelemetryLog(`TRAJECTORY BURN EXECUTED [${comps.propulsion.name}]: Mid-course corridor locked. En route to terminal arrival.`);
        } else if (this.flightPhase === 3) {
            this.flightPhase = 4;
            this.distanceRemainingKm = this.altitudeKm;
            this.postTelemetryLog(`ORBITAL INSERTION BURN COMPLETE [${comps.propulsion.name}]: Retrograde burn captured into ${dest} orbit.`);
        } else {
            this.altitudeKm = Math.max(40, this.altitudeKm - 25);
            this.postTelemetryLog(`TRAJECTORY BURN EXECUTED [${comps.propulsion.name}]: Orbit trimmed to ${this.altitudeKm} km altitude. ΔV remaining: ${this.deltaVRemainingMs} m/s.`);
        }
    }

    setPowerMode(mode) {
        this.powerMode = mode;
        if (window.AudioFX) window.AudioFX.playClick();
        this.postTelemetryLog(`POWER CONFIGURATION: Switched to [${mode.toUpperCase()} MODE].`);
    }

    postTelemetryLog(msg) {
        const logFeed = document.getElementById("flight-log-feed");
        if (!logFeed) return;

        const timeStr = new Date().toLocaleTimeString();
        const entry = document.createElement("div");
        entry.className = "log-entry";
        entry.innerHTML = `<span style="color:#43D9FF; font-family:'Rajdhani', sans-serif;">[${timeStr}]</span> <span style="color:#E0E8F5;">${msg}</span>`;
        logFeed.insertBefore(entry, logFeed.firstChild);

        // Keep last 30 logs in UI controller for debrief
        if (!this.ui.simState.log) this.ui.simState.log = [];
        this.ui.simState.log.push({
            phase: `Orbit ${((this.orbitAngle / (Math.PI * 2)) + 1).toFixed(1)}`,
            eventTitle: "Flight Operation",
            choiceText: msg,
            consequence: "Telemetry recorded"
        });
    }

    renderFlightLog() {
        // Refresh flight log feed if necessary
    }

    updateHUD(powerGenW, powerConsW, netPowerW) {
        // Battery % & HUD Bar
        const batPct = Math.round((this.batteryCurrentWh / this.batteryCapacityWh) * 100);
        const batEl = document.getElementById("hud-power-val");
        const batBar = document.getElementById("hud-power-bar");
        if (batEl) {
            batEl.textContent = `${batPct}%`;
            batEl.style.color = batPct > 60 ? "var(--accent-cyan)" : (batPct > 25 ? "var(--accent-amber)" : "var(--accent-red)");
        }
        if (batBar) batBar.style.width = `${batPct}%`;

        // Health % & HUD Bar
        const healthEl = document.getElementById("hud-health-val");
        const healthBar = document.getElementById("hud-health-bar");
        const healthRound = Math.round(this.healthPct);
        if (healthEl) {
            healthEl.textContent = `${healthRound}%`;
            healthEl.style.color = healthRound > 70 ? "var(--accent-green)" : (healthRound > 40 ? "var(--accent-amber)" : "var(--accent-red)");
        }
        if (healthBar) healthBar.style.width = `${healthRound}%`;

        // Buffer MB
        const bufEl = document.getElementById("hud-datacol-val");
        if (bufEl) {
            bufEl.textContent = `${Math.round(this.dataBufferMb)} / ${this.maxBufferMb} MB`;
        }

        // Downlinked MB
        const downEl = document.getElementById("hud-datatx-val");
        if (downEl) downEl.textContent = `${Math.round(this.dataDownlinkedMb)} MB`;

        // Science Score
        const sciEl = document.getElementById("hud-science-val");
        if (sciEl) sciEl.textContent = `${this.scienceScore}`;

        // Fuel reserve readout & HUD Bar
        const fuelEl = document.getElementById("hud-fuel-val");
        const fuelBar = document.getElementById("hud-fuel-bar");
        const fuelPct = Math.min(100, Math.round((this.propellantKg / 120) * 100));
        if (fuelEl) fuelEl.textContent = `${fuelPct}% (${Math.round(this.propellantKg)} kg)`;
        if (fuelBar) fuelBar.style.width = `${fuelPct}%`;

        // Target In Sight Indicator & Discovery Banner
        const discText = document.getElementById("discovery-text");
        if (discText) {
            if (this.activeTargetInSight) {
                discText.innerHTML = `<strong>TARGET IN SENSOR CONE:</strong> ${this.activeTargetInSight.name} — Surface scan available!`;
            } else {
                const dest = GAME_DATA.missions[this.missionId].destination;
                discText.innerHTML = `<strong>ORBITAL RECONNAISSANCE:</strong> Tracking ${dest} horizon · ${this.isDaylight ? 'Sunlit pass' : 'Eclipse shadow'}`;
            }
        }

        const tgtBadge = document.getElementById("target-sensor-badge");
        if (tgtBadge) {
            if (this.activeTargetInSight) {
                tgtBadge.style.display = "inline-flex";
                tgtBadge.textContent = `🎯 TARGET IN CONE: ${this.activeTargetInSight.name}`;
                tgtBadge.className = "badge badge-ready glow-cyan-pulse";
            } else {
                tgtBadge.style.display = "none";
            }
        }

        // Distance readout & Phase Subtitle
        const distEl = document.getElementById("mission-distance-val");
        if (distEl) {
            if (this.flightPhase >= 4) {
                distEl.textContent = `${Math.round(this.altitudeKm)} km (Orbit)`;
            } else {
                distEl.textContent = `${Math.round(this.distanceRemainingKm).toLocaleString()} km`;
            }
        }

        const phaseSub = document.getElementById("sim-phase-sub");
        if (phaseSub) {
            const phaseNames = {
                1: "Phase 1/4: Trans-Planetary Cruise & Distance Countdown",
                2: "Phase 2/4: Mid-Course Cruise & Trajectory Verification",
                3: "Phase 3/4: Planetary Arrival & Orbital Insertion Burn",
                4: "Phase 4/4: Low-Orbit Scientific Reconnaissance"
            };
            phaseSub.textContent = phaseNames[this.flightPhase] || "Phase: Orbital Reconnaissance";
        }

        // Draw orbital flight deck with surface viewfinder
        if (window.spaceRenderer) {
            window.spaceRenderer.drawFlightDeckRadar(
                "flight-deck-radar-canvas",
                GAME_DATA.missions[this.missionId].destination,
                this.orbitAngle,
                this.altitudeKm,
                this.isDaylight,
                this.isGroundContact,
                this.activeTargetInSight,
                this.flightPhase
            );
        }

        // Sync back to UI state for debrief screen
        this.ui.simState.healthPct = this.healthPct;
        this.ui.simState.powerPct = batPct;
        this.ui.simState.dataCollectedMb = this.dataDownlinkedMb + this.dataBufferMb;
        this.ui.simState.dataTransmittedMb = this.dataDownlinkedMb;
        this.ui.simState.sciencePoints = this.scienceScore;
    }

    renderAnomalyModal(anom) {
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
                    <span class="badge badge-blocked glow-red-pulse">CRITICAL EVENT</span>
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
                        <button class="choice-btn" onclick="window.flightSimulator.resolveAnomalyChoice(${idx})">
                            <div class="choice-btn-title">OPTION ${String.fromCharCode(65 + idx)}: ${c.text}</div>
                            <div class="choice-btn-desc">${c.explanation}</div>
                        </button>
                    `).join("")}
                </div>
            </div>
        `;
    }
}

window.FlightSimulator = FlightSimulator;

