/**
 * GAME ENGINE & SYSTEMS EVALUATION
 * =================================
 * BEYOND THE ORBIT - Space Mission Design Game
 * Team Orbitera | NASA Space Apps Challenge 2026
 * 
 * Implements identical calculations and margin validations
 * as the verified Python backend modules.
 */

const GameEngine = {
    calculateMissionDesign(missionId, config) {
        const mission = GAME_DATA.missions[missionId] || GAME_DATA.missions["lunar_explorer"];
        const destName = mission.destination;
        const env = mission.env;

        // Resolve hardware components
        const lv = GAME_DATA.launchVehicles[config.launchVehicle || "lv_medium"] || GAME_DATA.launchVehicles["lv_medium"];
        const struct = GAME_DATA.structures[config.structure || "struct_aluminum"] || GAME_DATA.structures["struct_aluminum"];
        const pwrGen = GAME_DATA.powerGenerations[config.powerGen || "pwr_silicon"] || GAME_DATA.powerGenerations["pwr_silicon"];
        const bat = GAME_DATA.batteries[config.battery || "bat_li_ion"] || GAME_DATA.batteries["bat_li_ion"];
        const comm = GAME_DATA.communications[config.comms || "comm_x_band"] || GAME_DATA.communications["comm_x_band"];
        const av = GAME_DATA.avionics[config.avionics || "av_rad750"] || GAME_DATA.avionics["av_rad750"];
        const prop = GAME_DATA.propulsions[config.propulsion || "prop_monoprop"] || GAME_DATA.propulsions["prop_monoprop"];
        const thermal = GAME_DATA.thermals[config.thermal || "thm_active"] || GAME_DATA.thermals["thm_active"];
        const ground = GAME_DATA.groundSegments[config.groundSegment || "ground_nsn"] || GAME_DATA.groundSegments["ground_nsn"];
        const userSeg = GAME_DATA.userSegments[config.userSegment || "user_multicenter"] || GAME_DATA.userSegments["user_multicenter"];

        // Resolve architecture
        let arch = mission.architectures.find(a => a.id === config.architecture);
        if (!arch) arch = mission.architectures[0];

        // Resolve instruments
        const selectedInstIds = config.instruments || [];
        const instruments = selectedInstIds
            .map(id => GAME_DATA.instruments[id])
            .filter(Boolean);

        // 1. Total Mass Calculation (kg)
        const subsystemsMass = struct.massKg + pwrGen.massKg + bat.massKg + comm.massKg + av.massKg + prop.massKg + thermal.massKg;
        const instrumentsMass = instruments.reduce((sum, inst) => sum + inst.massKg, 0);
        const archMass = arch.complexityMass || 0.0;
        const totalSpacecraftMass = Number((subsystemsMass + instrumentsMass + archMass).toFixed(1));

        const lvMaxPayload = lv.maxPayloadKg[destName] || 1000.0;
        const massMarginKg = Number((lvMaxPayload - totalSpacecraftMass).toFixed(1));
        const massMarginPct = Number(((massMarginKg / lvMaxPayload) * 100.0).toFixed(1));

        // 2. Total Cost Calculation ($M)
        const subsystemsCost = struct.costMillion + pwrGen.costMillion + bat.costMillion + comm.costMillion + av.costMillion + prop.costMillion + thermal.costMillion;
        const instrumentsCost = instruments.reduce((sum, inst) => sum + inst.costMillion, 0);
        const totalMissionCost = Number((lv.costMillion + (arch.complexityCost || 0.0) + subsystemsCost + instrumentsCost + ground.costMillion + userSeg.costMillion).toFixed(1));
        const budgetAllocated = mission.budgetMillion;
        const budgetMarginMillion = Number((budgetAllocated - totalMissionCost).toFixed(1));
        const budgetMarginPct = Number(((budgetMarginMillion / budgetAllocated) * 100.0).toFixed(1));

        // 3. Power Balance (Watts)
        let powerGenW = 0.0;
        if (pwrGen.type === "solar") {
            const scale = env.solarFluxScale || 1.0;
            powerGenW = Number((pwrGen.basePowerW * scale).toFixed(1));
        } else {
            powerGenW = Number(pwrGen.basePowerW.toFixed(1));
        }

        const busConsumptionW = (comm.powerW * 0.45) + av.powerW + (prop.powerW * 0.25) + thermal.powerW;
        const instConsumptionW = instruments.reduce((sum, inst) => sum + inst.powerW, 0);
        const totalPowerConsumptionW = Number((busConsumptionW + instConsumptionW).toFixed(1));
        const powerBalanceW = Number((powerGenW - totalPowerConsumptionW).toFixed(1));

        const darknessSurvivalHours = Number((bat.capacityWh / Math.max(totalPowerConsumptionW, 10.0)).toFixed(1));

        // 4. Data Generation vs Downlink Bandwidth (MB / Day)
        const dailyDataGeneratedMb = instruments.reduce((sum, inst) => sum + inst.dataRateMbDay, 0);
        const distAttenuation = destName === "Moon" ? 1.0 : (destName === "Mars" ? 0.75 : 0.40);
        const dailyDownlinkCapacityMb = Number((
            comm.maxDataRateMbDay *
            (ground.contactHoursDay / 24.0) *
            ground.downlinkEfficiency *
            distAttenuation *
            ((arch.commWindowPct || 85) / 100.0)
        ).toFixed(1));
        const dataBalanceMb = Number((dailyDownlinkCapacityMb - dailyDataGeneratedMb).toFixed(1));

        // 5. Composite Reliability (%)
        const baseRel = (
            struct.reliability *
            pwrGen.reliability *
            bat.reliability *
            comm.reliability *
            av.reliability *
            prop.reliability *
            thermal.reliability *
            ground.reliability
        );

        let radPen = 1.0;
        if (destName === "Europa") {
            if (struct.radShielding < 2.0) radPen = 0.65;
            else if (struct.radShielding < 3.5) radPen = 0.88;
            else radPen = 0.98;
        } else if (destName === "Mars") {
            if (struct.radShielding < 1.1) radPen = 0.90;
        }
        const compositeReliabilityPct = Number((baseRel * radPen * 100.0).toFixed(1));

        // 6. Science Yield Potential
        const rawScienceScore = instruments.reduce((sum, inst) => sum + inst.scienceVal, 0);
        const scienceMultiplier = (arch.scienceMultiplier || 1.0) * (userSeg.scienceMultiplier || 1.0);
        const projectedScienceYield = Number((rawScienceScore * scienceMultiplier).toFixed(1));

        // 7. Validation Rules (Blockers, Warnings, Confirmations)
        const blockers = [];
        const warnings = [];
        const confirmations = [];

        // Mass checks
        if (totalSpacecraftMass > lvMaxPayload) {
            blockers.push(`Launch Overload: Spacecraft mass (${totalSpacecraftMass} kg) exceeds ${lv.name} limit (${lvMaxPayload} kg) for ${destName}.`);
        } else if (massMarginPct < 15.0) {
            warnings.push(`Tight Mass Margin: Margin is ${massMarginPct}% (${massMarginKg} kg). NASA Systems Engineering standard recommends 15–20% contingency margin.`);
        } else {
            confirmations.push(`Mass Envelope Verified: ${massMarginKg} kg remaining (${massMarginPct}% margin).`);
        }

        // Budget checks
        if (totalMissionCost > budgetAllocated) {
            blockers.push(`Budget Breach: Total cost ($${totalMissionCost}M) exceeds the $${budgetAllocated}M allocated budget by $${Math.abs(budgetMarginMillion)}M.`);
        } else if (budgetMarginPct < 5.0) {
            warnings.push(`Low Financial Reserve: Budget margin is only $${budgetMarginMillion}M (${budgetMarginPct}%). Delays or anomalies risk fiscal cancellation.`);
        } else {
            confirmations.push(`Fiscal Plan Approved: $${budgetMarginMillion}M reserve remaining (${budgetMarginPct}%).`);
        }

        // Instrument checks
        if (instruments.length === 0) {
            blockers.push("No Scientific Instruments: Cannot launch an exploration science mission with zero payload.");
        } else {
            confirmations.push(`Payload Active: ${instruments.length} scientific instruments installed.`);
        }

        // Power Physics checks
        if (destName === "Europa" && pwrGen.type === "solar" && pwrGen.id === "pwr_silicon") {
            blockers.push(`Fatal Power Starvation: Standard silicon solar panels generate only ${powerGenW} W at Jupiter/Europa due to 1/r² decay. MMRTG nuclear power or massive UltraFlex arrays required.`);
        } else if (powerGenW < (busConsumptionW * 0.75)) {
            blockers.push(`Severe Bus Power Deficit: Generation (${powerGenW} W) cannot sustain baseline housekeeping bus load (${busConsumptionW.toFixed(0)} W). Brownout will occur.`);
        } else if (powerBalanceW < 0.0) {
            warnings.push(`Negative Continuous Power Balance: Full simultaneous operation of all payloads requires ${totalPowerConsumptionW} W, exceeding continuous generation (${powerGenW} W). Instruments must be duty-cycled and backed by battery.`);
        } else {
            confirmations.push(`Power Positive: Net surplus of +${powerBalanceW} W during nominal operations.`);
        }

        // Ground station compatibility
        if (destName === "Europa" && ground.id === "ground_university") {
            blockers.push("Telecommunications Loss: University ground station lacks the RF aperture sensitivity to receive faint signals across 628M km. NASA DSN 34m or 70m required.");
        } else if (destName === "Mars" && ground.id === "ground_university") {
            warnings.push("Severe Downlink Bottleneck: University station provides only 4h/day contact. Ground tracking handover is strongly recommended.");
        }

        // Data link balance
        if (dailyDataGeneratedMb > dailyDownlinkCapacityMb) {
            warnings.push(`Data Downlink Lag: Instruments generate ${dailyDataGeneratedMb} MB/day, exceeding downlink capability (${dailyDownlinkCapacityMb} MB/day). Buffer will fill up unless higher-gain comms or DSN is selected.`);
        } else {
            confirmations.push(`Data Highway Clear: Downlink throughput (${dailyDownlinkCapacityMb} MB/day) exceeds science generation (${dailyDataGeneratedMb} MB/day).`);
        }

        // Radiation vulnerability
        if (destName === "Europa" && struct.id !== "struct_vault") {
            warnings.push("Radiation Vulnerability: Europa resides in Jupiter's lethal radiation belt (~5,400 mSv/day). Without the Titanium Vault, rapid degradation occurs.");
        }

        let validationStatus = "READY FOR LAUNCH";
        if (blockers.length > 0) validationStatus = "LAUNCH BLOCKED";
        else if (warnings.length > 0) validationStatus = "NEEDS ATTENTION";

        return {
            validationStatus,
            blockers,
            warnings,
            confirmations,
            totalMassKg: totalSpacecraftMass,
            lvMaxPayloadKg: lvMaxPayload,
            massMarginKg,
            massMarginPct,
            totalCostMillion: totalMissionCost,
            budgetMillion: budgetAllocated,
            budgetMarginMillion,
            budgetMarginPct,
            powerGenerationW: powerGenW,
            powerConsumptionW: totalPowerConsumptionW,
            powerBalanceW,
            darknessSurvivalHours,
            dailyDataGeneratedMb,
            dailyDownlinkCapacityMb,
            dataBalanceMb,
            compositeReliabilityPct,
            projectedScienceYield,
            selectedComponents: {
                launchVehicle: lv,
                architecture: arch,
                structure: struct,
                powerGen: pwrGen,
                battery: bat,
                comms: comm,
                avionics: av,
                propulsion: prop,
                thermal,
                instruments,
                groundSegment: ground,
                userSegment: userSeg
            }
        };
    },

    evaluateMission(missionId, designCalc, simState) {
        const mission = GAME_DATA.missions[missionId] || GAME_DATA.missions["lunar_explorer"];
        const comps = designCalc.selectedComponents;

        // 1. Scientific Achievement (0-25)
        const selectedInstIds = new Set(comps.instruments.map(i => i.id));
        const matchedObjectives = [];
        let totalObjPoints = 0;
        let earnedObjPoints = 0;

        mission.scientificObjectives.forEach(obj => {
            totalObjPoints += obj.points;
            const reqs = obj.instrumentReq;
            const matchCount = reqs.filter(r => selectedInstIds.has(r)).length;
            if (matchCount === reqs.length) {
                earnedObjPoints += obj.points;
                matchedObjectives.push({ title: obj.title, status: "Fully Achieved", pct: 100 });
            } else if (matchCount > 0) {
                earnedObjPoints += (obj.points * 0.6);
                matchedObjectives.push({ title: obj.title, status: "Partially Achieved", pct: 60 });
            } else {
                matchedObjectives.push({ title: obj.title, status: "Unfulfilled", pct: 0 });
            }
        });

        const objRatio = earnedObjPoints / Math.max(1.0, totalObjPoints);
        const flightScience = Math.min(simState.sciencePoints || 0, 120.0) / 120.0;
        const scienceScore = Number(Math.min(25.0, (objRatio * 15.0) + (flightScience * 10.0)).toFixed(1));

        // 2. Engineering Design & Margins (0-20)
        let massScore = 3.0;
        if (designCalc.massMarginPct >= 15.0) massScore = 7.0;
        else if (designCalc.massMarginPct >= 5.0) massScore = 5.0;
        else if (designCalc.massMarginPct >= 0.0) massScore = 3.0;
        else massScore = 0.0;

        let pwrScore = 3.0;
        if (designCalc.powerBalanceW >= 50.0) pwrScore = 7.0;
        else if (designCalc.powerBalanceW >= 0.0) pwrScore = 5.0;
        else if (designCalc.powerBalanceW >= -20.0) pwrScore = 3.0;
        else pwrScore = 1.0;

        let archScore = designCalc.validationStatus === "READY FOR LAUNCH" ? 6.0 : (designCalc.validationStatus === "NEEDS ATTENTION" ? 4.0 : 1.0);
        const engineeringScore = Number(Math.min(20.0, massScore + pwrScore + archScore).toFixed(1));

        // 3. Resource & Budget Efficiency (0-15)
        let budgetScore = 9.0;
        if (designCalc.budgetMarginPct >= 5.0 && designCalc.budgetMarginPct <= 25.0) budgetScore = 15.0;
        else if (designCalc.budgetMarginPct > 25.0) budgetScore = 12.0;
        else if (designCalc.budgetMarginPct >= 0.0) budgetScore = 9.0;
        else budgetScore = 2.0;
        const resourceScore = Number(budgetScore.toFixed(1));

        // 4. Spacecraft Reliability & Health (0-15)
        const finalHealth = simState.healthPct || 100.0;
        const baseReliability = designCalc.compositeReliabilityPct || 85.0;
        const relScore = (baseReliability / 100.0 * 6.0) + (finalHealth / 100.0 * 9.0);
        const reliabilityScore = Number(Math.min(15.0, relScore).toFixed(1));

        // 5. Communication & Data Delivery (0-15)
        const dataCol = Math.max(1.0, simState.dataCollectedMb || 100.0);
        const dataTx = simState.dataTransmittedMb || 50.0;
        const deliveryRatio = Math.min(1.0, dataTx / dataCol);

        let groundPts = 3.5;
        const destName = mission.destination;
        const groundId = comps.groundSegment.id;
        if (destName === "Europa") groundPts = groundId === "ground_dsn_70m" ? 5.0 : (groundId === "ground_dsn_34m" ? 3.5 : 1.0);
        else if (destName === "Mars") groundPts = (groundId === "ground_dsn_34m" || groundId === "ground_dsn_70m") ? 5.0 : 3.0;
        else groundPts = groundId !== "ground_university" ? 5.0 : 3.5;

        const dataScore = Number(Math.min(15.0, (deliveryRatio * 10.0) + groundPts).toFixed(1));

        // 6. Mission Operations & Decision-Making (0-10)
        let opsPts = 6.0;
        (simState.log || []).forEach(item => {
            const c = item.consequence || "";
            if (c.includes("SPECTACULAR") || c.includes("TRIUMPH") || c.includes("HISTORIC") || c.includes("MONUMENTAL") || c.includes("SUCCESS") || c.includes("GOLD STANDARD")) {
                opsPts += 1.2;
            } else if (c.includes("WARNING") || c.includes("CAUTION") || c.includes("BROWNOUT") || c.includes("DAMAGE")) {
                opsPts -= 0.8;
            }
        });
        const operationsScore = Number(Math.max(2.0, Math.min(10.0, opsPts)).toFixed(1));

        const totalScore = Number((scienceScore + engineeringScore + resourceScore + reliabilityScore + dataScore + operationsScore).toFixed(1));

        let outcome = "MISSION SUCCESS";
        let outcomeColor = "#43D9FF";
        let outcomeBadge = "★ OUTSTANDING MISSION SUCCESS ★";
        let summaryText = "The mission achieved exemplary scientific breakthroughs while maintaining stringent aerospace engineering margins and telemetry links. Your design choices provided the robustness necessary to overcome planetary hazards.";

        if (totalScore < 60.0) {
            outcome = "MISSION FAILURE";
            outcomeColor = "#FF5263";
            outcomeBadge = "✖ CRITICAL MISSION FAILURE ✖";
            summaryText = "The spacecraft succumbed to environmental hazards, power starvation, or telemetry loss. Critical mission objectives were left unfulfilled.";
        } else if (totalScore < 85.0) {
            outcome = "PARTIAL SUCCESS";
            outcomeColor = "#FFB547";
            outcomeBadge = "◆ QUALIFIED PARTIAL SUCCESS ◆";
            summaryText = "The mission returned valuable scientific data and demonstrated core capabilities, but encountered operational stress due to subsystem bottlenecks or resource constraints.";
        }

        const lessonsLearned = [];
        const suggestions = [];

        if (designCalc.massMarginPct < 15.0) {
            lessonsLearned.push(`Tight Mass Contingency (${designCalc.massMarginPct}%): NASA Systems Engineering Handbook recommends a 15–20% contingency margin during preliminary formulation.`);
            suggestions.push("Upgrade to a heavier launch vehicle class or select composite CFRP structures to restore mass margin.");
        }
        if (designCalc.powerBalanceW < 0.0) {
            lessonsLearned.push("Power Deficit: Negative power balance forced frequent instrument duty-cycling and heavy battery depth of discharge.");
            suggestions.push("Equip high-efficiency UltraFlex GaAs arrays or MMRTG nuclear power.");
        }
        if (destName === "Europa" && comps.structure.id !== "struct_vault") {
            lessonsLearned.push("Jovian Radiation Penetration: Unshielded structural buses allow high-energy electrons to induce ionizing doses on avionics.");
            suggestions.push("Always equip deep Jovian missions with a Radiation-Hardened Titanium Vault.");
        }
        if (deliveryRatio < 0.75) {
            lessonsLearned.push(`Data Downlink Lag (${(deliveryRatio * 100).toFixed(0)}% delivered): Payload generated more data than the ground network could receive.`);
            suggestions.push("Upgrade to NASA Deep Space Network 70m antenna support or select high-gain Ka-band / Optical communications.");
        }
        if (lessonsLearned.length === 0) {
            lessonsLearned.push("Balanced Architecture: All subsystems demonstrated healthy synergy. Mass, power, and communication links remained in equilibrium throughout flight.");
            suggestions.push("Challenge yourself by tackling the Europa Frontier mission or reducing launch vehicle costs.");
        }

        return {
            totalScore,
            outcome,
            outcomeColor,
            outcomeBadge,
            summaryText,
            categories: {
                scientificAchievement: { name: "Scientific Achievement", score: scienceScore, max: 25.0, pct: ((scienceScore / 25.0) * 100).toFixed(0) },
                engineeringDesign: { name: "Engineering Design & Margins", score: engineeringScore, max: 20.0, pct: ((engineeringScore / 20.0) * 100).toFixed(0) },
                resourceEfficiency: { name: "Resource & Budget Efficiency", score: resourceScore, max: 15.0, pct: ((resourceScore / 15.0) * 100).toFixed(0) },
                spacecraftHealth: { name: "Spacecraft Reliability & Health", score: reliabilityScore, max: 15.0, pct: ((reliabilityScore / 15.0) * 100).toFixed(0) },
                communicationData: { name: "Communication & Data Delivery", score: dataScore, max: 15.0, pct: ((dataScore / 15.0) * 100).toFixed(0) },
                missionOperations: { name: "Operations & In-Flight Decisions", score: operationsScore, max: 10.0, pct: ((operationsScore / 10.0) * 100).toFixed(0) }
            },
            matchedObjectives,
            lessonsLearned,
            suggestions
        };
    }
};

if (typeof module !== "undefined") {
    module.exports = GameEngine;
}

