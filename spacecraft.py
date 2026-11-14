"""
SPACECRAFT & MISSION SEGMENTS MODULE
===================================
BEYOND THE ORBIT - Space Mission Design Game
Defines the components, subsystems, instruments, and facilities across:
- A. Launch Segment (Launch Vehicles)
- B. Space Segment (Spacecraft Bus & Scientific Payload)
- C. Orbit & Mission Architecture (Destination-specific)
- D. Ground & User Segments (Ground Network & Science Pipeline)

Aligned with NASA SMD Four-Segment Mission Architecture.
"""

from typing import Dict, Any, List

# -------------------------------------------------------------
# A. LAUNCH SEGMENT (LAUNCH VEHICLES)
# -------------------------------------------------------------
LAUNCH_VEHICLES: Dict[str, Dict[str, Any]] = {
    "lv_light": {
        "id": "lv_light",
        "name": "Stratos-V Light Booster",
        "description": "Small-lift launch vehicle ideal for low-cost rideshare or CubeSat/SmallSat swarms.",
        "cost_million": 18.0,
        "max_payload_kg": {
            "Moon": 450.0,
            "Mars": 220.0,
            "Europa": 90.0
        },
        "reliability": 0.90,
        "class": "Light-Lift (<500 kg to TLI)",
        "pros": "Extremely low cost, rapid launch readiness.",
        "cons": "Severely restricted payload mass capacity; cannot support heavy shielding or landers.",
        "nasa_note": "Comparable to Rocket Lab Electron or Firefly Alpha class."
    },
    "lv_medium": {
        "id": "lv_medium",
        "name": "Atlas-Horizon Medium-Heavy",
        "description": "Workhorse orbital launch system with proven upper-stage restart capability.",
        "cost_million": 75.0,
        "max_payload_kg": {
            "Moon": 1800.0,
            "Mars": 1100.0,
            "Europa": 550.0
        },
        "reliability": 0.96,
        "class": "Medium-Lift Workhorse",
        "pros": "High reliability, balanced mass allowance for orbiters and robust instruments.",
        "cons": "Higher cost; marginal for Europa direct insertion without gravity assists.",
        "nasa_note": "Comparable to Falcon 9 or Atlas V 401/501 series."
    },
    "lv_heavy": {
        "id": "lv_heavy",
        "name": "Titan-Centaur Heavy Lifter",
        "description": "Heavy-lift three-stage launcher with high cryogenic specific impulse upper stage.",
        "cost_million": 140.0,
        "max_payload_kg": {
            "Moon": 4200.0,
            "Mars": 2800.0,
            "Europa": 1600.0
        },
        "reliability": 0.98,
        "class": "Heavy-Lift Exploration System",
        "pros": "Enormous payload margin; easily accommodates landers, nuclear power, and heavy shielding.",
        "cons": "Consumes a large portion of mission budget ($140M).",
        "nasa_note": "Comparable to Falcon Heavy or Vulcan Centaur Heavy."
    },
    "lv_super": {
        "id": "lv_super",
        "name": "Deep Space SLS Super-Lifter",
        "description": "Super heavy-lift exploration architecture with immense translunar and interplanetary injection velocity.",
        "cost_million": 260.0,
        "max_payload_kg": {
            "Moon": 9500.0,
            "Mars": 6500.0,
            "Europa": 3800.0
        },
        "reliability": 0.99,
        "class": "Super Heavy-Lift Deep Space System",
        "pros": "Maximum trans-planetary injection capability; permits direct Europa transfer without multi-year inner-solar flybys.",
        "cons": "Very expensive ($260M); requires large mission budget.",
        "nasa_note": "Comparable to NASA Space Launch System (SLS) Block 1B or Starship."
    }
}

# -------------------------------------------------------------
# B. SPACE SEGMENT — BUS SUBSYSTEMS
# -------------------------------------------------------------

