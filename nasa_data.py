"""
NASA DATA & OFFICIAL CHALLENGE ALIGNMENT MODULE
================================================
BEYOND THE ORBIT - Space Mission Design Game
NASA Space Apps Challenge 2026 - Faisalabad Local Event | Team Orbitera

Official NASA Resources Used:
1. NASA "Design and Develop Science Missions" (Science Mission Directorate)
   - Four Mission Segments: Launch, Space, Ground, and User Segments.
   - Source: https://science.nasa.gov/learn/design-and-develop-science-missions/
2. NASA Planetary Fact Sheets (NASA Goddard Space Flight Center - Dr. David R. Williams)
   - Planetary physics, solar irradiance (W/m²), gravity, distances, light travel time.
   - Source: https://nssdc.gsfc.nasa.gov/planetary/factsheet/
3. NASA Systems Engineering Handbook (NASA/SP-2016-6105 Rev 2)
   - Margin policies: 20% mass contingency, power budget margins, thermal limits.
   - Source: https://www.nasa.gov/reference/systems-engineering-handbook/
4. NASA CubeSat 101: Basic Concepts and Processes for First-Time CubeSat Developers
   - Subsystem decomposition: Bus, Comms, EPS, ADCS, CDH, Thermal, Payload.
   - Source: https://www.nasa.gov/reference/cubesat-101/
5. NASA Deep Space Network (DSN) Telecommunications Link Design Handbooks (JPL D-16838)
   - Antennas (34m BWG, 70m), frequencies (X-band, Ka-band), light time delays.
   - Source: https://deepspace.jpl.nasa.gov/about/
6. NASA JPL Concept Maturity Levels (CML)
   - Mission readiness frameworks from Concept (CML 1-3) to PDR/Launch Ready (CML 6+).
   - Source: https://www.jpl.nasa.gov/
"""

from typing import Dict, Any, List

# Official NASA Reference Registry
NASA_REFERENCES = [
    {
        "id": "nasa_smd_segments",
        "title": "Design and Develop Science Missions",
        "agency": "NASA Science Mission Directorate (SMD)",
        "url": "https://science.nasa.gov/learn/design-and-develop-science-missions/",
        "concept_used": "The Four Mission Segments architecture: Launch Segment, Space Segment, Ground Segment, and User Segment.",
        "in_game_location": "Mission Planning Screen (Tabs A, B, C, D) and Debrief Report."
    },
    {
        "id": "nasa_fact_sheets",
        "title": "NASA Planetary Fact Sheets",
        "agency": "NASA Goddard Space Flight Center (GSFC)",
        "url": "https://nssdc.gsfc.nasa.gov/planetary/factsheet/",
        "concept_used": "Verified physical constants: solar irradiance (Moon 1361 W/m², Mars 589 W/m², Europa 50 W/m²), light delays, surface gravity, surface temperatures.",
        "in_game_location": "Mission Selection, Power Calculations (1/r² solar degradation), and Telemetry Feeds."
    },
    {
        "id": "nasa_se_handbook",
        "title": "NASA Systems Engineering Handbook (NASA/SP-2016-6105 Rev 2)",
        "agency": "NASA Headquarters / NASA Technical Reports Server",
        "url": "https://www.nasa.gov/reference/systems-engineering-handbook/",
        "concept_used": "Engineering contingency margins: 20% mass margin, power margin balance, single-point failure mitigations.",
        "in_game_location": "Live Mission Design Validation Panel (Ready/Attention/Blocked logic)."
    },
    {
        "id": "nasa_dsn_specs",
        "title": "NASA Deep Space Network (DSN) Capabilities Handbook",
        "agency": "NASA Jet Propulsion Laboratory (JPL)",
        "url": "https://deepspace.jpl.nasa.gov/about/",
        "concept_used": "Deep Space Network 34m Beam Waveguide & 70m Goldstone/Madrid/Canberra ground support, X-band/Ka-band data transfer rates, and radio light-delay constraints.",
        "in_game_location": "Ground Segment Planning, Mission Simulation Telemetry, and Comms Drop events."
    },
    {
        "id": "nasa_cubesat_101",
        "title": "CubeSat 101: Basic Concepts and Processes for First-Time Developers",
        "agency": "NASA Small Spacecraft Technology Program",
        "url": "https://www.nasa.gov/reference/cubesat-101/",
        "concept_used": "Spacecraft subsystem hierarchy: Structure, EPS (Electrical Power), CDH (Command & Data), ADCS (Attitude Control), Comms, Thermal, and Scientific Payload.",
        "in_game_location": "Space Segment Configuration."
    }
]

