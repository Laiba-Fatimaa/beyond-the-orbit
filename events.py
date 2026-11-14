"""
MISSION EVENTS & DECISION SYSTEM
=================================
BEYOND THE ORBIT - Space Mission Design Game
Defines realistic, destination-specific interactive scenarios,
branching choices, and configuration-dependent consequences.
"""

from typing import Dict, Any, List, Tuple

MISSION_EVENTS: Dict[str, List[Dict[str, Any]]] = {
    "lunar_explorer": [
        {
            "id": "lunar_evt_1",
            "title": "Trans-Lunar Injection Burn Deviation",
            "phase": "Trans-Lunar Injection (TLI)",
            "description": (
                "During the upper-stage burn toward the Moon, slight thrust vector "
                "oscillations introduce a 2.4 m/s velocity dispersion. A correction maneuver "
                "is necessary to prevent a lunar flyby overshoot."
            ),
            "nasa_context": (
                "NASA Apollo and Artemis trajectories use Trajectory Correction Maneuvers (TCMs) "
                "to ensure accurate insertion into lunar orbit."
            ),
            "choices": [
                {
                    "id": "c1",
                    "text": "Execute immediate active RCS burn to trim trajectory",
                    "explanation": "Consumes onboard fuel/power but restores nominal orbital trajectory.",
                    "requires_stat": "propulsion",
                    "effect_fn": "handle_lunar_tli_burn"
                },
                {
                    "id": "c2",
                    "text": "Coast and perform a combined insertion trim closer to the Moon",
                    "explanation": "Conserves immediate fuel, but increases required delta-V later and risks navigational dispersion.",
                    "effect_fn": "handle_lunar_tli_coast"
                }
            ]
        },
        {
            "id": "lunar_evt_2",
            "title": "Descent into Polar Crater Shadow (Lunar Night)",
            "phase": "Low Lunar Polar Orbit",
            "description": (
                "The spacecraft enters the shadow of Shackleton Crater at the Lunar South Pole. "
                "Solar panels stop producing electricity, and temperatures plummet to -160°C. "
                "Thermal heaters and batteries are engaged."
            ),
            "nasa_context": (
                "NASA Lunar Reconnaissance Orbiter (LRO) experiences periodic eclipses where "
                "instruments switch to low-power keep-alive modes to protect optics from freezing."
            ),
            "choices": [
                {
                    "id": "c1",
                    "text": "Enter Safe Cold-Soak Mode (Shut down scientific instruments)",
                    "explanation": "Protects battery reserves and thermal stability, but halts science observations during the pass.",
                    "effect_fn": "handle_lunar_shadow_safe"
                },
                {
                    "id": "c2",
                    "text": "Keep Subsurface Radar Active to Sound Frozen Shadowed Traps",
                    "explanation": "Drains electrical storage, but yields invaluable subsurface water ice signatures.",
                    "effect_fn": "handle_lunar_shadow_science"
                }
            ]
        },
        {
            "id": "lunar_evt_3",
            "title": "Electrostatic Regolith Dust Levitating Over Terminator",
            "phase": "Primary Mapping Survey",
            "description": (
                "Passing over the lunar day-night terminator, solar ultraviolet light charges fine "
                "sub-micron regolith particles, levitating dust clouds up to orbital altitude. "
                "Dust adhesion threatens optical camera lenses."
            ),
            "nasa_context": (
                "First observed by Apollo astronauts (lunar horizon glow) and investigated by NASA LADEE, "
                "electrostatic dust lofting is a major hazard for lunar exploration."
            ),
            "choices": [
                {
                    "id": "c1",
                    "text": "Rotate spacecraft 180° to keep optical apertures in the wake",
                    "explanation": "Safeguards camera optics, but temporarily misaligns high-gain earth communication dish.",
                    "effect_fn": "handle_lunar_dust_rotate"
                },
                {
                    "id": "c2",
                    "text": "Activate electrostatic lens repeller rings at higher power",
                    "explanation": "Maintains telescope orientation while consuming 35W extra electrical power.",
                    "effect_fn": "handle_lunar_dust_repel"
                }
            ]
        },
        {
            "id": "lunar_evt_4",
            "title": "Serendipitous Cabeus Crater Volatile Detection",
            "phase": "Deep Science Phase",
            "description": (
                "The near-infrared spectrometer detects an anomalous hydroxyl/water absorption "
                "band (2.8 microns) in Cabeus Crater floor ejecta. A targeted second pass requires "
                "an orbital inclination adjustment."
            ),
            "nasa_context": (
                "NASA LCROSS confirmed ~5.6% water ice in the Cabeus plume in 2009. "
                "High-resolution spectral verification remains top planetary decadal priority."
            ),
            "choices": [
                {
                    "id": "c1",
                    "text": "Burn propellant to lower orbit to 50 km for ultra-high-resolution scan",
                    "explanation": "High fuel expenditure and increased gravitational perturbation risk, but doubles scientific discovery yield.",
                    "effect_fn": "handle_lunar_cabeus_dip"
                },
                {
                    "id": "c2",
                    "text": "Maintain standard 100 km orbit and conduct multi-orbit cumulative integration",
                    "explanation": "Low risk, zero extra fuel consumed, standard science return.",
                    "effect_fn": "handle_lunar_cabeus_standard"
                }
            ]
        },
        {
            "id": "lunar_evt_5",
            "title": "Far-Side Occultation & Ground Contact Blackout",
            "phase": "Extended Operations",
            "description": (
                "The spacecraft orbits behind the lunar far side. Direct radio line-of-sight to "
                "Earth is severed for 48 minutes. An unexpected gyroscopic telemetry anomaly occurs "
                "in reaction wheel #2."
            ),
            "nasa_context": (
                "NASA Lunar Orbiters must rely on autonomous fault protection software when occulted "
                "by the Moon without a relay satellite."
            ),
            "choices": [
                {
                    "id": "c1",
                    "text": "Allow autonomous onboard flight software to reset wheel electronics",
                    "explanation": "Relies on avionics reliability; fixes glitch before re-emerging on Earth-facing side.",
                    "effect_fn": "handle_lunar_occult_auto"
                },
                {
                    "id": "c2",
                    "text": "Freeze attitude in drift mode and wait for Earth acquisition of signal (AOS)",
                    "explanation": "Safe, but loses 48 minutes of science imaging and drifts slightly off target.",
                    "effect_fn": "handle_lunar_occult_wait"
                }
            ]
        }
    ],

    "mars_discovery": [
        {
            "id": "mars_evt_1",
            "title": "Interplanetary Coronal Mass Ejection (CME) Impact",
            "phase": "Cruise Phase (0.8 AU to Mars)",
            "description": (
                "A powerful X-class solar flare triggers an intense proton storm across "
                "the inner solar system. The spacecraft is hit by high-energy galactic cosmic rays "
                "and solar energetic particles."
            ),
            "nasa_context": (
                "The RAD instrument on NASA Curiosity proved that interplanetary transit exposes "
                "electronics and future astronauts to significant radiation doses."
            ),
            "choices": [
                {
                    "id": "c1",
                    "text": "Re-orient bus so radiation vault/propellant tanks shield avionics",
                    "explanation": "Shields critical processor cores; temporary loss of Earth communication link.",
                    "effect_fn": "handle_mars_cme_shield"
                },
                {
                    "id": "c2",
                    "text": "Keep scientific particle detector actively recording solar storm spectra",
                    "explanation": "Gathers high-value space weather data, but risks single-event latchups on unshielded avionics.",
                    "effect_fn": "handle_mars_cme_record"
                }
            ]
        },
        {
            "id": "mars_evt_2",
            "title": "Mars Orbit Insertion (MOI) Main Engine Burn",
            "phase": "Mars Orbit Insertion",
            "description": (
                "Approaching Mars at 5.7 km/s, the spacecraft must fire its propulsion system "
                "retrograde to enter Martian gravity capture. Speed-of-light delay to Earth is 14 minutes."
            ),
            "nasa_context": (
                "NASA Mars missions (MRO, MAVEN, Mars Odyssey) undergo critical autonomous orbit insertion "
                "burns where ground teams can only watch delayed telemetry after the fact."
            ),
            "choices": [
                {
                    "id": "c1",
                    "text": "Standard continuous retro-burn targeting 350 km circular science orbit",
                    "explanation": "High propellant usage, but achieves optimal survey orbit immediately.",
                    "effect_fn": "handle_mars_moi_standard"
                },
                {
                    "id": "c2",
                    "text": "High elliptical capture orbit followed by multi-week Aerobraking",
                    "explanation": "Conserves up to 40% propellant mass, but subjects spacecraft thermal blankets to atmospheric frictional heating.",
                    "effect_fn": "handle_mars_moi_aerobrake"
                }
            ]
        },
        {
            "id": "mars_evt_3",
            "title": "Global Martian Dust Storm (Tau > 3.5)",
            "phase": "Primary Science Phase",
            "description": (
                "A massive regional dust storm merges into a global planet-encircling event. "
                "Atmospheric opacity (optical depth Tau) spikes to 3.5, reducing incoming solar "
                "irradiance by over 75% for 6 weeks."
            ),
            "nasa_context": (
                "The 2018 global dust storm ended NASA's solar-powered Opportunity rover, while the "
                "nuclear-powered Curiosity and Perseverance rovers continued operations uninterrupted."
            ),
            "choices": [
                {
                    "id": "c1",
                    "text": "Power down all non-essential payloads into Low-Power Hibernation",
                    "explanation": "Ensures spacecraft survival; pauses scientific data collection until skies clear.",
                    "effect_fn": "handle_mars_dust_hibernate"
                },
                {
                    "id": "c2",
                    "text": "Rely on power reserves and deploy Subsurface Radar (unaffected by dust)",
                    "explanation": "If power/nuclear allows, continues subsurface science through the opaque storm.",
                    "effect_fn": "handle_mars_dust_radar"
                }
            ]
        },
        {
            "id": "mars_evt_4",
            "title": "Methane Plume Detection & Solar Conjunction",
            "phase": "Deep Science Phase",
            "description": (
                "The infrared spectrometer detects localized 12 ppb methane spikes emerging from "
                "Gale Crater fault zones. Meanwhile, Earth and Mars are moving into Solar Conjunction, "
                "where the Sun directly blocks radio signals between the two planets."
            ),
            "nasa_context": (
                "During NASA Mars Solar Conjunction (~every 26 months), solar plasma corrupts RF signals, "
                "forcing commands to be suspended and data to be stored onboard in mass memory."
            ),
            "choices": [
                {
                    "id": "c1",
                    "text": "Buffer all high-rate methane mapping data to onboard flash storage",
                    "explanation": "Safeguards all observations; tests onboard memory capacity until conjunction ends.",
                    "effect_fn": "handle_mars_methane_buffer"
                },
                {
                    "id": "c2",
                    "text": "Transmit real-time telemetry at emergency low baud rate via X-band",
                    "explanation": "Risk of high packet loss and parity bit corruption due to solar corona interference.",
                    "effect_fn": "handle_mars_methane_transmit"
                }
            ]
        },
        {
            "id": "mars_evt_5",
            "title": "Ancient Delta Sediment Core Calibration",
            "phase": "Extended Mission",
            "description": (
                "Orbital camera surveys reveal exposed phyllosilicates (clay minerals) at the base "
                "of an ancient alluvial fan. A specialized multi-angle hyperspectral imaging pass is requested."
            ),
            "nasa_context": (
                "NASA's CRISM and HiRISE instruments on MRO revolutionized our understanding of Mars's "
                "aqueous history by targeting hydrated minerals in river deltas."
            ),
            "choices": [
                {
                    "id": "c1",
                    "text": "Perform dedicated roll maneuver and full multi-spectral spectral sweep",
                    "explanation": "Produces premier scientific finding, consuming 60W power and 1.8 GB data.",
                    "effect_fn": "handle_mars_delta_sweep"
                },
                {
                    "id": "c2",
                    "text": "Standard nadir-pointing imaging pass without roll maneuver",
                    "explanation": "Lower resolution and mineral diagnostic fidelity, but zero pointing stress on reaction wheels.",
                    "effect_fn": "handle_mars_delta_nadir"
                }
            ]
        }
    ],

    "europa_frontier": [
        {
            "id": "europa_evt_1",
            "title": "Jupiter Magnetosphere Radiation Belt Ingress",
            "phase": "Jovian System Arrival",
            "description": (
                "Entering the inner Jovian system, the spacecraft crosses the intense flux tube "
                "of Io and Europa. Radiation levels spike to 5,400 mSv/day—hundreds of times higher "
                "than Earth's Van Allen belts."
            ),
            "nasa_context": (
                "NASA's Europa Clipper utilizes a specialized armored radiation vault with thick "
                "aluminum and tantalum walls to protect its electronic heart from Jupiter's harsh fields."
            ),
            "choices": [
                {
                    "id": "c1",
                    "text": "Route all computational tasks into shielded radiation-hardened core",
                    "explanation": "Protects processors from latchups; drops unneeded background tasks.",
                    "effect_fn": "handle_europa_rad_vault"
                },
                {
                    "id": "c2",
                    "text": "Keep magnetic particle detectors wide open to map Jovian flux lines",
                    "explanation": "Spectacular scientific data return on radiation physics, but stresses unshielded electronic buses.",
                    "effect_fn": "handle_europa_rad_open"
                }
            ]
        },
        {
            "id": "europa_evt_2",
            "title": "Cryogenic Solar Starvation (-220°C Thermal Shock)",
            "phase": "Europa Approach",
            "description": (
                "At 5.2 AU from the Sun, solar irradiance is only 50 W/m² (less than 4% of Earth sunlight). "
                "The shadow of Jupiter causes an eclipse lasting 3.2 hours. Internal thermal loop drops to -40°C."
            ),
            "nasa_context": (
                "At Jupiter, solar arrays must span the size of basketball courts (as on Europa Clipper/Juno), "
                "or utilize Radioisotope Thermoelectric Generators (MMRTGs) for heat and power."
            ),
            "choices": [
                {
                    "id": "c1",
                    "text": "Fire Radioisotope / Electrical survival heaters at maximum output",
                    "explanation": "Prevents propellant freezing and keeps instruments warm, drawing heavy battery power unless nuclear.",
                    "effect_fn": "handle_europa_cryo_heaters"
                },
                {
                    "id": "c2",
                    "text": "Allow outer sensor bays to cold-soak while preserving core electronics",
                    "explanation": "Conserves 50% battery energy, but risks calibration shift on optical sensors.",
                    "effect_fn": "handle_europa_cryo_soak"
                }
            ]
        },
        {
            "id": "europa_evt_3",
            "title": "Cryovolcanic Plume Eruption at Thrace Macula",
            "phase": "Close Flyby (25 km Altitude)",
            "description": (
                "Real-time navigation cameras detect a 160-km-high vapor plume erupting through a chaos "
                "fracture in Europa's ice crust. Flying directly through the plume could sample subsurface ocean vapor."
            ),
            "nasa_context": (
                "Hubble Space Telescope and Galileo observations suggested active plumes on Europa, "
                "offering a direct window into the subsurface ocean without drilling through 20 km of ice."
            ),
            "choices": [
                {
                    "id": "c1",
                    "text": "Dip altitude to 25 km and fly through plume for in-situ mass spectrometry",
                    "explanation": "High aerodynamic and ice-particle impact risk, but the ultimate scientific jackpot for prebiotic organics.",
                    "effect_fn": "handle_europa_plume_dive"
                },
                {
                    "id": "c2",
                    "text": "Observe plume remotely from 300 km altitude with infrared spectrometer",
                    "explanation": "Zero impact risk; delivers safe spectral emission data.",
                    "effect_fn": "handle_europa_plume_remote"
                }
            ]
        },
        {
            "id": "europa_evt_4",
            "title": "Deep Space Optical Communications (DSOC) Plasma Jitter",
            "phase": "Interplanetary Downlink Phase",
            "description": (
                "With the spacecraft over 620 million kilometers away, the 42-minute one-way radio delay "
                "complicates communications. Dense Jovian plasma clouds cause refractive beam jitter on high-frequency signals."
            ),
            "nasa_context": (
                "NASA DSN 70m dishes in California, Spain, and Australia utilize cryogenically cooled "
                "maser amplifiers and beam waveguides to resolve picowatt signals from the outer planets."
            ),
            "choices": [
                {
                    "id": "c1",
                    "text": "Switch to Low-Frequency Robust X-Band Carrier with Forward Error Correction",
                    "explanation": "Slow downlink data rate, but guarantees zero corrupted packets.",
                    "effect_fn": "handle_europa_comms_xband"
                },
                {
                    "id": "c2",
                    "text": "Request NASA DSN 70m Dish Arraying with High-Gain Ka-band burst",
                    "explanation": "Maximizes science throughput, requiring premium DSN ground tracking lock.",
                    "effect_fn": "handle_europa_comms_dsn70"
                }
            ]
        },
        {
            "id": "europa_evt_5",
            "title": "Planetary Protection End-of-Life Disposal",
            "phase": "Mission Conclusion",
            "description": (
                "With propulsion fuel at 5%, the mission must execute planetary protection protocols. "
                "International COSPAR and NASA guidelines strictly prohibit accidentally contaminating "
                "Europa's potentially habitable subsurface ocean with terrestrial microbes."
            ),
            "nasa_context": (
                "NASA Galileo and Cassini were intentionally de-orbited into the crushing atmospheres of "
                "Jupiter and Saturn to safeguard Europa and Enceladus from biological contamination."
            ),
            "choices": [
                {
                    "id": "c1",
                    "text": "Execute Controlled De-orbit Burn into Jupiter's Giant Atmosphere",
                    "explanation": "Complete spacecraft incineration. 100% planetary protection compliance; NASA gold-standard.",
                    "effect_fn": "handle_europa_disposal_jupiter"
                },
                {
                    "id": "c2",
                    "text": "Boost into a stable High Jovian Graveyard Orbit",
                    "explanation": "Preserves spacecraft intact for potential future relay, but carries small long-term resonance impact risk.",
                    "effect_fn": "handle_europa_disposal_graveyard"
                }
            ]
        }
    ]
}