# Structure & Primary Bus
STRUCTURE_OPTIONS: Dict[str, Dict[str, Any]] = {
    "struct_aluminum": {
        "id": "struct_aluminum",
        "name": "Standard Aluminum-Lithium Truss",
        "mass_kg": 160.0,
        "cost_million": 12.0,
        "radiation_shielding": 1.0, # Baseline
        "thermal_conduction": "Moderate",
        "reliability": 0.94,
        "description": "Conventional aerospace honeycomb alloy structure. Cost-effective and lightweight for benign orbital environments."
    },
    "struct_carbon": {
        "id": "struct_carbon",
        "name": "Carbon-Fiber Reinforced Polymer (CFRP)",
        "mass_kg": 110.0,
        "cost_million": 24.0,
        "radiation_shielding": 1.2,
        "thermal_conduction": "Low (Thermally Stable)",
        "reliability": 0.96,
        "description": "Ultra-lightweight advanced composite bus offering high structural rigidity and minimal thermal distortion."
    },
    "struct_vault": {
        "id": "struct_vault",
        "name": "Radiation-Hardened Titanium / Tantalum Vault",
        "mass_kg": 280.0,
        "cost_million": 45.0,
        "radiation_shielding": 3.8, # Heavy shielding
        "thermal_conduction": "Controlled",
        "reliability": 0.99,
        "description": "Armored avionics vault lined with tantalum and thick aluminum-titanium plates. Vital for surviving Jupiter's extreme radiation belt.",
        "nasa_note": "Modeled after the Juno and Europa Clipper radiation vaults."
    }
}

# Power Generation Subsystem (EPS)
POWER_GENERATION_OPTIONS: Dict[str, Dict[str, Any]] = {
    "pwr_silicon": {
        "id": "pwr_silicon",
        "name": "Deployable Silicon Solar Panels",
        "mass_kg": 60.0,
        "cost_million": 10.0,
        "base_power_w": 400.0, # At 1 AU (Earth/Moon)
        "type": "solar",
        "reliability": 0.92,
        "description": "Standard silicon photovoltaic arrays. Reliable at 1 AU; struggles at Mars; completely ineffective in Jupiter's orbit."
    },
    "pwr_ultraflex": {
        "id": "pwr_ultraflex",
        "name": "UltraFlex Gallium-Arsenide (GaAs) Arrays",
        "mass_kg": 120.0,
        "cost_million": 28.0,
        "base_power_w": 950.0, # High efficiency triple-junction
        "type": "solar",
        "reliability": 0.96,
        "description": "High-efficiency triple-junction cells mounted on deployable circular blankets. Strong performance at Mars; requires massive 100m² area at Europa.",
        "nasa_note": "Used on NASA Orion, Phoenix, and InSight."
    },
    "pwr_mmrtg": {
        "id": "pwr_mmrtg",
        "name": "Single MMRTG Radioisotope Generator",
        "mass_kg": 85.0,
        "cost_million": 65.0,
        "base_power_w": 180.0, # Continuous regardless of distance or sun occlusion!
        "type": "nuclear",
        "reliability": 0.99,
        "description": "Decay of Plutonium-238 delivers continuous electricity and thermal heat day and night, immune to dust storms and distance from the Sun.",
        "nasa_note": "Powering NASA Curiosity, Perseverance, and New Horizons."
    },
    "pwr_dual_mmrtg": {
        "id": "pwr_dual_mmrtg",
        "name": "Dual MMRTG Deep Space Nuclear Plant",
        "mass_kg": 165.0,
        "cost_million": 115.0,
        "base_power_w": 360.0, # High continuous deep-space output!
        "type": "nuclear",
        "reliability": 0.995,
        "description": "Two coupled radioisotope thermoelectric generators delivering 360W continuous power for flagship deep-space exploration.",
        "nasa_note": "Comparable to Cassini-Huygens multi-RTG power system."
    }
}

# Energy Storage / Batteries
BATTERY_OPTIONS: Dict[str, Dict[str, Any]] = {
    "bat_li_ion": {
        "id": "bat_li_ion",
        "name": "Standard Space-Grade Li-Ion Battery Pack",
        "mass_kg": 40.0,
        "cost_million": 8.0,
        "capacity_wh": 1200.0,
        "reliability": 0.93,
        "description": "Good specific energy density for standard eclipse durations (45-60 min). Needs careful thermal warming in deep space."
    },
    "bat_solid_state": {
        "id": "bat_solid_state",
        "name": "Advanced Solid-State Ceramic Battery",
        "mass_kg": 65.0,
        "cost_million": 22.0,
        "capacity_wh": 3200.0,
        "reliability": 0.98,
        "description": "Non-flammable electrolyte with wide operating thermal range (-50°C to +80°C). Provides massive energy reserve during extended occultations or lunar nights."
    }
}