# Verified Planetary Data Parameters from NASA Fact Sheets
PLANETARY_DATA: Dict[str, Dict[str, Any]] = {
    "Moon": {
        "distance_km": 384400,
        "solar_irradiance_wm2": 1361.0,  # 1.0 AU
        "light_time_one_way_s": 1.28,    # 1.28 seconds
        "gravity_ms2": 1.62,
        "surface_temp_range_c": "-130°C to +120°C",
        "day_night_cycle": "14.7 Earth days night / 14.7 Earth days day",
        "atmosphere": "Exosphere only (Vacuum: ~10^-12 bar)",
        "radiation_env": "Moderate (Galactic Cosmic Rays + Solar Energetic Particles; no protective magnetic field)",
        "nasa_missions": "Apollo, Lunar Reconnaissance Orbiter (LRO), LCROSS, Artemis, VIPER",
        "key_scientific_questions": [
            "Permanently Shadowed Regions (PSRs) water ice abundance at South Pole",
            "Lunar regolith composition and titanium/iron mineralogy",
            "Crustal thickness and seismic activity"
        ]
    },
    "Mars": {
        "distance_km": 225000000,        # Mean: 1.52 AU (~225M km, 55M to 401M km)
        "solar_irradiance_wm2": 589.0,   # ~43% of Earth's solar flux
        "light_time_one_way_s": 750.0,   # ~12.5 minutes (ranges 4 to 24 min)
        "gravity_ms2": 3.72,
        "surface_temp_range_c": "-125°C to +20°C",
        "day_night_cycle": "Sol: 24h 39m 35s",
        "atmosphere": "Thin CO2 (0.006 bar / ~6 mbar)",
        "radiation_env": "Elevated (Minimal magnetic field, thin atmosphere; ~250-300 mSv/year)",
        "nasa_missions": "Viking 1/2, Mars Pathfinder, MRO, Curiosity, InSight, Perseverance, Ingenuity",
        "key_scientific_questions": [
            "Evidence of ancient habitable lacustrine and river delta environments",
            "Seasonal methane variations and atmospheric loss mechanisms (MAVEN data)",
            "Subsurface permafrost and hydrological history"
        ]
    },
    "Europa": {
        "distance_km": 628300000,        # ~5.2 AU (~628M km mean)
        "solar_irradiance_wm2": 50.3,    # Only ~3.7% of Earth's solar flux! (Severe power penalty)
        "light_time_one_way_s": 2095.0,  # ~35 to 52 minutes one-way
        "gravity_ms2": 1.315,
        "surface_temp_range_c": "-220°C to -160°C",
        "day_night_cycle": "3.55 Earth days (tidally locked to Jupiter)",
        "atmosphere": "Tenuous oxygen exosphere (~10^-12 bar)",
        "radiation_env": "Extreme (Trapped in Jupiter's lethal magnetosphere radiation belt; ~5.4 Sv/day surface dose)",
        "nasa_missions": "Galileo, New Horizons flyby, Juno, Europa Clipper (launched Oct 2024)",
        "key_scientific_questions": [
            "Subsurface ocean salinity, depth (60-150 km), and contact with rocky mantle",
            "Ice shell thickness and chaos terrain cryovolcanic exchange",
            "Organic compound signatures and habitability indices"
        ]
    }
}

def get_nasa_fact_callout(destination: str, topic: str) -> str:
    """Returns verified NASA factual annotations for educational tooltips."""
    data = PLANETARY_DATA.get(destination, {})
    if topic == "solar":
        irr = data.get("solar_irradiance_wm2", 1361)
        ratio = round((irr / 1361.0) * 100, 1)
        return (
            f"**[NASA Fact GSFC]** Solar irradiance at {destination} is **{irr} W/m²** "
            f"({ratio}% of Earth orbit). Solar panels generate significantly less power "
            f"due to the inverse-square law ($1/r^2$)."
        )
    elif topic == "comms":
        lt_s = data.get("light_time_one_way_s", 1.28)
        if lt_s < 60:
            delay_str = f"{lt_s} seconds"
        else:
            delay_str = f"{round(lt_s / 60, 1)} minutes"
        return (
            f"**[NASA DSN Specification]** One-way radio light travel time to {destination} "
            f"is approximately **{delay_str}**. Real-time joystick control is impossible; "
            f"spacecraft autonomy and Command & Data Handling (CDH) are critical."
        )
    elif topic == "radiation":
        rad = data.get("radiation_env", "Unknown")
        return (
            f"**[NASA Planetary Science]** Radiation Environment: **{rad}**. "
            f"Electronic components risk Single Event Upsets (SEU) or total ionizing dose failure "
            f"without radiation-hardened components or shielding."
        )
    return "Verified NASA Mission Concept."

