/**
 * EVENTS & IN-FLIGHT SIMULATION ENGINE
 * ====================================
 * BEYOND THE ORBIT - Space Mission Design Game
 * Team Orbitera | NASA Space Apps Challenge 2026
 * 
 * Destination-specific crisis events and branching choices
 * that dynamically interact with installed spacecraft hardware.
 */

const EventsEngine = {
    events: {
        "lunar_explorer": [
            {
                id: "lunar_evt_1",
                title: "Trans-Lunar Injection Burn Deviation",
                phase: "Trans-Lunar Injection (TLI)",
                description: "During upper-stage ignition toward the Moon, slight thrust vector oscillations introduce a 2.4 m/s velocity dispersion. A correction maneuver is necessary to prevent a lunar flyby overshoot.",
                nasaContext: "NASA Apollo and Artemis trajectories utilize Trajectory Correction Maneuvers (TCMs) to ensure precise insertion into lunar orbit.",
                choices: [
                    {
                        id: "c1",
                        text: "Execute immediate active RCS burn to trim trajectory",
                        explanation: "Consumes onboard fuel/power but restores nominal orbital trajectory.",
                        stat: "propulsion"
                    },
                    {
                        id: "c2",
                        text: "Coast and perform a combined insertion trim closer to the Moon",
                        explanation: "Conserves immediate fuel, but increases required delta-V later and risks navigational dispersion."
                    }
                ]
            },
            {
                id: "lunar_evt_2",
                title: "Descent into Polar Crater Shadow (Lunar Night)",
                phase: "Low Lunar Polar Orbit",
                description: "The spacecraft enters the deep shadow of Shackleton Crater at the Lunar South Pole. Solar panels stop producing electricity, and ambient temperatures plummet to -160°C.",
                nasaContext: "NASA Lunar Reconnaissance Orbiter (LRO) experiences periodic eclipses where instruments switch to low-power keep-alive modes to protect optics from freezing.",
                choices: [
                    {
                        id: "c1",
                        text: "Enter Safe Cold-Soak Mode (Shut down scientific instruments)",
                        explanation: "Protects battery reserves and thermal stability, but halts science observations during the pass."
                    },
                    {
                        id: "c2",
                        text: "Keep Subsurface Radar Active to Sound Frozen Shadowed Traps",
                        explanation: "Drains electrical storage, but yields invaluable subsurface water ice signatures."
                    }
                ]
            },
            {
                id: "lunar_evt_3",
                title: "Electrostatic Regolith Dust Levitating Over Terminator",
                phase: "Primary Mapping Survey",
                description: "Passing over the lunar day-night terminator, solar ultraviolet light charges fine sub-micron regolith particles, levitating dust clouds up to orbital altitude. Dust adhesion threatens camera lenses.",
                nasaContext: "Investigated by NASA LADEE, electrostatic dust lofting is a major operational hazard for lunar surface and orbital exploration.",
                choices: [
                    {
                        id: "c1",
                        text: "Rotate spacecraft 180° to keep optical apertures in the wake",
                        explanation: "Safeguards camera optics, but temporarily misaligns high-gain earth communication dish."
                    },
                    {
                        id: "c2",
                        text: "Activate electrostatic lens repeller rings at higher power",
                        explanation: "Maintains telescope orientation while consuming 35W extra electrical power."
                    }
                ]
            },
            {
                id: "lunar_evt_4",
                title: "Serendipitous Cabeus Crater Volatile Detection",
                phase: "Deep Science Phase",
                description: "The near-infrared spectrometer detects an anomalous hydroxyl/water absorption band (2.8 microns) in Cabeus Crater floor ejecta. A targeted second pass requires an orbital inclination adjustment.",
                nasaContext: "NASA LCROSS confirmed ~5.6% water ice in the Cabeus plume in 2009. High-resolution spectral verification remains top decadal priority.",
                choices: [
                    {
                        id: "c1",
                        text: "Burn propellant to lower orbit to 50 km for ultra-high-resolution scan",
                        explanation: "High fuel expenditure and increased gravitational perturbation risk, but doubles scientific discovery yield."
                    },
                    {
                        id: "c2",
                        text: "Maintain standard 100 km orbit and conduct multi-orbit cumulative integration",
                        explanation: "Low risk, zero extra fuel consumed, standard baseline science return."
                    }
                ]
            },
            {
                id: "lunar_evt_5",
                title: "Far-Side Occultation & Ground Contact Blackout",
                phase: "Extended Operations",
                description: "The spacecraft orbits behind the lunar far side. Direct radio line-of-sight to Earth is severed for 48 minutes. An unexpected gyroscopic telemetry anomaly occurs in reaction wheel #2.",
                nasaContext: "NASA Lunar Orbiters rely on autonomous fault protection software when occulted by the Moon without a relay satellite.",
                choices: [
                    {
                        id: "c1",
                        text: "Allow autonomous onboard flight software to reset wheel electronics",
                        explanation: "Relies on avionics reliability; fixes glitch before re-emerging on Earth-facing side."
                    },
                    {
                        id: "c2",
                        text: "Freeze attitude in drift mode and wait for Earth acquisition of signal (AOS)",
                        explanation: "Safe, but loses 48 minutes of science imaging and drifts slightly off target."
                    }
                ]
            }
        ],

        "mars_discovery": [
            {
                id: "mars_evt_1",
                title: "Interplanetary Coronal Mass Ejection (CME) Impact",
                phase: "Cruise Phase (0.8 AU to Mars)",
                description: "A powerful X-class solar flare triggers an intense proton storm across the inner solar system. The spacecraft is hit by high-energy galactic cosmic rays and solar energetic particles.",
                nasaContext: "The RAD instrument on NASA Curiosity proved that interplanetary transit exposes electronics to significant ionizing radiation doses.",
                choices: [
                    {
                        id: "c1",
                        text: "Re-orient bus so radiation vault/propellant tanks shield avionics",
                        explanation: "Shields critical processor cores; temporary loss of Earth communication link."
                    },
                    {
                        id: "c2",
                        text: "Keep scientific particle detector actively recording solar storm spectra",
                        explanation: "Gathers high-value space weather data, but risks single-event latchups on unshielded avionics."
                    }
                ]
            },
            {
                id: "mars_evt_2",
                title: "Mars Orbit Insertion (MOI) Main Engine Burn",
                phase: "Mars Orbit Insertion",
                description: "Approaching Mars at 5.7 km/s, the spacecraft must fire its propulsion system retrograde to enter Martian gravity capture. Speed-of-light delay to Earth is 14 minutes.",
                nasaContext: "NASA Mars missions (MRO, MAVEN, Mars Odyssey) undergo critical autonomous orbit insertion burns where ground teams watch delayed telemetry.",
                choices: [
                    {
                        id: "c1",
                        text: "Standard continuous retro-burn targeting 350 km circular science orbit",
                        explanation: "High propellant usage, but achieves optimal survey orbit immediately."
                    },
                    {
                        id: "c2",
                        text: "High elliptical capture orbit followed by multi-week Aerobraking",
                        explanation: "Conserves up to 40% propellant mass, but subjects spacecraft thermal blankets to atmospheric frictional heating."
                    }
                ]
            },
            {
                id: "mars_evt_3",
                title: "Global Martian Dust Storm (Tau > 3.5)",
                phase: "Primary Science Phase",
                description: "A massive regional dust storm merges into a global planet-encircling event. Atmospheric opacity (optical depth Tau) spikes to 3.5, reducing incoming solar irradiance by over 75% for 6 weeks.",
                nasaContext: "The 2018 global dust storm ended NASA's solar Opportunity rover, while nuclear-powered Curiosity continued operations uninterrupted.",
                choices: [
                    {
                        id: "c1",
                        text: "Power down all non-essential payloads into Low-Power Hibernation",
                        explanation: "Ensures spacecraft survival; pauses scientific data collection until skies clear."
                    },
                    {
                        id: "c2",
                        text: "Rely on power reserves and deploy Subsurface Radar (unaffected by dust)",
                        explanation: "If power/nuclear allows, continues subsurface science through the opaque storm."
                    }
                ]
            },
            {
                id: "mars_evt_4",
                title: "Methane Plume Detection & Solar Conjunction",
                phase: "Deep Science Phase",
                description: "The infrared spectrometer detects localized 12 ppb methane spikes emerging from Gale Crater fault zones. Meanwhile, Earth and Mars enter Solar Conjunction, where the Sun blocks radio signals.",
                nasaContext: "During NASA Mars Solar Conjunction (~every 26 months), solar plasma corrupts RF signals, forcing commands to be suspended and data stored onboard.",
                choices: [
                    {
                        id: "c1",
                        text: "Buffer all high-rate methane mapping data to onboard flash storage",
                        explanation: "Safeguards all observations; tests onboard memory capacity until conjunction ends."
                    },
                    {
                        id: "c2",
                        text: "Transmit real-time telemetry at emergency low baud rate via X-band",
                        explanation: "Risk of high packet loss and parity bit corruption due to solar corona interference."
                    }
                ]
            },
            {
                id: "mars_evt_5",
                title: "Ancient Delta Sediment Core Calibration",
                phase: "Extended Mission",
                description: "Orbital camera surveys reveal exposed phyllosilicates (clay minerals) at the base of an ancient alluvial fan. A specialized multi-angle hyperspectral imaging pass is requested.",
                nasaContext: "NASA's CRISM and HiRISE instruments on MRO revolutionized understanding of Mars's aqueous history by targeting hydrated minerals in river deltas.",
                choices: [
                    {
                        id: "c1",
                        text: "Perform dedicated roll maneuver and full multi-spectral spectral sweep",
                        explanation: "Produces premier scientific finding, consuming 60W power and 1.8 GB data."
                    },
                    {
                        id: "c2",
                        text: "Standard nadir-pointing imaging pass without roll maneuver",
                        explanation: "Lower resolution and mineral diagnostic fidelity, but zero pointing stress on reaction wheels."
                    }
                ]
            }
        ],

        "europa_frontier": [
            {
                id: "europa_evt_1",
                title: "Jupiter Magnetosphere Radiation Belt Ingress",
                phase: "Jovian System Arrival",
                description: "Entering the inner Jovian system, the spacecraft crosses the intense flux tube of Io and Europa. Radiation levels spike to 5,400 mSv/day—hundreds of times higher than Earth's Van Allen belts.",
                nasaContext: "NASA's Europa Clipper utilizes a specialized armored radiation vault with thick aluminum and tantalum walls to protect its electronic heart.",
                choices: [
                    {
                        id: "c1",
                        text: "Route all computational tasks into shielded radiation-hardened core",
                        explanation: "Protects processors from latchups; drops unneeded background tasks."
                    },
                    {
                        id: "c2",
                        text: "Keep magnetic particle detectors wide open to map Jovian flux lines",
                        explanation: "Spectacular scientific data return on radiation physics, but stresses unshielded electronic buses."
                    }
                ]
            },
            {
                id: "europa_evt_2",
                title: "Cryogenic Solar Starvation (-220°C Thermal Shock)",
                phase: "Europa Approach",
                description: "At 5.2 AU from the Sun, solar irradiance is only 50 W/m² (<4% of Earth sunlight). The shadow of Jupiter causes an eclipse lasting 3.2 hours. Internal thermal loop drops to -40°C.",
                nasaContext: "At Jupiter, solar arrays must span the size of basketball courts (as on Europa Clipper/Juno), or utilize Radioisotope Thermoelectric Generators (MMRTGs).",
                choices: [
                    {
                        id: "c1",
                        text: "Fire Radioisotope / Electrical survival heaters at maximum output",
                        explanation: "Prevents propellant freezing and keeps instruments warm, drawing heavy battery power unless nuclear."
                    },
                    {
                        id: "c2",
                        text: "Allow outer sensor bays to cold-soak while preserving core electronics",
                        explanation: "Conserves 50% battery energy, but risks calibration shift on optical sensors."
                    }
                ]
            },
            {
                id: "europa_evt_3",
                title: "Cryovolcanic Plume Eruption at Thrace Macula",
                phase: "Close Flyby (25 km Altitude)",
                description: "Real-time navigation cameras detect a 160-km-high vapor plume erupting through a chaos fracture in Europa's ice crust. Flying directly through the plume could sample subsurface ocean vapor.",
                nasaContext: "Hubble and Galileo observations suggested active plumes on Europa, offering a direct window into the subsurface ocean without drilling through 20 km of ice.",
                choices: [
                    {
                        id: "c1",
                        text: "Dip altitude to 25 km and fly through plume for in-situ mass spectrometry",
                        explanation: "High aerodynamic and ice-particle impact risk, but the ultimate scientific jackpot for prebiotic organics."
                    },
                    {
                        id: "c2",
                        text: "Observe plume remotely from 300 km altitude with infrared spectrometer",
                        explanation: "Zero impact risk; delivers safe spectral emission data."
                    }
                ]
            },
            {
                id: "europa_evt_4",
                title: "Deep Space Optical Communications (DSOC) Plasma Jitter",
                phase: "Interplanetary Downlink Phase",
                description: "With the spacecraft over 620 million kilometers away, the 42-minute one-way radio delay complicates communications. Dense Jovian plasma clouds cause refractive beam jitter on high-frequency signals.",
                nasaContext: "NASA DSN 70m dishes in California, Spain, and Australia utilize cryogenically cooled maser amplifiers and beam waveguides to resolve picowatt signals.",
                choices: [
                    {
                        id: "c1",
                        text: "Switch to Low-Frequency Robust X-Band Carrier with Forward Error Correction",
                        explanation: "Slow downlink data rate, but guarantees zero corrupted packets."
                    },
                    {
                        id: "c2",
                        text: "Request NASA DSN 70m Dish Arraying with High-Gain Ka-band burst",
                        explanation: "Maximizes science throughput, requiring premium DSN ground tracking lock."
                    }
                ]
            },
            {
                id: "europa_evt_5",
                title: "Planetary Protection End-of-Life Disposal",
                phase: "Mission Conclusion",
                description: "With propulsion fuel at 5%, the mission must execute planetary protection protocols. International COSPAR and NASA guidelines strictly prohibit accidentally contaminating Europa's ocean with terrestrial microbes.",
                nasaContext: "NASA Galileo and Cassini were intentionally de-orbited into the crushing atmospheres of Jupiter and Saturn to safeguard Europa and Enceladus.",
                choices: [
                    {
                        id: "c1",
                        text: "Execute Controlled De-orbit Burn into Jupiter's Giant Atmosphere",
                        explanation: "Complete spacecraft incineration. 100% planetary protection compliance; NASA gold-standard."
                    },
                    {
                        id: "c2",
                        text: "Boost into a stable High Jovian Graveyard Orbit",
                        explanation: "Preserves spacecraft intact for potential future relay, but carries small long-term resonance impact risk."
                    }
                ]
            }
        ]
    },

    applyChoice(missionId, eventIdx, choiceIdx, simState, designCalc) {
        const eventsList = this.events[missionId] || [];
        if (eventIdx >= eventsList.length) return { simState, consequence: "" };

        const event = eventsList[eventIdx];
        const choice = event.choices[choiceIdx];
        const comps = designCalc.selectedComponents;

        let health = simState.healthPct ?? 100.0;
        let power = simState.powerPct ?? 100.0;
        let dataCol = simState.dataCollectedMb ?? 0.0;
        let dataTx = simState.dataTransmittedMb ?? 0.0;
        let sciencePts = simState.sciencePoints ?? 0.0;
        const log = simState.log ? [...simState.log] : [];

        const hasMmrtg = comps.powerGen.id === "pwr_mmrtg" || comps.powerGen.id === "pwr_dual_mmrtg";
        const hasUltraFlex = comps.powerGen.id === "pwr_ultraflex";
        const hasVault = comps.structure.id === "struct_vault";
        const hasRad750 = comps.avionics.id === "av_rad750" || comps.avionics.id === "av_fault_tolerant";
        const hasKaOptical = comps.comms.id === "comm_ka_optical";
        const hasDsn = comps.groundSegment.id === "ground_dsn_34m" || comps.groundSegment.id === "ground_dsn_70m";
        const hasDsn70 = comps.groundSegment.id === "ground_dsn_70m";
        const hasIon = comps.propulsion.id === "prop_ion";
        const hasRadar = comps.instruments.some(i => i.id === "radar");
        const hasSpectrometer = comps.instruments.some(i => i.id === "spectrometer");
        const hasCamera = comps.instruments.some(i => i.id === "camera");

        let consequence = "";
        const cId = choice.id;

        // --- LUNAR EVENTS ---
        if (event.id === "lunar_evt_1") {
            if (cId === "c1") {
                power = Math.max(10, power - 5);
                health = Math.max(10, health - (hasIon ? 1 : 3));
                consequence = "RCS thrusters performed a precision trim burn. Nominal polar insertion trajectory restored with minimal propellant penalty.";
            } else {
                health = Math.max(10, health - 6);
                consequence = "Spacecraft coasted to perilune. Orbital insertion required 18% higher delta-V, stressing propulsion margins.";
            }
        } else if (event.id === "lunar_evt_2") {
            if (cId === "c1") {
                power = Math.max(10, power - 8);
                sciencePts += 10;
                consequence = "Safe cold-soak mode engaged. Batteries maintained steady 88% charge through 14-day darkness with zero thermal shock.";
            } else {
                if (hasMmrtg || comps.battery.id === "bat_solid_state") {
                    power = Math.max(10, power - 15);
                    sciencePts += 28;
                    dataCol += 1200;
                    consequence = "High-capacity power reserves sustained radar sounding in cold traps! Unprecedented water ice dielectric signatures recorded.";
                } else {
                    power = Math.max(5, power - 42);
                    health = Math.max(10, health - 12);
                    sciencePts += 15;
                    dataCol += 800;
                    consequence = "WARNING: Low-capacity battery drained severely during shadowed radar sounding. Emergency heater brownout caused slight thermal degradation.";
                }
            }
        } else if (event.id === "lunar_evt_3") {
            if (cId === "c1") {
                dataTx += 500;
                sciencePts += 12;
                consequence = "Spacecraft rotated into the solar wake. Optical lenses remained 100% dust-free. Earth communications resumed after terminator passage.";
            } else {
                power = Math.max(10, power - 8);
                if (hasCamera) {
                    sciencePts += 22;
                    dataCol += 1400;
                    consequence = "Electrostatic repeller rings deflected charged regolith particles. Continuous sub-meter imagery captured along terminator line.";
                } else {
                    sciencePts += 8;
                    consequence = "Repeller rings consumed power with no primary camera to benefit.";
                }
            }
        } else if (event.id === "lunar_evt_4") {
            if (cId === "c1") {
                health = Math.max(10, health - 4);
                if (hasSpectrometer) {
                    sciencePts += 35;
                    dataCol += 2100;
                    consequence = "SUCCESS: 50 km low-altitude pass pinpointed a 6.2% water ice signature in Cabeus Crater! Major scientific breakthrough.";
                } else {
                    sciencePts += 12;
                    consequence = "Low pass executed, but lack of a dedicated spectrometer limited diagnostic resolution.";
                }
            } else {
                sciencePts += 15;
                consequence = "Standard 100 km mapping preserved propellant reserves while gathering broad baseline survey data.";
            }
        } else if (event.id === "lunar_evt_5") {
            if (cId === "c1") {
                if (hasRad750) {
                    sciencePts += 18;
                    consequence = "Autonomous flight software flawlessly identified gyro glitch and rebooted reaction wheel channel. Full science acquisition maintained.";
                } else {
                    health = Math.max(10, health - 8);
                    consequence = "Autonomous reboot completed, but COTS avionics encountered a temporary watchdog timeout.";
                }
            } else {
                sciencePts += 5;
                consequence = "Spacecraft waited in passive drift until Earth AOS. Safe, but 48 minutes of prime imaging passes were lost.";
            }
        }

        // --- MARS EVENTS ---
        else if (event.id === "mars_evt_1") {
            if (cId === "c1") {
                health = Math.max(10, health - (hasVault ? 1 : 4));
                sciencePts += 10;
                consequence = "Spacecraft oriented fuel tanks toward the solar storm. Critical avionics shielded from coronal mass ejection. Health preserved.";
            } else {
                if (hasVault && hasRad750) {
                    health = Math.max(10, health - 3);
                    sciencePts += 30;
                    dataCol += 1100;
                    consequence = "SPECTACULAR RETURN: Hardened avionics weathered the solar storm while particle detectors mapped solar energetic particle flux!";
                } else {
                    health = Math.max(10, health - 18);
                    sciencePts += 18;
                    consequence = "CAUTION: Solar storm caused multiple single-event upsets in unshielded avionics! Telemetry bit errors and memory scrubbing required.";
                }
            }
        } else if (event.id === "mars_evt_2") {
            if (cId === "c1") {
                power = Math.max(10, power - 5);
                sciencePts += 22;
                consequence = "Flawless 350 km circular insertion burn executed. Spacecraft established nominal mapping orbit with immediate scientific survey coverage.";
            } else {
                if (comps.thermal.id === "thm_active" || comps.thermal.id === "thm_nuclear_rhu") {
                    sciencePts += 25;
                    health = Math.max(10, health - 2);
                    consequence = "SUCCESSFUL AEROBRAKING: Active thermal management dissipated upper-atmosphere heat. Saved 35% propellant while circularizing orbit!";
                } else {
                    health = Math.max(10, health - 14);
                    sciencePts += 15;
                    consequence = "WARNING: Passive MLI blankets overheated during atmospheric aerobraking dip. Outer thermal foil sustained partial scorch damage.";
                }
            }
        } else if (event.id === "mars_evt_3") {
            if (cId === "c1") {
                power = Math.max(10, power - (hasMmrtg ? 5 : 20));
                sciencePts += 8;
                consequence = "Spacecraft placed into safe power-saving hibernation. Systems maintained battery equilibrium until global dust storm cleared.";
            } else {
                if (hasMmrtg) {
                    sciencePts += 32;
                    dataCol += 1900;
                    consequence = "TRIUMPH: MMRTG Nuclear Generator ignored the dust storm completely! Subsurface radar penetrated the obscured atmosphere to map hidden polar layers.";
                } else if (hasUltraFlex) {
                    power = Math.max(10, power - 30);
                    sciencePts += 18;
                    consequence = "UltraFlex arrays produced marginal power through dust. Basic radar runs operated at 40% duty cycle.";
                } else {
                    power = Math.max(5, power - 55);
                    health = Math.max(10, health - 22);
                    consequence = "CRITICAL BROWNOUT: Silicon solar panels starved of sunlight under dust storm. Deep battery discharge caused emergency load shedding.";
                }
            }
        } else if (event.id === "mars_evt_4") {
            if (cId === "c1") {
                if (comps.avionics.storageGb >= 128) {
                    dataCol += 2500;
                    sciencePts += 30;
                    consequence = "Onboard solid-state recorder successfully buffered all high-rate methane passes during the solar conjunction radio blackout.";
                } else {
                    dataCol += 800;
                    sciencePts += 15;
                    consequence = "Buffer memory reached 100% capacity during solar conjunction. Some secondary telemetry was discarded.";
                }
            } else {
                if (hasDsn) {
                    dataTx += 1200;
                    sciencePts += 18;
                    consequence = "NASA Deep Space Network maintained carrier signal through solar plasma, downlinking partial telemetry.";
                } else {
                    health = Math.max(10, health - 10);
                    consequence = "Transmission through solar plasma suffered heavy packet loss. Ground station lost sync for 9 days.";
                }
            }
        } else if (event.id === "mars_evt_5") {
            if (cId === "c1") {
                if (hasCamera && hasSpectrometer) {
                    sciencePts += 35;
                    dataCol += 3200;
                    consequence = "HISTORIC DISCOVERY: Multi-spectral sweep verified phyllosilicate clay beds indicating neutral-pH, long-lived lake waters on ancient Mars!";
                } else {
                    sciencePts += 16;
                    consequence = "Targeted roll maneuver executed; partial mineralogical data acquired.";
                }
            } else {
                sciencePts += 12;
                consequence = "Nadir pass completed with zero pointing risk to reaction wheels.";
            }
        }

        // --- EUROPA EVENTS ---
        else if (event.id === "europa_evt_1") {
            if (cId === "c1") {
                if (hasVault && hasRad750) {
                    health = Math.max(10, health - 1);
                    sciencePts += 20;
                    consequence = "Radiation-hardened vault and RAD750 processor shielded core avionics. Zero ionizing dose corruption during Jovian belt transit.";
                } else {
                    health = Math.max(10, health - 16);
                    sciencePts += 10;
                    consequence = "WARNING: Unarmored bus sustained intense radiation dose. Multiple memory bit-flips corrected.";
                }
            } else {
                if (hasVault) {
                    health = Math.max(10, health - 6);
                    sciencePts += 38;
                    dataCol += 1600;
                    consequence = "Spectacular plasma physics telemetry downlinked! Shielded bus survived while sensors recorded Jovian flux lines.";
                } else {
                    health = Math.max(10, health - 28);
                    sciencePts += 18;
                    consequence = "SEVERE RADIATION DAMAGE: Intense ionizing radiation degraded unshielded instrument multiplexers.";
                }
            }
        } else if (event.id === "europa_evt_2") {
            if (cId === "c1") {
                if (hasMmrtg || comps.thermal.id === "thm_nuclear_rhu") {
                    power = Math.max(10, power - 4);
                    sciencePts += 22;
                    consequence = "Radioisotope thermal heat units maintained steady +15°C internal temperature through the 3.2 hour Jupiter eclipse with zero electrical battery drain!";
                } else {
                    power = Math.max(5, power - 45);
                    consequence = "Electrical heaters drew massive battery current to prevent hydrazine lines from freezing.";
                }
            } else {
                health = Math.max(10, health - 15);
                consequence = "Outer sensor bay cold-soaked to -180°C. Instrument calibration offset required upon re-warming.";
            }
        } else if (event.id === "europa_evt_3") {
            if (cId === "c1") {
                if (hasRadar || hasSpectrometer) {
                    sciencePts += 45;
                    dataCol += 3800;
                    health = Math.max(10, health - 6);
                    consequence = "MONUMENTAL FINDING: Spacecraft flew through the 160-km plume! In-situ mass spectrometry confirmed water vapor, sodium chloride salts, and organic macromolecules!";
                } else {
                    sciencePts += 20;
                    health = Math.max(10, health - 10);
                    consequence = "Plume traverse completed, but lacking dedicated spectrometry limited chemical identification.";
                }
            } else {
                sciencePts += 22;
                dataCol += 1100;
                consequence = "Safe 300 km remote sensing pass mapped plume morphology and water ice condensation boundaries.";
            }
        } else if (event.id === "europa_evt_4") {
            if (cId === "c1") {
                dataTx += 800;
                sciencePts += 15;
                consequence = "Robust X-band carrier delivered 100% error-free telemetry through Jovian plasma, though data downlink was slow.";
            } else {
                if (hasDsn70 || (hasDsn && hasKaOptical)) {
                    dataTx += 4500;
                    sciencePts += 35;
                    consequence = "SUCCESS: NASA DSN 70m aperture array locked high-gain Ka-band carrier! Ultra-high-definition radar sounding data successfully received on Earth.";
                } else {
                    dataTx += 1200;
                    sciencePts += 14;
                    health = Math.max(10, health - 5);
                    consequence = "High-gain lock lost intermittently; university/commercial receiver dropped 35% of packets.";
                }
            }
        } else if (event.id === "europa_evt_5") {
            if (cId === "c1") {
                sciencePts += 20;
                consequence = "NASA GOLD STANDARD: Controlled de-orbit into Jupiter executed flawlessly. 100% planetary protection compliance ensured; Europa's ocean safeguarded.";
            } else {
                sciencePts += 10;
                consequence = "Boosted into high graveyard orbit. Spacecraft remains stable, meeting secondary COSPAR guidelines.";
            }
        }

        dataTx = Math.min(dataTx + 400, dataCol + 500);

        log.push({
            phase: event.phase,
            eventTitle: event.title,
            choiceText: choice.text,
            consequence
        });

        return {
            simState: {
                ...simState,
                healthPct: Number(health.toFixed(1)),
                powerPct: Number(power.toFixed(1)),
                dataCollectedMb: Number(dataCol.toFixed(1)),
                dataTransmittedMb: Number(dataTx.toFixed(1)),
                sciencePoints: Number(sciencePts.toFixed(1)),
                log
            },
            consequence
        };
    }
};

if (typeof module !== "undefined") {
    module.exports = EventsEngine;
}