# Communication Subsystem (RF / Optical)
COMMUNICATION_OPTIONS: Dict[str, Dict[str, Any]] = {
    "comm_s_band": {
        "id": "comm_s_band",
        "name": "S-Band Low-Gain Omnidirectional Antenna",
        "mass_kg": 18.0,
        "cost_million": 6.0,
        "power_w": 35.0,
        "max_data_rate_mb_day": 250.0, # Low rate
        "reliability": 0.97,
        "description": "Wide-angle broadcast antenna. Excellent for telemetry and emergency health pings, but severely throttles scientific imagery downlinks."
    },
    "comm_x_band": {
        "id": "comm_x_band",
        "name": "X-Band High-Gain Parabolic Dish (1.5m)",
        "mass_kg": 45.0,
        "cost_million": 18.0,
        "power_w": 85.0,
        "max_data_rate_mb_day": 2200.0,
        "reliability": 0.95,
        "description": "Standard deep-space scientific communication workhorse. Provides multi-megabit downlinks when pointed toward Earth ground stations."
    },
    "comm_ka_optical": {
        "id": "comm_ka_optical",
        "name": "Dual Ka-Band & Deep Space Optical Laser (DSOC)",
        "mass_kg": 75.0,
        "cost_million": 40.0,
        "power_w": 160.0,
        "max_data_rate_mb_day": 12000.0, # High bandwidth
        "reliability": 0.92,
        "description": "Cutting-edge hybrid radio and near-infrared laser transceiver. Delivers ultra-high-definition scientific data downlinks from interplanetary distances.",
        "nasa_note": "Tested on NASA Psyche mission, achieving 267 Mbps optical downlink from 31 million km."
    }
}

# Command & Data Handling (CDH / Avionics)
AVIONICS_OPTIONS: Dict[str, Dict[str, Any]] = {
    "av_cots": {
        "id": "av_cots",
        "name": "High-Performance COTS Dual-Core Flight Computer",
        "mass_kg": 15.0,
        "cost_million": 8.0,
        "power_w": 25.0,
        "storage_gb": 128.0,
        "rad_tolerance_krad": 25.0,
        "reliability": 0.88,
        "description": "Fast commercial processors with software error-detection. High computing power, but susceptible to single-event upsets in high radiation environments."
    },
    "av_rad750": {
        "id": "av_rad750",
        "name": "Radiation-Hardened BAE RAD750 Flight Computer",
        "mass_kg": 28.0,
        "cost_million": 22.0,
        "power_w": 40.0,
        "storage_gb": 64.0,
        "rad_tolerance_krad": 200.0,
        "reliability": 0.98,
        "description": "The gold-standard radiation-hardened spacecraft processor. Survived decades in deep space, solar storms, and planetary radiation belts.",
        "nasa_note": "Flight computer of Kepler, Mars Reconnaissance Orbiter, Curiosity, and James Webb Space Telescope."
    },
    "av_fault_tolerant": {
        "id": "av_fault_tolerant",
        "name": "Triple-Modular Redundant (TMR) Autonomous System",
        "mass_kg": 45.0,
        "cost_million": 38.0,
        "power_w": 75.0,
        "storage_gb": 512.0,
        "rad_tolerance_krad": 350.0,
        "reliability": 0.995,
        "description": "Three voting processor cores with onboard autonomous contingency response algorithms. Can resolve onboard anomalies without waiting for light-delayed ground commands."
    }
}

# Attitude Determination & Control System (ADCS) / Propulsion
PROPULSION_OPTIONS: Dict[str, Dict[str, Any]] = {
    "prop_cold_gas": {
        "id": "prop_cold_gas",
        "name": "Reaction Wheels & Cold-Gas Thrusters",
        "mass_kg": 40.0,
        "cost_million": 9.0,
        "power_w": 30.0,
        "delta_v_ms": 120.0,
        "reliability": 0.92,
        "description": "Pressurized nitrogen attitude control and 3-axis reaction wheel stabilization. Simple and clean, but minimal orbital change capability."
    },
    "prop_monoprop": {
        "id": "prop_monoprop",
        "name": "Hydrazine Monopropellant Propulsion System",
        "mass_kg": 140.0,
        "cost_million": 24.0,
        "power_w": 45.0,
        "delta_v_ms": 750.0,
        "reliability": 0.96,
        "description": "Catalytic hydrazine thrusters providing substantial delta-V for trajectory correction maneuvers, orbit insertion, and wheel desaturation."
    },
    "prop_ion": {
        "id": "prop_ion",
        "name": "NEXT-C Gridded Ion Propulsion / Hall Thruster",
        "mass_kg": 180.0,
        "cost_million": 48.0,
        "power_w": 180.0,
        "delta_v_ms": 3200.0,
        "reliability": 0.95,
        "description": "Electrostatic xenon gas thruster with exceptional specific impulse (Isp > 3100 s). High power draw, but enables ambitious orbital changes and deep space transfers.",
        "nasa_note": "Developed by NASA Glenn Research Center; flown on Dawn and DART."
    }
}

