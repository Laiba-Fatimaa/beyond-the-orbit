/**
 * GAME DATA & HARDWARE CATALOG
 * =============================
 * BEYOND THE ORBIT - Space Mission Design Game
 * Team Orbitera | NASA Space Apps Challenge 2026
 * 
 * Hardware options, launch vehicles, mission profiles,
 * and scientific payloads across all Four Mission Segments.
 */

const GAME_DATA = {
    missions: {
        "lunar_explorer": {
            id: "lunar_explorer",
            name: "Lunar Explorer",
            tagline: "Unlocking the Secrets of the Lunar Regolith & Permanently Shadowed Craters",
            destination: "Moon",
            difficulty: "Cadet (Introductory)",
            difficultyStars: "★★☆☆☆",
            budgetMillion: 300.0,
            primaryTarget: "South Pole-Aitken Basin & Shackleton Crater",
            overview: "Embark on a high-precision lunar mission to survey polar water ice deposits, map geochemical compositions, and establish critical surface data corridors. Surviving the 14-day lunar night (-160°C cold sink) and abrasive regolith tests your battery storage and navigation systems.",
            scientificObjectives: [
                {
                    id: "lunar_obj_1",
                    title: "Map Volatiles & Water Ice in Cold Traps",
                    instrumentReq: ["radar", "thermal_sensor"],
                    points: 35,
                    description: "Probe Permanently Shadowed Regions (PSRs) at the lunar south pole for subsurface hydrogen signatures."
                },
                {
                    id: "lunar_obj_2",
                    title: "High-Resolution Geomorphic Topography",
                    instrumentReq: ["camera"],
                    points: 30,
                    description: "Produce sub-meter digital elevation models of potential landing corridors and pyroclastic deposits."
                },
                {
                    id: "lunar_obj_3",
                    title: "Mineralogical & Titanium-Iron Survey",
                    instrumentReq: ["spectrometer"],
                    points: 35,
                    description: "Characterize ilmenite and anorthosite abundances across basaltic maria and highlands."
                }
            ],
            challenges: [
                "Surviving 14 Earth days of lunar darkness (-130°C to -170°C cold sink)",
                "Line-of-sight occultations when surveying polar crater floors or far side",
                "Fine, abrasive lunar regolith and electrostatic dust levitation"
            ],
            architectures: [
                {
                    id: "polar_low_orbit",
                    name: "Low Lunar Polar Orbit (100 km)",
                    description: "Provides global surface coverage over 28 days as the Moon rotates beneath the orbital plane.",
                    complexityCost: 25.0,
                    complexityMass: 180.0,
                    scienceMultiplier: 1.25,
                    commWindowPct: 92
                },
                {
                    id: "frozen_eccentric_orbit",
                    name: "Frozen Elliptical Halo Orbit (Perilune 30 km)",
                    description: "Minimizes station-keeping fuel while providing high-resolution low-altitude passes over the South Pole.",
                    complexityCost: 35.0,
                    complexityMass: 230.0,
                    scienceMultiplier: 1.35,
                    commWindowPct: 85
                },
                {
                    id: "direct_descent_lander",
                    name: "Direct Descent Soft Lander",
                    description: "Places payload on the surface for in-situ drilling and stationary spectral analysis.",
                    complexityCost: 65.0,
                    complexityMass: 480.0,
                    scienceMultiplier: 1.50,
                    commWindowPct: 75
                }
            ],
            env: {
                solarFluxScale: 1.0,
                radiationSeverity: "Moderate",
                communicationDelayS: 1.28
            }
        },

        "mars_discovery": {
            id: "mars_discovery",
            name: "Mars Discovery",
            tagline: "Investigating Past Habitable Climates, Seasonal Methane & Global Dust Cycles",
            destination: "Mars",
            difficulty: "Flight Director (Intermediate)",
            difficultyStars: "★★★★☆",
            budgetMillion: 550.0,
            primaryTarget: "Jezero Crater & Valles Marineris",
            overview: "Launch an interplanetary expedition across millions of kilometers to decode ancient lake deposits and seasonal methane release. Navigate 4 to 24 minute speed-of-light delays, 57% solar energy loss, and planet-encircling dust storms that blanket solar panels for weeks.",
            scientificObjectives: [
                {
                    id: "mars_obj_1",
                    title: "Subsurface Paleohydrology & Ice Shelves",
                    instrumentReq: ["radar", "spectrometer"],
                    points: 35,
                    description: "Sound subsurface sedimentary beds and buried glaciers up to 1.5 km depth."
                },
                {
                    id: "mars_obj_2",
                    title: "Atmospheric Trace Gas & Methane Monitoring",
                    instrumentReq: ["spectrometer", "particle_detector"],
                    points: 35,
                    description: "Detect seasonal methane fluctuations and trace gas plumes associated with sub-surface activity."
                },
                {
                    id: "mars_obj_3",
                    title: "High-Resolution Geomorphology & Dunes",
                    instrumentReq: ["camera", "thermal_sensor"],
                    points: 30,
                    description: "Track active dust devil dynamics, recurring slope lineae (RSL), and ancient delta deposits."
                }
            ],
            challenges: [
                "Severe solar irradiance reduction (~589 W/m² vs 1361 W/m² at Earth)",
                "Planet-wide dust storms blocking up to 80% of sunlight for months",
                "Speed-of-light communication delays (4 to 24 minutes one-way) requiring autonomous fault protection",
                "Aerodynamic entry and interplanetary transit thermal extremes"
            ],
            architectures: [
                {
                    id: "sun_sync_areocentric",
                    name: "Sun-Synchronous Low Mars Orbit (300 km)",
                    description: "Passes over targets at constant local solar time (ideal for repeatable illumination and shadow analysis).",
                    complexityCost: 45.0,
                    complexityMass: 320.0,
                    scienceMultiplier: 1.30,
                    commWindowPct: 88
                },
                {
                    id: "aerobraking_elliptical",
                    name: "Aerobraking Elliptical Relay Orbit",
                    description: "Uses Mars's upper atmosphere to trim orbital speed, saving propellant mass while providing dual science and relay services.",
                    complexityCost: 60.0,
                    complexityMass: 420.0,
                    scienceMultiplier: 1.40,
                    commWindowPct: 78
                },
                {
                    id: "mars_surface_lander_pack",
                    name: "Guided Entry Aero-Shell & Surface Station",
                    description: "Employs heat shield and retro-propulsion to conduct long-term surface meteorology and soil science.",
                    complexityCost: 110.0,
                    complexityMass: 850.0,
                    scienceMultiplier: 1.60,
                    commWindowPct: 65
                }
            ],
            env: {
                solarFluxScale: 0.43,
                radiationSeverity: "Elevated (GCR + SPE)",
                communicationDelayS: 750.0
            }
        },

        "europa_frontier": {
            id: "europa_frontier",
            name: "Europa Frontier",
            tagline: "Probing the Hidden Ocean & Cryovolcanic Plumes in Jupiter's Radiation Inferno",
            destination: "Europa",
            difficulty: "Mission Director (Advanced)",
            difficultyStars: "★★★★★",
            budgetMillion: 920.0,
            primaryTarget: "Conamara Chaos & Thrace Macula Ice Plumes",
            overview: "Venture 628 million kilometers into the Jovian system, where Europa conceals a global liquid ocean beneath 20 km of floating ice. Survive Jupiter's colossal radiation belts (~5,400 mSv/day), manage power on only 3.7% of Earth's sunlight, and buffer data over a 40-minute light-speed chasm.",
            scientificObjectives: [
                {
                    id: "europa_obj_1",
                    title: "Sound Ice Shell Thickness & Ocean Interface",
                    instrumentReq: ["radar", "particle_detector"],
                    points: 40,
                    description: "Penetrate the 15-25 km thick floating ice shell to verify liquid water pockets and depth of ocean floor."
                },
                {
                    id: "europa_obj_2",
                    title: "Cryoplume & Salt-Organic Characterization",
                    instrumentReq: ["spectrometer", "camera"],
                    points: 35,
                    description: "Perform in-situ mass spectrometry on vented vapor plumes for sodium chloride and prebiotic organics."
                },
                {
                    id: "europa_obj_3",
                    title: "Induced Magnetic Dipole & Ocean Salinity",
                    instrumentReq: ["particle_detector", "thermal_sensor"],
                    points: 25,
                    description: "Measure Jupiter-induced magnetic currents to calculate ocean conductivity, temperature, and salt content."
                }
            ],
            challenges: [
                "Lethal Jovian magnetospheric radiation belt (~5,400 mSv/day dose)",
                "Inverse-square law solar starvation: 50.3 W/m² (solar panels must be huge or MMRTG nuclear is required)",
                "Radio light delay of 35 to 52 minutes, requiring complete onboard autonomy",
                "Cryogenic temperatures (-220°C) demanding active thermal management"
            ],
            architectures: [
                {
                    id: "jupiter_flyby_resonance",
                    name: "Multiple Europa Flyby Trajectory (Jovian Resonance)",
                    description: "Dips quickly into Europa's radiation zone during close flybys (25 km altitude) and retreats out to safety, modeled after NASA's Europa Clipper.",
                    complexityCost: 85.0,
                    complexityMass: 550.0,
                    scienceMultiplier: 1.45,
                    commWindowPct: 82
                },
                {
                    id: "dedicated_europa_orbiter",
                    name: "Dedicated Europa Polar Orbiter (High-Risk/High-Reward)",
                    description: "Injects directly into a 100 km orbit around Europa. Unprecedented science data, but exposed to continuous, brutal radiation doses.",
                    complexityCost: 150.0,
                    complexityMass: 980.0,
                    scienceMultiplier: 1.75,
                    commWindowPct: 70
                },
                {
                    id: "surface_penetrator_package",
                    name: "Orbiter + Cryo-Penetrator Surface Dart",
                    description: "Deploys a hardened kinetic penetrator into the chaos ice crust to sample surface chemistry directly.",
                    complexityCost: 190.0,
                    complexityMass: 1250.0,
                    scienceMultiplier: 1.90,
                    commWindowPct: 55
                }
            ],
            env: {
                solarFluxScale: 0.037,
                radiationSeverity: "Lethal (Jovian Belt ~5.4 Sv/day)",
                communicationDelayS: 2400.0
            }
        }
    },

    // -------------------------------------------------------------
    // A. LAUNCH VEHICLES
    // -------------------------------------------------------------
    launchVehicles: {
        "lv_light": {
            id: "lv_light",
            name: "Stratos-V Light Booster",
            costMillion: 18.0,
            maxPayloadKg: { "Moon": 450.0, "Mars": 220.0, "Europa": 90.0 },
            reliability: 0.90,
            class: "Light-Lift (<500 kg to TLI)",
            pros: "Lowest launch procurement cost, rapid turnaround.",
            cons: "Severely restricted payload mass; cannot support heavy shielding or landers.",
            nasaNote: "Comparable to Rocket Lab Electron or Firefly Alpha."
        },
        "lv_medium": {
            id: "lv_medium",
            name: "Atlas-Horizon Medium-Heavy",
            costMillion: 75.0,
            maxPayloadKg: { "Moon": 1800.0, "Mars": 1100.0, "Europa": 550.0 },
            reliability: 0.96,
            class: "Medium-Lift Workhorse",
            pros: "Proven restartable upper stage, balanced mass allowance for orbiters.",
            cons: "Marginal for Europa direct injection without gravity assists.",
            nasaNote: "Comparable to Falcon 9 or Atlas V 401/501 series."
        },
        "lv_heavy": {
            id: "lv_heavy",
            name: "Titan-Centaur Heavy Lifter",
            costMillion: 140.0,
            maxPayloadKg: { "Moon": 4200.0, "Mars": 2800.0, "Europa": 1600.0 },
            reliability: 0.98,
            class: "Heavy-Lift Deep Space System",
            pros: "Enormous payload margin; easily accommodates landers and nuclear power.",
            cons: "Consumes significant mission budget ($140M).",
            nasaNote: "Comparable to Falcon Heavy or Vulcan Centaur Heavy."
        },
        "lv_super": {
            id: "lv_super",
            name: "Deep Space SLS Super-Lifter",
            costMillion: 260.0,
            maxPayloadKg: { "Moon": 9500.0, "Mars": 6500.0, "Europa": 3800.0 },
            reliability: 0.99,
            class: "Super Heavy-Lift Exploration System",
            pros: "Maximum translunar/interplanetary injection velocity (high C3).",
            cons: "Premium cost ($260M); requires large mission budget.",
            nasaNote: "Comparable to NASA Space Launch System (SLS) Block 1B."
        }
    },

    // -------------------------------------------------------------
    // B. SPACE SEGMENT SUBSYSTEMS
    // -------------------------------------------------------------
    structures: {
        "struct_aluminum": {
            id: "struct_aluminum",
            name: "Standard Aluminum-Lithium Truss",
            massKg: 160.0,
            costMillion: 12.0,
            radShielding: 1.0,
            reliability: 0.94,
            desc: "Conventional aerospace honeycomb alloy structure. Cost-effective for benign orbital environments."
        },
        "struct_carbon": {
            id: "struct_carbon",
            name: "Carbon-Fiber Reinforced Polymer (CFRP)",
            massKg: 110.0,
            costMillion: 24.0,
            radShielding: 1.2,
            reliability: 0.96,
            desc: "Ultra-lightweight composite bus offering high rigidity and minimal thermal distortion."
        },
        "struct_vault": {
            id: "struct_vault",
            name: "Radiation-Hardened Titanium / Tantalum Vault",
            massKg: 280.0,
            costMillion: 45.0,
            radShielding: 3.8,
            reliability: 0.99,
            desc: "Armored avionics vault lined with tantalum plates. Vital for surviving Jupiter's extreme radiation belt.",
            nasaNote: "Modeled after NASA Juno and Europa Clipper radiation vaults."
        }
    },

    powerGenerations: {
        "pwr_silicon": {
            id: "pwr_silicon",
            name: "Deployable Silicon Solar Panels",
            massKg: 60.0,
            costMillion: 10.0,
            basePowerW: 400.0,
            type: "solar",
            reliability: 0.92,
            desc: "Standard silicon photovoltaic arrays. Reliable at 1 AU; struggles at Mars; fatal power failure at Europa."
        },
        "pwr_ultraflex": {
            id: "pwr_ultraflex",
            name: "UltraFlex Gallium-Arsenide (GaAs) Arrays",
            massKg: 120.0,
            costMillion: 28.0,
            basePowerW: 950.0,
            type: "solar",
            reliability: 0.96,
            desc: "High-efficiency triple-junction cells mounted on circular blankets. Delivers robust power at Mars.",
            nasaNote: "Flown on NASA Orion, Phoenix, and InSight."
        },
        "pwr_mmrtg": {
            id: "pwr_mmrtg",
            name: "Single MMRTG Radioisotope Generator",
            massKg: 85.0,
            costMillion: 65.0,
            basePowerW: 180.0,
            type: "nuclear",
            reliability: 0.99,
            desc: "Decay of Plutonium-238 delivers continuous electricity and thermal heat day and night, immune to dust storms and distance.",
            nasaNote: "Powers NASA Curiosity, Perseverance, and New Horizons."
        },
        "pwr_dual_mmrtg": {
            id: "pwr_dual_mmrtg",
            name: "Dual MMRTG Deep Space Nuclear Plant",
            massKg: 165.0,
            costMillion: 115.0,
            basePowerW: 360.0,
            type: "nuclear",
            reliability: 0.995,
            desc: "Two coupled radioisotope generators delivering 360W continuous power for flagship deep space missions.",
            nasaNote: "Comparable to the multi-RTG architecture on Cassini."
        }
    },

    batteries: {
        "bat_li_ion": {
            id: "bat_li_ion",
            name: "Standard Space-Grade Li-Ion Battery Pack",
            massKg: 40.0,
            costMillion: 8.0,
            capacityWh: 1200.0,
            reliability: 0.93,
            desc: "High energy density for standard eclipse durations (45-60 min). Requires careful thermal warming."
        },
        "bat_solid_state": {
            id: "bat_solid_state",
            name: "Advanced Solid-State Ceramic Battery",
            massKg: 65.0,
            costMillion: 22.0,
            capacityWh: 3200.0,
            reliability: 0.98,
            desc: "Non-flammable solid electrolyte with wide operating thermal range (-50°C to +80°C). Massive reserves."
        }
    },

    communications: {
        "comm_s_band": {
            id: "comm_s_band",
            name: "S-Band Low-Gain Omnidirectional Antenna",
            massKg: 18.0,
            costMillion: 6.0,
            powerW: 35.0,
            maxDataRateMbDay: 250.0,
            reliability: 0.97,
            desc: "Wide-angle broadcast antenna. Excellent for telemetry pings, but severely throttles scientific imagery."
        },
        "comm_x_band": {
            id: "comm_x_band",
            name: "X-Band High-Gain Parabolic Dish (1.5m)",
            massKg: 45.0,
            costMillion: 18.0,
            powerW: 85.0,
            maxDataRateMbDay: 2200.0,
            reliability: 0.95,
            desc: "Standard deep-space scientific communication workhorse. Provides multi-megabit downlinks to Earth."
        },
        "comm_ka_optical": {
            id: "comm_ka_optical",
            name: "Dual Ka-Band & Deep Space Optical Laser (DSOC)",
            massKg: 75.0,
            costMillion: 40.0,
            powerW: 160.0,
            maxDataRateMbDay: 12000.0,
            reliability: 0.92,
            desc: "Hybrid radio and near-infrared laser transceiver. Delivers ultra-high-definition scientific streams from deep space.",
            nasaNote: "Demonstrated on NASA Psyche, achieving 267 Mbps optical downlink from 31 million km."
        }
    },

    avionics: {
        "av_cots": {
            id: "av_cots",
            name: "High-Performance COTS Dual-Core Flight Computer",
            massKg: 15.0,
            costMillion: 8.0,
            powerW: 25.0,
            storageGb: 128.0,
            radToleranceKrad: 25.0,
            reliability: 0.88,
            desc: "Fast commercial processors with software error-detection. Susceptible to radiation single-event upsets."
        },
        "av_rad750": {
            id: "av_rad750",
            name: "Radiation-Hardened BAE RAD750 Flight Computer",
            massKg: 28.0,
            costMillion: 22.0,
            powerW: 40.0,
            storageGb: 64.0,
            radToleranceKrad: 200.0,
            reliability: 0.98,
            desc: "The gold-standard radiation-hardened spacecraft processor with decades of verified deep space heritage.",
            nasaNote: "Flight computer of MRO, Curiosity, and James Webb Space Telescope."
        },
        "av_fault_tolerant": {
            id: "av_fault_tolerant",
            name: "Triple-Modular Redundant (TMR) Autonomous System",
            massKg: 45.0,
            costMillion: 38.0,
            powerW: 75.0,
            storageGb: 512.0,
            radToleranceKrad: 350.0,
            reliability: 0.995,
            desc: "Three voting processor cores with onboard autonomous contingency response algorithms. Resolves anomalies without Earth intervention."
        }
    },

    propulsions: {
        "prop_cold_gas": {
            id: "prop_cold_gas",
            name: "Reaction Wheels & Cold-Gas Thrusters",
            massKg: 40.0,
            costMillion: 9.0,
            powerW: 30.0,
            deltaVMs: 120.0,
            reliability: 0.92,
            desc: "Pressurized nitrogen attitude control and 3-axis reaction wheels. Simple, but minimal orbital change delta-V."
        },
        "prop_monoprop": {
            id: "prop_monoprop",
            name: "Hydrazine Monopropellant Propulsion System",
            massKg: 140.0,
            costMillion: 24.0,
            powerW: 45.0,
            deltaVMs: 750.0,
            reliability: 0.96,
            desc: "Catalytic hydrazine thrusters providing substantial delta-V for trajectory corrections and orbit insertion."
        },
        "prop_ion": {
            id: "prop_ion",
            name: "NEXT-C Gridded Ion Propulsion / Hall Thruster",
            massKg: 180.0,
            costMillion: 48.0,
            powerW: 180.0,
            deltaVMs: 3200.0,
            reliability: 0.95,
            desc: "Electrostatic xenon gas thruster with exceptional specific impulse (Isp > 3100 s). High delta-V capability.",
            nasaNote: "Developed by NASA Glenn Research Center; flown on Dawn and DART."
        }
    },

    thermals: {
        "thm_passive": {
            id: "thm_passive",
            name: "Passive Multi-Layer Insulation (MLI) & Heaters",
            massKg: 25.0,
            costMillion: 6.0,
            powerW: 25.0,
            reliability: 0.92,
            desc: "Mylar/Kapton reflective thermal blankets with small electrical survival heaters."
        },
        "thm_active": {
            id: "thm_active",
            name: "Variable Louvers & Heat Pipe Loop",
            massKg: 55.0,
            costMillion: 18.0,
            powerW: 40.0,
            reliability: 0.96,
            desc: "Ammonia heat pipes and bimetallic louvers that open and close to radiate excess heat dynamically."
        },
        "thm_nuclear_rhu": {
            id: "thm_nuclear_rhu",
            name: "Radioisotope Heater Units (RHU) & Fluid Loop",
            massKg: 65.0,
            costMillion: 32.0,
            powerW: 15.0,
            reliability: 0.99,
            desc: "Pellets of Pu-238 generating constant direct thermal heat with minimal electrical draw. Essential for cryogenic deep space (-220°C).",
            nasaNote: "Safeguards sensitive instruments on Cassini and Europa Clipper."
        }
    },

    // -------------------------------------------------------------
    // SCIENTIFIC INSTRUMENT PAYLOAD
    // -------------------------------------------------------------
    instruments: {
        "camera": {
            id: "camera",
            name: "Multispectral High-Resolution Imager",
            massKg: 28.0,
            costMillion: 18.0,
            powerW: 42.0,
            dataRateMbDay: 3500.0,
            reliability: 0.95,
            scienceVal: 25,
            desc: "Telescopic framing camera with color filter wheels for sub-meter surface topography and geologic structures.",
            nasaAnalogue: "LROC (Moon) / HiRISE (Mars)"
        },
        "spectrometer": {
            id: "spectrometer",
            name: "Near-Infrared Imaging Spectrometer",
            massKg: 32.0,
            costMillion: 26.0,
            powerW: 55.0,
            dataRateMbDay: 2100.0,
            reliability: 0.94,
            scienceVal: 30,
            desc: "Splits reflected sunlight into diagnostic wavelengths to identify minerals, hydrous salts, and atmospheric trace gases.",
            nasaAnalogue: "CRISM (Mars) / Moon Mineralogy Mapper / MISE (Europa Clipper)"
        },
        "radar": {
            id: "radar",
            name: "Subsurface Sounding Shallow Radar (SHARAD)",
            massKg: 46.0,
            costMillion: 34.0,
            powerW: 85.0,
            dataRateMbDay: 1800.0,
            reliability: 0.93,
            scienceVal: 32,
            desc: "Penetrates dielectric surfaces up to several kilometers. Detects buried polar ice, lava tubes, and subsurface liquid reservoirs.",
            nasaAnalogue: "SHARAD (Mars) / REASON (Europa Clipper)"
        },
        "thermal_sensor": {
            id: "thermal_sensor",
            name: "Thermal Infrared Radiometer & Bolometer",
            massKg: 16.0,
            costMillion: 14.0,
            powerW: 28.0,
            dataRateMbDay: 650.0,
            reliability: 0.96,
            scienceVal: 20,
            desc: "Measures emitted thermal energy day and night to calculate surface thermal inertia, regolith grain size, and hotspots.",
            nasaAnalogue: "Diviner (Moon) / THEMIS (Mars) / E-THEMIS (Europa Clipper)"
        },
        "particle_detector": {
            id: "particle_detector",
            name: "Fluxgate Magnetometer & Particle Detector",
            massKg: 22.0,
            costMillion: 20.0,
            powerW: 30.0,
            dataRateMbDay: 400.0,
            reliability: 0.97,
            scienceVal: 22,
            desc: "Measures magnetic field dynamics and cosmic ray fluxes. Crucial for detecting induction in subsurface saline oceans.",
            nasaAnalogue: "ECM (Europa Clipper Magnetometer) / MAVEN Magnetometer"
        }
    },

    // -------------------------------------------------------------
    // D. GROUND & USER SEGMENTS
    // -------------------------------------------------------------
    groundSegments: {
        "ground_university": {
            id: "ground_university",
            name: "Regional University / Commercial Ground Net",
            costMillion: 8.0,
            contactHoursDay: 4.0,
            downlinkEfficiency: 0.65,
            reliability: 0.88,
            desc: "Single-hemisphere tracking dish with limited daily contact passes. Low cost, but creates severe data bottlenecks."
        },
        "ground_nsn": {
            id: "ground_nsn",
            name: "NASA Near Space Network (NSN) Commercial Alliance",
            costMillion: 24.0,
            contactHoursDay: 12.0,
            downlinkEfficiency: 0.90,
            reliability: 0.95,
            desc: "Global distributed ground stations providing consistent contact windows for missions up to 2 million km from Earth.",
            nasaNote: "NASA NSN supports cislunar and near-Earth operations."
        },
        "ground_dsn_34m": {
            id: "ground_dsn_34m",
            name: "NASA Deep Space Network (DSN) 34m Beam Waveguide",
            costMillion: 45.0,
            contactHoursDay: 18.0,
            downlinkEfficiency: 0.96,
            reliability: 0.98,
            desc: "Continuous 24/7 global coverage through Goldstone, Madrid, and Canberra. Standard deep-space baseline.",
            nasaNote: "Standard 34m Beam Waveguide dish network."
        },
        "ground_dsn_70m": {
            id: "ground_dsn_70m",
            name: "NASA DSN 70m Antenna Array + High-Rate Relay",
            costMillion: 75.0,
            contactHoursDay: 24.0,
            downlinkEfficiency: 1.0,
            reliability: 0.99,
            desc: "The most sensitive scientific receiving facilities on Earth. Massive 70-meter paraboloids arrayed for maximum deep-space data extraction.",
            nasaNote: "70-meter antennas at Goldstone, Madrid, and Canberra."
        }
    },

    userSegments: {
        "user_academic": {
            id: "user_academic",
            name: "Single University Science Working Group",
            costMillion: 6.0,
            scienceMultiplier: 1.0,
            desc: "Focused academic research team. Produces focused papers but slower pipeline processing for public release."
        },
        "user_multicenter": {
            id: "user_multicenter",
            name: "NASA Multi-Center & International Science Team",
            costMillion: 18.0,
            scienceMultiplier: 1.35,
            desc: "Collaborative consortium of NASA Centers (JPL, Goddard, Ames) and international partners. Rapid calibrated data validation."
        },
        "user_open_pds": {
            id: "user_open_pds",
            name: "NASA Planetary Data System (PDS) Rapid Open Pipeline",
            costMillion: 32.0,
            scienceMultiplier: 1.60,
            desc: "Immediate automated ingestion, machine-learning feature classification, and open public archival on the NASA PDS.",
            nasaNote: "The NASA PDS archives planetary science data for humanity."
        }
    }
};

if (typeof module !== "undefined") {
    module.exports = GAME_DATA;
}

