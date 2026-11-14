"""
MISSIONS MODULE
===============
BEYOND THE ORBIT - Space Mission Design Game
Defines the three official mission profiles:
1. Lunar Explorer (Moon)
2. Mars Discovery (Mars)
3. Europa Frontier (Europa / Jovian System)

Each mission has unique scientific objectives, planetary constraints,
budget allocations, recommended architectures, and risk factors.
"""

from typing import Dict, Any, List

MISSIONS: Dict[str, Dict[str, Any]] = {
    "lunar_explorer": {
        "id": "lunar_explorer",
        "name": "Lunar Explorer",
        "tagline": "Unlocking the Secrets of the Lunar Regolith & Permanently Shadowed Craters",
        "destination": "Moon",
        "difficulty": "Cadet (Introductory)",
        "difficulty_stars": "★★☆☆☆",
        "budget_million": 300.0,
        "primary_target": "South Pole-Aitken Basin & Shackleton Crater",
        "overview": (
            "Embark on a high-precision lunar mission to survey polar ice deposits, "
            "map geochemical surface compositions, and establish critical data corridors "
            "for sustained exploration. The harsh 14-day lunar night and rugged surface "
            "terrain will test your power storage and navigation systems."
        ),
        "scientific_objectives": [
            {
                "id": "lunar_obj_1",
                "title": "Map Volatiles & Water Ice in Cold Traps",
                "instrument_req": ["radar", "thermal_sensor"],
                "points": 35,
                "description": "Probe Permanently Shadowed Regions (PSRs) at the lunar south pole for subsurface hydrogen signatures."
            },
            {
                "id": "lunar_obj_2",
                "title": "High-Resolution Geomorphic Topography",
                "instrument_req": ["camera"],
                "points": 30,
                "description": "Produce sub-meter digital elevation models of potential landing corridors and pyroclastic deposits."
            },
            {
                "id": "lunar_obj_3",
                "title": "Mineralogical & Titanium-Iron Survey",
                "instrument_req": ["spectrometer"],
                "points": 35,
                "description": "Characterize ilmenite and anorthosite abundances across basaltic maria and highlands."
            }
        ],
        "challenges": [
            "Surviving 14 Earth days of lunar darkness (-130°C to -170°C cold sink)",
            "Line-of-sight occultations when surveying polar crater floors or far side",
            "Fine, abrasive lunar regolith and electrostatic dust levitation"
        ],
        "suggested_architectures": [
            {
                "id": "polar_low_orbit",
                "name": "Low Lunar Polar Orbit (100 km)",
                "description": "Provides global surface coverage over 28 days as the Moon rotates beneath the orbital plane.",
                "complexity_cost": 25.0,
                "complexity_mass": 180.0,
                "science_multiplier": 1.25,
                "power_penalty_factor": 1.1,
                "comm_window_pct": 92
            },
            {
                "id": "frozen_eccentric_orbit",
                "name": "Frozen Elliptical Halo Orbit (Perilune 30 km)",
                "description": "Minimizes station-keeping fuel while providing high-resolution low-altitude passes over the South Pole.",
                "complexity_cost": 35.0,
                "complexity_mass": 230.0,
                "science_multiplier": 1.35,
                "power_penalty_factor": 1.0,
                "comm_window_pct": 85
            },
            {
                "id": "direct_descent_lander",
                "name": "Direct Descent Soft Lander",
                "description": "Places payload on the surface for in-situ drilling and stationary spectral analysis.",
                "complexity_cost": 65.0,
                "complexity_mass": 480.0,
                "science_multiplier": 1.5,
                "power_penalty_factor": 1.4,
                "comm_window_pct": 75
            }
        ],
        "environmental_threats": {
            "solar_flux_scale": 1.0,     # 100% of 1 AU solar flux
            "radiation_severity": "Moderate",
            "dust_threat": "Abrasive / Electrostatic",
            "communication_delay_s": 1.3
        }
    },

    "mars_discovery": {
        "id": "mars_discovery",
        "name": "Mars Discovery",
        "tagline": "Investigating Past Habitable Climates, Seasonal Methane & Global Dust Cycles",
        "destination": "Mars",
        "difficulty": "Flight Director (Intermediate)",
        "difficulty_stars": "★★★★☆",
        "budget_million": 550.0,
        "primary_target": "Jezero Crater & Valles Marineris",
        "overview": (
            "Launch an interplanetary expedition across millions of kilometers to decode "
            "the atmospheric loss mechanisms and sedimentary history of the Red Planet. "
            "Navigate the 4 to 24 minute communication lag, solar energy loss, and sudden "
            "planet-encircling dust storms that blanket solar panels."
        ),
        "scientific_objectives": [
            {
                "id": "mars_obj_1",
                "title": "Subsurface Paleohydrology & Ice Shelves",
                "instrument_req": ["radar", "spectrometer"],
                "points": 35,
                "description": "Sound subsurface sedimentary beds and buried glaciers up to 1.5 km depth."
            },
            {
                "id": "mars_obj_2",
                "title": "Atmospheric Trace Gas & Methane Monitoring",
                "instrument_req": ["spectrometer", "particle_detector"],
                "points": 35,
                "description": "Detect seasonal methane fluctuations and trace gas plumes associated with sub-surface activity."
            },
            {
                "id": "mars_obj_3",
                "title": "High-Resolution Geomorphology & Dunes",
                "instrument_req": ["camera", "thermal_sensor"],
                "points": 30,
                "description": "Track active dust devil dynamics, recurring slope lineae (RSL), and ancient delta deposits."
            }
        ],
        "challenges": [
            "Severe solar irradiance reduction (~589 W/m² vs 1361 W/m² at Earth)",
            "Planet-wide dust storms blocking up to 80% of sunlight for months",
            "Speed-of-light communication delays (4 to 24 minutes one-way) requiring autonomous fault protection",
            "Aerodynamic entry and interplanetary transit thermal extremes"
        ],
        "suggested_architectures": [
            {
                "id": "sun_sync_areocentric",
                "name": "Sun-Synchronous Low Mars Orbit (300 km)",
                "description": "Passes over targets at constant local solar time (ideal for repeatable illumination and shadow analysis).",
                "complexity_cost": 45.0,
                "complexity_mass": 320.0,
                "science_multiplier": 1.3,
                "power_penalty_factor": 1.15,
                "comm_window_pct": 88
            },
            {
                "id": "aerobraking_elliptical",
                "name": "Aerobraking Elliptical Relay Orbit",
                "description": "Uses Mars's upper atmosphere to trim orbital speed, saving propellant mass while providing dual science and relay services.",
                "complexity_cost": 60.0,
                "complexity_mass": 420.0,
                "science_multiplier": 1.4,
                "power_penalty_factor": 1.25,
                "comm_window_pct": 78
            },
            {
                "id": "mars_surface_lander_pack",
                "name": "Guided Entry Aero-Shell & Surface Station",
                "description": "Employs heat shield and retro-propulsion to conduct long-term surface meteorology and soil science.",
                "complexity_cost": 110.0,
                "complexity_mass": 850.0,
                "science_multiplier": 1.6,
                "power_penalty_factor": 1.6,
                "comm_window_pct": 65
            }
        ],
        "environmental_threats": {
            "solar_flux_scale": 0.43,    # 43% of Earth solar flux!
            "radiation_severity": "Elevated (GCR + Solar Flare Events)",
            "dust_threat": "Global Dust Storms (Opacity Tau > 3.0)",
            "communication_delay_s": 750.0 # ~12.5 minutes average
        }
    },

    "europa_frontier": {
        "id": "europa_frontier",
        "name": "Europa Frontier",
        "tagline": "Probing the Hidden Ocean & Cryovolcanic Plumes in Jupiter's Radiation Inferno",
        "destination": "Europa",
        "difficulty": "Mission Director (Advanced)",
        "difficulty_stars": "★★★★★",
        "budget_million": 920.0,
        "primary_target": "Conamara Chaos & Thrace Macula Ice Plumes",
        "overview": (
            "Venture into the outer Solar System to Jupiter's icy moon Europa, which conceals "
            "a global liquid water ocean with more volume than all of Earth's oceans combined. "
            "Survive Jupiter's colossal trapped radiation belt, manage power with only 3.7% "
            "of Earth's solar energy, and buffer data over a 45-minute light-speed chasm."
        ),
        "scientific_objectives": [
            {
                "id": "europa_obj_1",
                "title": "Sound Ice Shell Thickness & Ocean Interface",
                "instrument_req": ["radar", "particle_detector"],
                "points": 40,
                "description": "Penetrate the 15-25 km thick floating ice shell to verify liquid water pockets and depth of ocean floor."
            },
            {
                "id": "europa_obj_2",
                "title": "Cryoplume & Salt-Organic Characterization",
                "instrument_req": ["spectrometer", "camera"],
                "points": 35,
                "description": "Perform in-situ mass spectrometry on vented vapor plumes for sodium chloride and prebiotic organics."
            },
            {
                "id": "europa_obj_3",
                "title": "Induced Magnetic Dipole & Ocean Salinity",
                "instrument_req": ["particle_detector", "thermal_sensor"],
                "points": 25,
                "description": "Measure Jupiter-induced magnetic currents to calculate ocean conductivity, temperature, and salt content."
            }
        ],
        "challenges": [
            "Lethal Jovian magnetospheric radiation belt (~5,400 mSv/day dose)",
            "Inverse-square law solar starvation: 50.3 W/m² (solar panels must be huge or MMRTG nuclear is required)",
            "Radio light delay of 35 to 52 minutes, requiring complete onboard autonomy",
            "Cryogenic temperatures (-220°C) demanding active thermal management"
        ],
        "suggested_architectures": [
            {
                "id": "jupiter_flyby_resonance",
                "name": "Multiple Europa Flyby Trajectory (Jovian Resonance)",
                "description": "Dips quickly into Europa's radiation zone during close flybys (25 km altitude) and retreats out to safety, modeled after NASA's Europa Clipper.",
                "complexity_cost": 85.0,
                "complexity_mass": 550.0,
                "science_multiplier": 1.45,
                "power_penalty_factor": 1.2,
                "comm_window_pct": 82
            },
            {
                "id": "dedicated_europa_orbiter",
                "name": "Dedicated Europa Polar Orbiter (High-Risk/High-Reward)",
                "description": "Injects directly into a 100 km orbit around Europa. Unprecedented science data, but exposed to continuous, brutal radiation doses.",
                "complexity_cost": 150.0,
                "complexity_mass": 980.0,
                "science_multiplier": 1.75,
                "power_penalty_factor": 1.5,
                "comm_window_pct": 70
            },
            {
                "id": "surface_penetrator_package",
                "name": "Orbiter + Cryo-Penetrator Surface Dart",
                "description": "Deploys a hardened kinetic penetrator into the chaos ice crust to sample surface chemistry directly.",
                "complexity_cost": 190.0,
                "complexity_mass": 1250.0,
                "science_multiplier": 1.9,
                "power_penalty_factor": 1.7,
                "comm_window_pct": 55
            }
        ],
        "environmental_threats": {
            "solar_flux_scale": 0.037,   # Extreme! Only 3.7% solar flux!
            "radiation_severity": "Lethal (Jupiter Magnetosphere, ~5.4 Sv/day)",
            "dust_threat": "Micrometeoroid & E-ring particles",
            "communication_delay_s": 2400.0 # ~40 minutes average
        }
    }
}

def get_mission(mission_id: str) -> Dict[str, Any]:
    """Retrieve mission profile by ID."""
    return MISSIONS.get(mission_id, MISSIONS["lunar_explorer"])

def list_missions() -> List[Dict[str, Any]]:
    """Return all available mission profiles."""
    return list(MISSIONS.values())