# Thermal Management Subsystem
THERMAL_OPTIONS: Dict[str, Dict[str, Any]] = {
    "thm_passive": {
        "id": "thm_passive",
        "name": "Passive Multi-Layer Insulation (MLI) & Heaters",
        "mass_kg": 25.0,
        "cost_million": 6.0,
        "power_w": 25.0,
        "reliability": 0.92,
        "description": "Mylar/Kapton reflective thermal blankets with small electrical survival heaters. Suitable for moderate thermal environments."
    },
    "thm_active": {
        "id": "thm_active",
        "name": "Variable Louvers & Heat Pipe Loop",
        "mass_kg": 55.0,
        "cost_million": 18.0,
        "power_w": 40.0,
        "reliability": 0.96,
        "description": "Ammonia heat pipes and mechanical bimetallic louvers that open and close to radiate excess heat or retain warmth dynamically."
    },
    "thm_nuclear_rhu": {
        "id": "thm_nuclear_rhu",
        "name": "Radioisotope Heater Units (RHU) & Fluid Loop",
        "mass_kg": 65.0,
        "cost_million": 32.0,
        "power_w": 15.0, # Very low electrical draw because heat is nuclear!
        "reliability": 0.99,
        "description": "Pellets of Pu-238 generating constant direct thermal heat without consuming electrical power. Essential for surviving cryogenic deep space (-220°C).",
        "nasa_note": "Used on Cassini, Galileo, and Europa Clipper to safeguard sensitive instruments."
    }
}

# -------------------------------------------------------------
# B. SPACE SEGMENT — SCIENTIFIC INSTRUMENTS
# -------------------------------------------------------------
INSTRUMENT_CATALOG: Dict[str, Dict[str, Any]] = {
    "camera": {
        "id": "camera",
        "name": "Multispectral High-Resolution Imager",
        "mass_kg": 28.0,
        "cost_million": 18.0,
        "power_w": 42.0,
        "data_rate_mb_day": 3500.0, # High data generation
        "reliability": 0.95,
        "science_val": 25,
        "description": "Telescopic framing camera with color filter wheels. Yields sub-meter surface topography, landing site safety scans, and geological structure models.",
        "nasa_analogue": "LROC (Lunar Reconnaissance Orbiter Camera) / HiRISE (Mars Reconnaissance Orbiter)"
    },
    "spectrometer": {
        "id": "spectrometer",
        "name": "Near-Infrared Imaging Spectrometer",
        "mass_kg": 32.0,
        "cost_million": 26.0,
        "power_w": 55.0,
        "data_rate_mb_day": 2100.0,
        "reliability": 0.94,
        "science_val": 30,
        "description": "Splits reflected sunlight into diagnostic wavelengths to identify minerals, hydrous salts, organic signatures, and atmospheric trace gases.",
        "nasa_analogue": "CRISM (Mars) / Moon Mineralogy Mapper (M3) / MISE (Europa Clipper)"
    },
    "radar": {
        "id": "radar",
        "name": "Subsurface Sounding Shallow Radar (SHARAD)",
        "mass_kg": 46.0,
        "cost_million": 34.0,
        "power_w": 85.0,
        "data_rate_mb_day": 1800.0,
        "reliability": 0.93,
        "science_val": 32,
        "description": "Emits radio waves to penetrate dielectric surfaces up to several kilometers. Detects buried polar ice, lava tubes, and subsurface liquid reservoirs.",
        "nasa_analogue": "SHARAD (MRO) / REASON (Europa Clipper)"
    },
    "thermal_sensor": {
        "id": "thermal_sensor",
        "name": "Thermal Infrared Radiometer & Bolometer",
        "mass_kg": 16.0,
        "cost_million": 14.0,
        "power_w": 28.0,
        "data_rate_mb_day": 650.0,
        "reliability": 0.96,
        "science_val": 20,
        "description": "Measures emitted thermal energy day and night to calculate surface thermal inertia, regolith grain size, and local thermal anomalies/hotspots.",
        "nasa_analogue": "Diviner (LRO) / THEMIS (Mars Odyssey) / E-THEMIS (Europa Clipper)"
    },
    "particle_detector": {
        "id": "particle_detector",
        "name": "Fluxgate Magnetometer & Particle Detector",
        "mass_kg": 22.0,
        "cost_million": 20.0,
        "power_w": 30.0,
        "data_rate_mb_day": 400.0,
        "reliability": 0.97,
        "science_val": 22,
        "description": "Measures magnetic field dynamics, plasma interactions, and cosmic ray fluxes. Crucial for detecting induction in subsurface saline oceans.",
        "nasa_analogue": "ECM (Europa Clipper Magnetometer) / MAVEN Magnetometer"
    }
}