def apply_event_choice(
    mission_id: str,
    event_idx: int,
    choice_idx: int,
    sim_state: Dict[str, Any],
    design_calc: Dict[str, Any]
) -> Tuple[Dict[str, Any], str]:
    """
    Applies the consequence of a player's choice to the simulation state.
    Consequences are dynamically modulated by the spacecraft's actual hardware!
    """
    events = MISSION_EVENTS.get(mission_id, [])
    if event_idx >= len(events):
        return sim_state, "No event."

    event = events[event_idx]
    choice = event["choices"][choice_idx]
    comps = design_calc["selected_components"]

    # Current telemetry
    health = sim_state.get("health_pct", 100.0)
    power = sim_state.get("power_pct", 100.0)
    data_col = sim_state.get("data_collected_mb", 0.0)
    data_tx = sim_state.get("data_transmitted_mb", 0.0)
    science_pts = sim_state.get("science_points", 0.0)
    log_entries = sim_state.get("log", [])

    consequence_text = ""

    # Hardware capabilities
    has_mmrtg = comps["power_gen"]["id"] == "pwr_mmrtg"
    has_ultraflex = comps["power_gen"]["id"] == "pwr_ultraflex"
    has_vault = comps["structure"]["id"] == "struct_vault"
    has_rad750 = comps["avionics"]["id"] in ["av_rad750", "av_fault_tolerant"]
    has_ka_optical = comps["comms"]["id"] == "comm_ka_optical"
    has_dsn = comps["ground_segment"]["id"] in ["ground_dsn_34m", "ground_dsn_70m"]
    has_dsn70 = comps["ground_segment"]["id"] == "ground_dsn_70m"
    has_ion = comps["propulsion"]["id"] == "prop_ion"
    has_radar = any(i["id"] == "radar" for i in comps["instruments"])
    has_spectrometer = any(i["id"] == "spectrometer" for i in comps["instruments"])
    has_camera = any(i["id"] == "camera" for i in comps["instruments"])

    c_id = choice["id"]

    # ------------------ LUNAR EVENTS ------------------
    if event["id"] == "lunar_evt_1":
        if c_id == "c1":
            power = max(10.0, power - 5.0)
            health = max(10.0, health - (1.0 if has_ion else 3.0))
            consequence_text = (
                "RCS thrusters performed a precision trim burn. "
                "Nominal polar insertion trajectory restored with minimal propellant penalty."
            )
        else:
            consequence_text = (
                "Spacecraft coasted to perilune. Orbital insertion required 18% higher delta-V, "
                "stressing propulsion margins."
            )
            health = max(10.0, health - 6.0)

    elif event["id"] == "lunar_evt_2":
        if c_id == "c1":
            power = max(10.0, power - 8.0) # Normal battery draw
            science_pts += 10.0
            consequence_text = (
                "Safe cold-soak mode engaged. Batteries maintained steady 88% charge "
                "through 14-day darkness. Zero thermal shock."
            )
        else:
            if has_mmrtg or comps["battery"]["id"] == "bat_solid_state":
                power = max(10.0, power - 15.0)
                science_pts += 28.0
                data_col += 1200.0
                consequence_text = (
                    "High-capacity power reserves sustained radar active sounding in cold traps! "
                    "Unprecedented water ice dielectric signatures recorded."
                )
            else:
                power = max(5.0, power - 42.0)
                health = max(10.0, health - 12.0)
                science_pts += 15.0
                data_col += 800.0
                consequence_text = (
                    "WARNING: Low-capacity battery drained severely during shadowed radar sounding. "
                    "Emergency heater brownout caused slight thermal degradation."
                )

    elif event["id"] == "lunar_evt_3":
        if c_id == "c1":
            data_tx += 500.0
            science_pts += 12.0
            consequence_text = (
                "Spacecraft rotated into the solar wake. Optical lenses remained 100% dust-free. "
                "Earth communications resumed after terminator passage."
            )
        else:
            power = max(10.0, power - 8.0)
            if has_camera:
                science_pts += 22.0
                data_col += 1400.0
                consequence_text = (
                    "Electrostatic repeller rings deflected charged regolith particles. "
                    "Continuous sub-meter imagery captured along the terminator line."
                )
            else:
                science_pts += 8.0
                consequence_text = "Repeller rings consumed power with no primary camera to benefit."

    elif event["id"] == "lunar_evt_4":
        if c_id == "c1":
            health = max(10.0, health - 4.0)
            if has_spectrometer:
                science_pts += 35.0
                data_col += 2100.0
                consequence_text = (
                    "SUCCESS: 50 km low-altitude pass pinpointed a 6.2% water ice signature "
                    "in Cabeus Crater! Major scientific breakthrough."
                )
            else:
                science_pts += 12.0
                consequence_text = "Low pass executed, but lack of a dedicated spectrometer limited diagnostic resolution."
        else:
            science_pts += 15.0
            consequence_text = "Standard 100 km mapping preserved propellant reserves while gathering broad baseline survey data."

    elif event["id"] == "lunar_evt_5":
        if c_id == "c1":
            if has_rad750:
                science_pts += 18.0
                consequence_text = (
                    "Autonomous flight software flawlessly identified the gyro glitch and rebooted "
                    "reaction wheel channel. Full science acquisition maintained."
                )
            else:
                health = max(10.0, health - 8.0)
                consequence_text = (
                    "Autonomous reboot completed, but COTS avionics encountered a temporary watchdog timeout."
                )
        else:
            consequence_text = (
                "Spacecraft waited in passive drift until Earth AOS. Safe, but 48 minutes of prime imaging passes were lost."
            )
            science_pts += 5.0

    # ------------------ MARS EVENTS ------------------
    elif event["id"] == "mars_evt_1":
        if c_id == "c1":
            consequence_text = (
                "Spacecraft oriented fuel tanks toward the solar storm. Critical avionics shielded "
                "from coronal mass ejection. Health preserved."
            )
            health = max(10.0, health - (1.0 if has_vault else 4.0))
            science_pts += 10.0
        else:
            if has_vault and has_rad750:
                health = max(10.0, health - 3.0)
                science_pts += 30.0
                data_col += 1100.0
                consequence_text = (
                    "SPECTACULAR RETURN: Hardened avionics weathered the solar storm while particle "
                    "detectors mapped solar energetic particle flux!"
                )
            else:
                health = max(10.0, health - 18.0)
                science_pts += 18.0
                consequence_text = (
                    "CAUTION: Solar storm caused multiple single-event upsets in unshielded avionics! "
                    "Telemetry bit errors and memory scrubbing required."
                )

    elif event["id"] == "mars_evt_2":
        if c_id == "c1":
            power = max(10.0, power - 5.0)
            consequence_text = (
                "Flawless 350 km circular insertion burn executed. Spacecraft established nominal "
                "mapping orbit with immediate scientific survey coverage."
            )
            science_pts += 22.0
        else:
            if comps["thermal"]["id"] == "thm_active" or comps["thermal"]["id"] == "thm_nuclear_rhu":
                science_pts += 25.0
                health = max(10.0, health - 2.0)
                consequence_text = (
                    "SUCCESSFUL AEROBRAKING: Active thermal management dissipated upper-atmosphere heat. "
                    "Saved 35% propellant while circularizing orbit!"
                )
            else:
                health = max(10.0, health - 14.0)
                science_pts += 15.0
                consequence_text = (
                    "WARNING: Passive MLI blankets overheated during atmospheric aerobraking dip. "
                    "Outer thermal foil sustained partial scorch damage."
                )

    elif event["id"] == "mars_evt_3":
        if c_id == "c1":
            power = max(10.0, power - (5.0 if has_mmrtg else 20.0))
            consequence_text = (
                "Spacecraft placed into safe power-saving hibernation. Systems maintained battery "
                "equilibrium until global dust storm cleared."
            )
            science_pts += 8.0
        else:
            if has_mmrtg:
                science_pts += 32.0
                data_col += 1900.0
                consequence_text = (
                    "TRIUMPH: MMRTG Nuclear Generator ignored the dust storm completely! "
                    "Subsurface radar penetrated the obscured atmosphere to map hidden polar layers."
                )
            elif has_ultraflex:
                power = max(10.0, power - 30.0)
                science_pts += 18.0
                consequence_text = (
                    "UltraFlex arrays produced marginal power through dust. Basic radar runs operated at 40% duty cycle."
                )
            else:
                power = max(5.0, power - 55.0)
                health = max(10.0, health - 22.0)
                consequence_text = (
                    "CRITICAL BROWNOUT: Silicon solar panels starved of sunlight under dust storm. "
                    "Deep battery discharge caused emergency load shedding."
                )

    elif event["id"] == "mars_evt_4":
        if c_id == "c1":
            if comps["avionics"]["storage_gb"] >= 128.0:
                data_col += 2500.0
                science_pts += 30.0
                consequence_text = (
                    "Onboard solid-state recorder successfully buffered all high-rate methane passes "
                    "during the solar conjunction radio blackout."
                )
            else:
                data_col += 800.0
                science_pts += 15.0
                consequence_text = (
                    "Buffer memory reached 100% capacity during solar conjunction. Some secondary telemetry was discarded."
                )
        else:
            if has_dsn:
                data_tx += 1200.0
                science_pts += 18.0
                consequence_text = (
                    "NASA Deep Space Network maintained carrier signal through solar plasma, downlinking partial telemetry."
                )
            else:
                health = max(10.0, health - 10.0)
                consequence_text = (
                    "Transmission through solar plasma suffered heavy packet loss. Ground station lost sync for 9 days."
                )

    elif event["id"] == "mars_evt_5":
        if c_id == "c1":
            if has_camera and has_spectrometer:
                science_pts += 35.0
                data_col += 3200.0
                consequence_text = (
                    "HISTORIC DISCOVERY: Multi-spectral sweep verified phyllosilicate clay beds "
                    "indicating neutral-pH, long-lived lake waters on ancient Mars!"
                )
            else:
                science_pts += 16.0
                consequence_text = "Targeted roll maneuver executed; partial mineralogical data acquired."
        else:
            science_pts += 12.0
            consequence_text = "Nadir pass completed with zero pointing risk to reaction wheels."

    # ------------------ EUROPA EVENTS ------------------
    elif event["id"] == "europa_evt_1":
        if c_id == "c1":
            if has_vault and has_rad750:
                health = max(10.0, health - 1.0)
                science_pts += 20.0
                consequence_text = (
                    "Radiation-hardened vault and RAD750 processor shielded core avionics. "
                    "Zero ionizing dose corruption during Jovian belt transit."
                )
            else:
                health = max(10.0, health - 16.0)
                science_pts += 10.0
                consequence_text = (
                    "WARNING: Unarmored bus sustained intense radiation dose. Multiple memory bit-flips corrected."
                )
        else:
            if has_vault:
                health = max(10.0, health - 6.0)
                science_pts += 38.0
                data_col += 1600.0
                consequence_text = (
                    "Spectacular plasma physics telemetry downlinked! Shielded bus survived while sensors recorded Jovian flux lines."
                )
            else:
                health = max(10.0, health - 28.0)
                science_pts += 18.0
                consequence_text = (
                    "SEVERE RADIATION DAMAGE: Intense ionizing radiation degraded unshielded instrument multiplexers."
                )

    elif event["id"] == "europa_evt_2":
        if c_id == "c1":
            if has_mmrtg or comps["thermal"]["id"] == "thm_nuclear_rhu":
                power = max(10.0, power - 4.0)
                consequence_text = (
                    "Radioisotope thermal heat units maintained steady +15°C internal temperature "
                    "through the 3.2 hour Jupiter eclipse with zero electrical battery drain!"
                )
                science_pts += 22.0
            else:
                power = max(5.0, power - 45.0)
                consequence_text = (
                    "Electrical heaters drew massive battery current to prevent hydrazine lines from freezing."
                )
        else:
            health = max(10.0, health - 15.0)
            consequence_text = (
                "Outer sensor bay cold-soaked to -180°C. Instrument calibration offset required upon re-warming."
            )

    elif event["id"] == "europa_evt_3":
        if c_id == "c1":
            if has_radar or has_spectrometer:
                science_pts += 45.0
                data_col += 3800.0
                health = max(10.0, health - 6.0)
                consequence_text = (
                    "MONUMENTAL FINDING: Spacecraft flew through the 160-km plume! In-situ mass spectrometry "
                    "confirmed water vapor, sodium chloride salts, and organic macromolecules from the interior ocean!"
                )
            else:
                science_pts += 20.0
                health = max(10.0, health - 10.0)
                consequence_text = "Plume traverse completed, but lacking dedicated spectrometry limited chemical identification."
        else:
            science_pts += 22.0
            data_col += 1100.0
            consequence_text = "Safe 300 km remote sensing pass mapped plume morphology and water ice condensation boundaries."

    elif event["id"] == "europa_evt_4":
        if c_id == "c1":
            data_tx += 800.0
            science_pts += 15.0
            consequence_text = (
                "Robust X-band carrier delivered 100% error-free telemetry through Jovian plasma, "
                "though data downlink was slow."
            )
        else:
            if has_dsn70 or (has_dsn and has_ka_optical):
                data_tx += 4500.0
                science_pts += 35.0
                consequence_text = (
                    "SUCCESS: NASA DSN 70m aperture array locked high-gain Ka-band carrier! "
                    "Ultra-high-definition radar sounding data successfully received on Earth."
                )
            else:
                data_tx += 1200.0
                science_pts += 14.0
                health = max(10.0, health - 5.0)
                consequence_text = (
                    "High-gain lock lost intermittently; university/commercial receiver dropped 35% of packets."
                )

    elif event["id"] == "europa_evt_5":
        if c_id == "c1":
            science_pts += 20.0
            consequence_text = (
                "NASA GOLD STANDARD: Controlled de-orbit into Jupiter executed flawlessly. "
                "100% planetary protection compliance ensured; Europa's pristine ocean safeguarded."
            )
        else:
            consequence_text = (
                "Boosted into high graveyard orbit. Spacecraft remains stable, meeting secondary COSPAR guidelines."
            )
            science_pts += 10.0

    # Ensure downlink doesn't exceed collected
    data_tx = min(data_tx + 400.0, data_col + 500.0)

    # Update sim state
    sim_state["health_pct"] = round(health, 1)
    sim_state["power_pct"] = round(power, 1)
    sim_state["data_collected_mb"] = round(data_col, 1)
    sim_state["data_transmitted_mb"] = round(data_tx, 1)
    sim_state["science_points"] = round(science_pts, 1)

    log_entry = {
        "event_title": event["title"],
        "phase": event["phase"],
        "choice_text": choice["text"],
        "consequence": consequence_text
    }
    log_entries.append(log_entry)
    sim_state["log"] = log_entries

    return sim_state, consequence_text

