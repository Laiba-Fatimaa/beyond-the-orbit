/**
 * NASA DATA & OFFICIAL CHALLENGE ALIGNMENT
 * ========================================
 * BEYOND THE ORBIT - Space Mission Design Game
 * Team Orbitera | NASA Space Apps Challenge 2026
 * 
 * Verified NASA Resources:
 * 1. NASA Science Mission Directorate (SMD) - Four-Segment Architecture
 * 2. NASA Goddard Space Flight Center (GSFC) - Planetary Fact Sheets
 * 3. NASA Systems Engineering Handbook (SP-2016-6105 Rev 2) - Margin Policies
 * 4. NASA CubeSat 101 - Spacecraft Subsystems
 * 5. NASA Deep Space Network (DSN) - Telecommunications Link Capabilities
 */

const NASA_DATA = {
    references: [
        {
            id: "nasa_smd_segments",
            title: "Design and Develop Science Missions",
            agency: "NASA Science Mission Directorate (SMD)",
            url: "https://science.nasa.gov/learn/design-and-develop-science-missions/",
            concept: "The Four Mission Segments architecture: Launch, Space, Ground, and User Segments.",
            location: "Mission Planning (Tabs A-D) and Debrief Summary."
        },
        {
            id: "nasa_fact_sheets",
            title: "Planetary Fact Sheets",
            agency: "NASA Goddard Space Flight Center (GSFC)",
            url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/",
            concept: "Verified solar irradiance (Moon 1361 W/m², Mars 589 W/m², Europa 50.3 W/m²), light travel times, and gravity.",
            location: "Destination Selection, Power calculations (1/r² decay), and Telemetry."
        },
        {
            id: "nasa_se_handbook",
            title: "NASA Systems Engineering Handbook (NASA/SP-2016-6105 Rev 2)",
            agency: "NASA Headquarters",
            url: "https://www.nasa.gov/reference/systems-engineering-handbook/",
            concept: "Systems contingency margins: 15–20% mass reserve, power margin buffers, single-point failure mitigations.",
            location: "Live 3-State Flight Readiness Validation Engine."
        },
        {
            id: "nasa_dsn_specs",
            title: "Deep Space Network (DSN) Capabilities Handbook",
            agency: "NASA Jet Propulsion Laboratory (JPL)",
            url: "https://deepspace.jpl.nasa.gov/about/",
            concept: "34m Beam Waveguide & 70m Goldstone/Madrid/Canberra ground support, X-band/Ka-band links, light time delays.",
            location: "Ground Segment, Mission Simulation Telemetry, and Comms Drop scenarios."
        },
        {
            id: "nasa_cubesat_101",
            title: "CubeSat 101: Basic Concepts and Processes for Developers",
            agency: "NASA Small Spacecraft Technology Program",
            url: "https://www.nasa.gov/reference/cubesat-101/",
            concept: "Spacecraft subsystem hierarchy: Bus, EPS, CDH, ADCS, Comms, Thermal, and Scientific Payload.",
            location: "Spacecraft Engineering Lab."
        }
    ],

    planetaryFactSheets: {
        "Moon": {
            distance_km: 384400,
            solar_irradiance_wm2: 1361.0,
            light_time_one_way_s: 1.28,
            gravity_ms2: 1.62,
            surface_temp_range_c: "-130°C to +120°C",
            atmosphere: "Exosphere only (Vacuum: ~10^-12 bar)",
            radiation_env: "Moderate (Galactic Cosmic Rays + SEP; no magnetic shield)",
            nasa_missions: "Apollo, Lunar Reconnaissance Orbiter (LRO), LCROSS, Artemis, VIPER",
            key_questions: [
                "Water ice abundance in Permanently Shadowed Regions (PSRs)",
                "Regolith composition and titanium/iron basaltic mineralogy",
                "Crustal thickness and seismic heat flow"
            ]
        },
        "Mars": {
            distance_km: 225000000,
            solar_irradiance_wm2: 589.0, // ~43% of 1 AU
            light_time_one_way_s: 750.0, // ~12.5 minutes
            gravity_ms2: 3.72,
            surface_temp_range_c: "-125°C to +20°C",
            atmosphere: "Thin CO2 (0.006 bar / 6 mbar)",
            radiation_env: "Elevated (Minimal magnetic field; ~250-300 mSv/yr)",
            nasa_missions: "Viking, Mars Pathfinder, MRO, Curiosity, InSight, Perseverance, Ingenuity",
            key_questions: [
                "Paleohydrology and lacustrine habitable environments",
                "Seasonal methane fluctuations and atmospheric escape (MAVEN data)",
                "Subsurface permafrost and glacial deposits"
            ]
        },
        "Europa": {
            distance_km: 628300000,
            solar_irradiance_wm2: 50.3, // ~3.7% of 1 AU!
            light_time_one_way_s: 2095.0, // ~35 to 52 minutes
            gravity_ms2: 1.315,
            surface_temp_range_c: "-220°C to -160°C",
            atmosphere: "Tenuous oxygen exosphere (~10^-12 bar)",
            radiation_env: "Extreme (Trapped in Jupiter's lethal magnetosphere radiation belt; ~5.4 Sv/day)",
            nasa_missions: "Galileo, New Horizons flyby, Juno, Europa Clipper (launched Oct 2024)",
            key_questions: [
                "Subsurface ocean salinity, depth (60-150 km), and contact with rocky mantle",
                "Ice shell thickness and chaos terrain cryovolcanic plume venting",
                "Prebiotic organic compounds and habitability markers"
            ]
        }
    },

    getCallout(destination, topic) {
        const data = this.planetaryFactSheets[destination] || {};
        if (topic === "solar") {
            const irr = data.solar_irradiance_wm2 || 1361;
            const pct = ((irr / 1361.0) * 100).toFixed(1);
            return `[NASA GSFC Fact] Solar irradiance at ${destination} is ${irr} W/m² (${pct}% of Earth orbit). Photovoltaics suffer quadratic power degradation (1/r²).`;
        }
        if (topic === "comms") {
            const delay = data.light_time_one_way_s >= 60 
                ? `${(data.light_time_one_way_s / 60).toFixed(1)} minutes` 
                : `${data.light_time_one_way_s} seconds`;
            return `[NASA DSN Spec] One-way radio light travel time is ~${delay}. Real-time joystick control is physically impossible; autonomy is required.`;
        }
        if (topic === "radiation") {
            return `[NASA Planetary Fact] Radiation Environment: ${data.radiation_env}. Unshielded electronics suffer severe cumulative ionizing damage.`;
        }
        return "Verified NASA Mission Concept.";
    }
};

if (typeof module !== "undefined") {
    module.exports = NASA_DATA;
}