# -------------------------------------------------------------
# D. GROUND & USER SEGMENTS
# -------------------------------------------------------------
GROUND_SEGMENT_OPTIONS: Dict[str, Dict[str, Any]] = {
    "ground_university": {
        "id": "ground_university",
        "name": "Regional University / Commercial Ground Net",
        "cost_million": 8.0,
        "contact_hours_day": 4.0,
        "downlink_efficiency": 0.65,
        "reliability": 0.88,
        "description": "Single-hemisphere tracking dish with limited daily contact passes. Low cost, but data transmission bottlenecks occur if buffer is small.",
        "pros": "Inexpensive; ideal for low-budget Lunar demonstrators.",
        "cons": "No coverage during 16-20 hours of Earth rotation; risky for emergency recoveries."
    },
    "ground_nsn": {
        "id": "ground_nsn",
        "name": "NASA Near Space Network (NSN) Commercial Alliance",
        "cost_million": 24.0,
        "contact_hours_day": 12.0,
        "downlink_efficiency": 0.90,
        "reliability": 0.95,
        "description": "Global distributed ground stations providing consistent contact windows for missions up to 2 million km from Earth.",
        "pros": "High availability, automated handover, ideal for Moon and cislunar missions.",
        "cons": "Limited gain for deep interplanetary links beyond Mars.",
        "nasa_note": "NASA NSN manages communications from Low Earth Orbit out to 2 million kilometers."
    },
    "ground_dsn_34m": {
        "id": "ground_dsn_34m",
        "name": "NASA Deep Space Network (DSN) 34m Beam Waveguide",
        "cost_million": 45.0,
        "contact_hours_day": 18.0,
        "downlink_efficiency": 0.96,
        "reliability": 0.98,
        "description": "Continuous 24/7 global coverage through Goldstone (California), Madrid (Spain), and Canberra (Australia). Standard deep-space baseline.",
        "pros": "Continuous link through Earth rotation; supported all NASA Mars and Jupiter probes.",
        "cons": "Higher operational cost and strict scheduling allocations.",
        "nasa_note": "JPL Deep Space Network standard 34-meter high-efficiency antenna system."
    },
    "ground_dsn_70m": {
        "id": "ground_dsn_70m",
        "name": "NASA DSN 70m Antenna Array + High-Rate Relay",
        "cost_million": 75.0,
        "contact_hours_day": 24.0,
        "downlink_efficiency": 1.0,
        "reliability": 0.99,
        "description": "The most sensitive scientific receiving facilities on Earth. Massive 70-meter paraboloids arrayed for maximum data extraction from the outer planets.",
        "pros": "Maximizes science data downlink rate; extracts faint signals through solar conjunctions and radiation noise.",
        "cons": "Premium price; reserved for high-priority flagship missions.",
        "nasa_note": "70-meter antennas at Goldstone, Madrid, and Canberra represent humanity's farthest listening ears."
    }
}

USER_SEGMENT_OPTIONS: Dict[str, Dict[str, Any]] = {
    "user_academic": {
        "id": "user_academic",
        "name": "Single University Science Working Group",
        "cost_million": 6.0,
        "science_pipeline_multiplier": 1.0,
        "description": "Focused academic research team. Produces focused papers but slower pipeline processing for broad public science release."
    },
    "user_multicenter": {
        "id": "user_multicenter",
        "name": "NASA Multi-Center & International Science Team",
        "cost_million": 18.0,
        "science_pipeline_multiplier": 1.35,
        "description": "Collaborative consortium of NASA Centers (JPL, Goddard, Ames) and international partners. Rapid calibrated data validation and maximum publication impact."
    },
    "user_open_pds": {
        "id": "user_open_pds",
        "name": "NASA Planetary Data System (PDS) Rapid Open Pipeline",
        "cost_million": 32.0,
        "science_pipeline_multiplier": 1.6,
        "description": "Immediate automated ingestion, machine-learning feature classification, and public archival on the NASA Planetary Data System.",
        "nasa_note": "The NASA PDS archives and distributes planetary data to scientists and public worldwide."
    }
}

