/* Synchronized NASA Space Apps 2026 Game Data exported from Python Backend */
window.BO_DATA = {
  "destinationProfiles": {
    "moon": {
      "mission_id": "lunar_explorer",
      "name": "The Moon",
      "profile": "Short-range / 7\u201310 days",
      "risk": "Moderate",
      "distance": "~384,400 KM",
      "vector": "LUNAR TRANSFER",
      "budget": "$300.0M",
      "target": "South Pole-Aitken Basin & Shackleton Crater",
      "difficulty": "Cadet (Introductory)"
    },
    "mars": {
      "mission_id": "mars_discovery",
      "name": "Mars",
      "profile": "Interplanetary / 6\u20139 months",
      "risk": "High",
      "distance": "~225,000,000 KM (avg)",
      "vector": "INTERPLANETARY TRANSFER",
      "budget": "$550.0M",
      "target": "Jezero Crater & Valles Marineris",
      "difficulty": "Flight Director (Intermediate)"
    },
    "europa": {
      "mission_id": "europa_frontier",
      "name": "Europa",
      "profile": "Deep-space / multi-year",
      "risk": "Very high",
      "distance": "~628,300,000 KM",
      "vector": "JOVIAN SYSTEM APPROACH",
      "budget": "$920.0M",
      "target": "Conamara Chaos & Thrace Macula Ice Plumes",
      "difficulty": "Mission Director (Advanced)"
    }
  },
  "destinations": {
    "moon": {
      "id": "lunar_explorer",
      "name": "The Moon",
      "description": "Embark on a high-precision lunar mission to survey polar ice deposits, map geochemical surface compositions, and establish critical data corridors for sustained exploration. The harsh 14-day lunar night and rugged surface terrain will test your power storage and navigation systems.",
      "window": "Flexible / Near-term",
      "challenge": "Surviving 14 Earth days of lunar darkness (-130\u00b0C to -170\u00b0C cold sink)",
      "science": "Lunar volatiles & cold traps",
      "scene": "EARTH\u2013MOON TRANSFER",
      "objectives": [
        {
          "id": "geology",
          "title": "High-Resolution Geomorphic Topography",
          "desc": "Produce sub-meter digital elevation models of potential landing corridors and pyroclastic deposits."
        },
        {
          "id": "resources",
          "title": "Map Volatiles & Water Ice in Cold Traps",
          "desc": "Probe Permanently Shadowed Regions (PSRs) at the lunar south pole for subsurface hydrogen signatures."
        },
        {
          "id": "environment",
          "title": "Mineralogical & Titanium-Iron Survey",
          "desc": "Characterize ilmenite and anorthosite abundances across basaltic maria and highlands."
        }
      ]
    },
    "mars": {
      "id": "mars_discovery",
      "name": "Mars",
      "description": "Launch an interplanetary expedition across millions of kilometers to decode the atmospheric loss mechanisms and sedimentary history of the Red Planet. Navigate the 4 to 24 minute communication lag, solar energy loss, and sudden planet-encircling dust storms that blanket solar panels.",
      "window": "Every 26 months (Hohmann)",
      "challenge": "Severe solar irradiance reduction (~589 W/m\u00b2 vs 1361 W/m\u00b2 at Earth)",
      "science": "Hydrology & methane cycles",
      "scene": "INTERPLANETARY TRANSFER",
      "objectives": [
        {
          "id": "geology",
          "title": "Subsurface Paleohydrology & Ice Shelves",
          "desc": "Sound subsurface sedimentary beds and buried glaciers up to 1.5 km depth."
        },
        {
          "id": "resources",
          "title": "Atmospheric Trace Gas & Methane Monitoring",
          "desc": "Detect seasonal methane fluctuations and trace gas plumes associated with sub-surface activity."
        },
        {
          "id": "environment",
          "title": "High-Resolution Geomorphology & Dunes",
          "desc": "Track active dust devil dynamics, recurring slope lineae (RSL), and ancient delta deposits."
        }
      ]
    },
    "europa": {
      "id": "europa_frontier",
      "name": "Europa",
      "description": "Venture into the outer Solar System to Jupiter's icy moon Europa, which conceals a global liquid water ocean with more volume than all of Earth's oceans combined. Survive Jupiter's colossal trapped radiation belt, manage power with only 3.7% of Earth's solar energy, and buffer data over a 45-minute light-speed chasm.",
      "window": "Jupiter synodic alignment",
      "challenge": "Lethal Jovian magnetospheric radiation belt (~5,400 mSv/day dose)",
      "science": "Subsurface ocean & plume astrobiology",
      "scene": "JOVIAN SYSTEM APPROACH",
      "objectives": [
        {
          "id": "resources",
          "title": "Sound Ice Shell Thickness & Ocean Interface",
          "desc": "Penetrate the 15-25 km thick floating ice shell to verify liquid water pockets and depth of ocean floor."
        },
        {
          "id": "environment",
          "title": "Cryoplume & Salt-Organic Characterization",
          "desc": "Perform in-situ mass spectrometry on vented vapor plumes for sodium chloride and prebiotic organics."
        },
        {
          "id": "geology",
          "title": "Induced Magnetic Dipole & Ocean Salinity",
          "desc": "Measure Jupiter-induced magnetic currents to calculate ocean conductivity, temperature, and salt content."
        }
      ]
    }
  },
  "spacecraft": {
    "pathfinder": {
      "id": "pathfinder",
      "name": "Pathfinder Explorer",
      "class": "EXPLORATION CLASS",
      "desc": "Balanced NASA SMD Medium-class planetary bus with dual articulating solar arrays and high-gain antenna.",
      "fuel": 70,
      "power": 65,
      "supplies": 60,
      "launch_vehicle": "lv_medium",
      "avionics": "av_rad750",
      "thermal": "thm_active"
    },
    "pioneer": {
      "id": "pioneer",
      "name": "Pioneer Scout",
      "class": "LIGHT SCOUT CLASS",
      "desc": "Agile, lightweight SmallSat/CubeSat bus designed for rapid transit and targeted observation runs.",
      "fuel": 55,
      "power": 48,
      "supplies": 45,
      "launch_vehicle": "lv_light",
      "avionics": "av_cots",
      "thermal": "thm_passive"
    },
    "sentinel": {
      "id": "sentinel",
      "name": "Sentinel Heavy Explorer",
      "class": "HEAVY EXPLORATION CLASS",
      "desc": "Flagship multi-instrument deep-space probe with titanium radiation vault and bipropellant propulsion.",
      "fuel": 85,
      "power": 82,
      "supplies": 80,
      "launch_vehicle": "lv_heavy",
      "avionics": "av_tri_modular",
      "thermal": "thm_active"
    }
  },
  "missionEvents": {
    "moon": [
      {
        "title": "Trans-Lunar Injection Burn Deviation",
        "phase": "Trans-Lunar Injection (TLI)",
        "description": "During the upper-stage burn toward the Moon, slight thrust vector oscillations introduce a 2.4 m/s velocity dispersion. A correction maneuver is necessary to prevent a lunar flyby overshoot.",
        "nasa_context": "NASA Apollo and Artemis trajectories use Trajectory Correction Maneuvers (TCMs) to ensure accurate insertion into lunar orbit.",
        "choices": [
          {
            "id": "c1",
            "title": "Execute immediate active RCS burn to trim trajectory",
            "detail": "Consumes onboard fuel/power but restores nominal orbital trajectory.",
            "effects": {
              "fuel": -6,
              "power": -3,
              "supplies": 0
            },
            "score": 10,
            "log": "Consumes onboard fuel/power but restores nominal orbital trajectory."
          },
          {
            "id": "c2",
            "title": "Coast and perform a combined insertion trim closer to the Moon",
            "detail": "Conserves immediate fuel, but increases required delta-V later and risks navigational dispersion.",
            "effects": {
              "fuel": -2,
              "power": -8,
              "supplies": 0
            },
            "score": 7,
            "log": "Conserves immediate fuel, but increases required delta-V later and risks navigational dispersion."
          }
        ]
      },
      {
        "title": "Descent into Polar Crater Shadow (Lunar Night)",
        "phase": "Low Lunar Polar Orbit",
        "description": "The spacecraft enters the shadow of Shackleton Crater at the Lunar South Pole. Solar panels stop producing electricity, and temperatures plummet to -160\u00b0C. Thermal heaters and batteries are engaged.",
        "nasa_context": "NASA Lunar Reconnaissance Orbiter (LRO) experiences periodic eclipses where instruments switch to low-power keep-alive modes to protect optics from freezing.",
        "choices": [
          {
            "id": "c1",
            "title": "Enter Safe Cold-Soak Mode (Shut down scientific instruments)",
            "detail": "Protects battery reserves and thermal stability, but halts science observations during the pass.",
            "effects": {
              "fuel": -6,
              "power": -3,
              "supplies": 0
            },
            "score": 10,
            "log": "Protects battery reserves and thermal stability, but halts science observations during the pass."
          },
          {
            "id": "c2",
            "title": "Keep Subsurface Radar Active to Sound Frozen Shadowed Traps",
            "detail": "Drains electrical storage, but yields invaluable subsurface water ice signatures.",
            "effects": {
              "fuel": -2,
              "power": -8,
              "supplies": 0
            },
            "score": 7,
            "log": "Drains electrical storage, but yields invaluable subsurface water ice signatures."
          }
        ]
      },
      {
        "title": "Electrostatic Regolith Dust Levitating Over Terminator",
        "phase": "Primary Mapping Survey",
        "description": "Passing over the lunar day-night terminator, solar ultraviolet light charges fine sub-micron regolith particles, levitating dust clouds up to orbital altitude. Dust adhesion threatens optical camera lenses.",
        "nasa_context": "First observed by Apollo astronauts (lunar horizon glow) and investigated by NASA LADEE, electrostatic dust lofting is a major hazard for lunar exploration.",
        "choices": [
          {
            "id": "c1",
            "title": "Rotate spacecraft 180\u00b0 to keep optical apertures in the wake",
            "detail": "Safeguards camera optics, but temporarily misaligns high-gain earth communication dish.",
            "effects": {
              "fuel": -6,
              "power": -3,
              "supplies": 0
            },
            "score": 10,
            "log": "Safeguards camera optics, but temporarily misaligns high-gain earth communication dish."
          },
          {
            "id": "c2",
            "title": "Activate electrostatic lens repeller rings at higher power",
            "detail": "Maintains telescope orientation while consuming 35W extra electrical power.",
            "effects": {
              "fuel": -2,
              "power": -8,
              "supplies": 0
            },
            "score": 7,
            "log": "Maintains telescope orientation while consuming 35W extra electrical power."
          }
        ]
      },
      {
        "title": "Serendipitous Cabeus Crater Volatile Detection",
        "phase": "Deep Science Phase",
        "description": "The near-infrared spectrometer detects an anomalous hydroxyl/water absorption band (2.8 microns) in Cabeus Crater floor ejecta. A targeted second pass requires an orbital inclination adjustment.",
        "nasa_context": "NASA LCROSS confirmed ~5.6% water ice in the Cabeus plume in 2009. High-resolution spectral verification remains top planetary decadal priority.",
        "choices": [
          {
            "id": "c1",
            "title": "Burn propellant to lower orbit to 50 km for ultra-high-resolution scan",
            "detail": "High fuel expenditure and increased gravitational perturbation risk, but doubles scientific discovery yield.",
            "effects": {
              "fuel": -6,
              "power": -3,
              "supplies": 0
            },
            "score": 10,
            "log": "High fuel expenditure and increased gravitational perturbation risk, but doubles scientific discovery yield."
          },
          {
            "id": "c2",
            "title": "Maintain standard 100 km orbit and conduct multi-orbit cumulative integration",
            "detail": "Low risk, zero extra fuel consumed, standard science return.",
            "effects": {
              "fuel": -2,
              "power": -8,
              "supplies": 0
            },
            "score": 7,
            "log": "Low risk, zero extra fuel consumed, standard science return."
          }
        ]
      },
      {
        "title": "Far-Side Occultation & Ground Contact Blackout",
        "phase": "Extended Operations",
        "description": "The spacecraft orbits behind the lunar far side. Direct radio line-of-sight to Earth is severed for 48 minutes. An unexpected gyroscopic telemetry anomaly occurs in reaction wheel #2.",
        "nasa_context": "NASA Lunar Orbiters must rely on autonomous fault protection software when occulted by the Moon without a relay satellite.",
        "choices": [
          {
            "id": "c1",
            "title": "Allow autonomous onboard flight software to reset wheel electronics",
            "detail": "Relies on avionics reliability; fixes glitch before re-emerging on Earth-facing side.",
            "effects": {
              "fuel": -6,
              "power": -3,
              "supplies": 0
            },
            "score": 10,
            "log": "Relies on avionics reliability; fixes glitch before re-emerging on Earth-facing side."
          },
          {
            "id": "c2",
            "title": "Freeze attitude in drift mode and wait for Earth acquisition of signal (AOS)",
            "detail": "Safe, but loses 48 minutes of science imaging and drifts slightly off target.",
            "effects": {
              "fuel": -2,
              "power": -8,
              "supplies": 0
            },
            "score": 7,
            "log": "Safe, but loses 48 minutes of science imaging and drifts slightly off target."
          }
        ]
      }
    ],
    "mars": [
      {
        "title": "Interplanetary Coronal Mass Ejection (CME) Impact",
        "phase": "Cruise Phase (0.8 AU to Mars)",
        "description": "A powerful X-class solar flare triggers an intense proton storm across the inner solar system. The spacecraft is hit by high-energy galactic cosmic rays and solar energetic particles.",
        "nasa_context": "The RAD instrument on NASA Curiosity proved that interplanetary transit exposes electronics and future astronauts to significant radiation doses.",
        "choices": [
          {
            "id": "c1",
            "title": "Re-orient bus so radiation vault/propellant tanks shield avionics",
            "detail": "Shields critical processor cores; temporary loss of Earth communication link.",
            "effects": {
              "fuel": -8,
              "power": -4,
              "supplies": 0
            },
            "score": 10,
            "log": "Shields critical processor cores; temporary loss of Earth communication link."
          },
          {
            "id": "c2",
            "title": "Keep scientific particle detector actively recording solar storm spectra",
            "detail": "Gathers high-value space weather data, but risks single-event latchups on unshielded avionics.",
            "effects": {
              "fuel": -3,
              "power": -10,
              "supplies": 0
            },
            "score": 7,
            "log": "Gathers high-value space weather data, but risks single-event latchups on unshielded avionics."
          }
        ]
      },
      {
        "title": "Mars Orbit Insertion (MOI) Main Engine Burn",
        "phase": "Mars Orbit Insertion",
        "description": "Approaching Mars at 5.7 km/s, the spacecraft must fire its propulsion system retrograde to enter Martian gravity capture. Speed-of-light delay to Earth is 14 minutes.",
        "nasa_context": "NASA Mars missions (MRO, MAVEN, Mars Odyssey) undergo critical autonomous orbit insertion burns where ground teams can only watch delayed telemetry after the fact.",
        "choices": [
          {
            "id": "c1",
            "title": "Standard continuous retro-burn targeting 350 km circular science orbit",
            "detail": "High propellant usage, but achieves optimal survey orbit immediately.",
            "effects": {
              "fuel": -8,
              "power": -4,
              "supplies": 0
            },
            "score": 10,
            "log": "High propellant usage, but achieves optimal survey orbit immediately."
          },
          {
            "id": "c2",
            "title": "High elliptical capture orbit followed by multi-week Aerobraking",
            "detail": "Conserves up to 40% propellant mass, but subjects spacecraft thermal blankets to atmospheric frictional heating.",
            "effects": {
              "fuel": -3,
              "power": -10,
              "supplies": 0
            },
            "score": 7,
            "log": "Conserves up to 40% propellant mass, but subjects spacecraft thermal blankets to atmospheric frictional heating."
          }
        ]
      },
      {
        "title": "Global Martian Dust Storm (Tau > 3.5)",
        "phase": "Primary Science Phase",
        "description": "A massive regional dust storm merges into a global planet-encircling event. Atmospheric opacity (optical depth Tau) spikes to 3.5, reducing incoming solar irradiance by over 75% for 6 weeks.",
        "nasa_context": "The 2018 global dust storm ended NASA's solar-powered Opportunity rover, while the nuclear-powered Curiosity and Perseverance rovers continued operations uninterrupted.",
        "choices": [
          {
            "id": "c1",
            "title": "Power down all non-essential payloads into Low-Power Hibernation",
            "detail": "Ensures spacecraft survival; pauses scientific data collection until skies clear.",
            "effects": {
              "fuel": -8,
              "power": -4,
              "supplies": 0
            },
            "score": 10,
            "log": "Ensures spacecraft survival; pauses scientific data collection until skies clear."
          },
          {
            "id": "c2",
            "title": "Rely on power reserves and deploy Subsurface Radar (unaffected by dust)",
            "detail": "If power/nuclear allows, continues subsurface science through the opaque storm.",
            "effects": {
              "fuel": -3,
              "power": -10,
              "supplies": 0
            },
            "score": 7,
            "log": "If power/nuclear allows, continues subsurface science through the opaque storm."
          }
        ]
      },
      {
        "title": "Methane Plume Detection & Solar Conjunction",
        "phase": "Deep Science Phase",
        "description": "The infrared spectrometer detects localized 12 ppb methane spikes emerging from Gale Crater fault zones. Meanwhile, Earth and Mars are moving into Solar Conjunction, where the Sun directly blocks radio signals between the two planets.",
        "nasa_context": "During NASA Mars Solar Conjunction (~every 26 months), solar plasma corrupts RF signals, forcing commands to be suspended and data to be stored onboard in mass memory.",
        "choices": [
          {
            "id": "c1",
            "title": "Buffer all high-rate methane mapping data to onboard flash storage",
            "detail": "Safeguards all observations; tests onboard memory capacity until conjunction ends.",
            "effects": {
              "fuel": -8,
              "power": -4,
              "supplies": 0
            },
            "score": 10,
            "log": "Safeguards all observations; tests onboard memory capacity until conjunction ends."
          },
          {
            "id": "c2",
            "title": "Transmit real-time telemetry at emergency low baud rate via X-band",
            "detail": "Risk of high packet loss and parity bit corruption due to solar corona interference.",
            "effects": {
              "fuel": -3,
              "power": -10,
              "supplies": 0
            },
            "score": 7,
            "log": "Risk of high packet loss and parity bit corruption due to solar corona interference."
          }
        ]
      },
      {
        "title": "Ancient Delta Sediment Core Calibration",
        "phase": "Extended Mission",
        "description": "Orbital camera surveys reveal exposed phyllosilicates (clay minerals) at the base of an ancient alluvial fan. A specialized multi-angle hyperspectral imaging pass is requested.",
        "nasa_context": "NASA's CRISM and HiRISE instruments on MRO revolutionized our understanding of Mars's aqueous history by targeting hydrated minerals in river deltas.",
        "choices": [
          {
            "id": "c1",
            "title": "Perform dedicated roll maneuver and full multi-spectral spectral sweep",
            "detail": "Produces premier scientific finding, consuming 60W power and 1.8 GB data.",
            "effects": {
              "fuel": -8,
              "power": -4,
              "supplies": 0
            },
            "score": 10,
            "log": "Produces premier scientific finding, consuming 60W power and 1.8 GB data."
          },
          {
            "id": "c2",
            "title": "Standard nadir-pointing imaging pass without roll maneuver",
            "detail": "Lower resolution and mineral diagnostic fidelity, but zero pointing stress on reaction wheels.",
            "effects": {
              "fuel": -3,
              "power": -10,
              "supplies": 0
            },
            "score": 7,
            "log": "Lower resolution and mineral diagnostic fidelity, but zero pointing stress on reaction wheels."
          }
        ]
      }
    ],
    "europa": [
      {
        "title": "Jupiter Magnetosphere Radiation Belt Ingress",
        "phase": "Jovian System Arrival",
        "description": "Entering the inner Jovian system, the spacecraft crosses the intense flux tube of Io and Europa. Radiation levels spike to 5,400 mSv/day\u2014hundreds of times higher than Earth's Van Allen belts.",
        "nasa_context": "NASA's Europa Clipper utilizes a specialized armored radiation vault with thick aluminum and tantalum walls to protect its electronic heart from Jupiter's harsh fields.",
        "choices": [
          {
            "id": "c1",
            "title": "Route all computational tasks into shielded radiation-hardened core",
            "detail": "Protects processors from latchups; drops unneeded background tasks.",
            "effects": {
              "fuel": -10,
              "power": -5,
              "supplies": 0
            },
            "score": 10,
            "log": "Protects processors from latchups; drops unneeded background tasks."
          },
          {
            "id": "c2",
            "title": "Keep magnetic particle detectors wide open to map Jovian flux lines",
            "detail": "Spectacular scientific data return on radiation physics, but stresses unshielded electronic buses.",
            "effects": {
              "fuel": -4,
              "power": -12,
              "supplies": 0
            },
            "score": 7,
            "log": "Spectacular scientific data return on radiation physics, but stresses unshielded electronic buses."
          }
        ]
      },
      {
        "title": "Cryogenic Solar Starvation (-220\u00b0C Thermal Shock)",
        "phase": "Europa Approach",
        "description": "At 5.2 AU from the Sun, solar irradiance is only 50 W/m\u00b2 (less than 4% of Earth sunlight). The shadow of Jupiter causes an eclipse lasting 3.2 hours. Internal thermal loop drops to -40\u00b0C.",
        "nasa_context": "At Jupiter, solar arrays must span the size of basketball courts (as on Europa Clipper/Juno), or utilize Radioisotope Thermoelectric Generators (MMRTGs) for heat and power.",
        "choices": [
          {
            "id": "c1",
            "title": "Fire Radioisotope / Electrical survival heaters at maximum output",
            "detail": "Prevents propellant freezing and keeps instruments warm, drawing heavy battery power unless nuclear.",
            "effects": {
              "fuel": -10,
              "power": -5,
              "supplies": 0
            },
            "score": 10,
            "log": "Prevents propellant freezing and keeps instruments warm, drawing heavy battery power unless nuclear."
          },
          {
            "id": "c2",
            "title": "Allow outer sensor bays to cold-soak while preserving core electronics",
            "detail": "Conserves 50% battery energy, but risks calibration shift on optical sensors.",
            "effects": {
              "fuel": -4,
              "power": -12,
              "supplies": 0
            },
            "score": 7,
            "log": "Conserves 50% battery energy, but risks calibration shift on optical sensors."
          }
        ]
      },
      {
        "title": "Cryovolcanic Plume Eruption at Thrace Macula",
        "phase": "Close Flyby (25 km Altitude)",
        "description": "Real-time navigation cameras detect a 160-km-high vapor plume erupting through a chaos fracture in Europa's ice crust. Flying directly through the plume could sample subsurface ocean vapor.",
        "nasa_context": "Hubble Space Telescope and Galileo observations suggested active plumes on Europa, offering a direct window into the subsurface ocean without drilling through 20 km of ice.",
        "choices": [
          {
            "id": "c1",
            "title": "Dip altitude to 25 km and fly through plume for in-situ mass spectrometry",
            "detail": "High aerodynamic and ice-particle impact risk, but the ultimate scientific jackpot for prebiotic organics.",
            "effects": {
              "fuel": -10,
              "power": -5,
              "supplies": 0
            },
            "score": 10,
            "log": "High aerodynamic and ice-particle impact risk, but the ultimate scientific jackpot for prebiotic organics."
          },
          {
            "id": "c2",
            "title": "Observe plume remotely from 300 km altitude with infrared spectrometer",
            "detail": "Zero impact risk; delivers safe spectral emission data.",
            "effects": {
              "fuel": -4,
              "power": -12,
              "supplies": 0
            },
            "score": 7,
            "log": "Zero impact risk; delivers safe spectral emission data."
          }
        ]
      },
      {
        "title": "Deep Space Optical Communications (DSOC) Plasma Jitter",
        "phase": "Interplanetary Downlink Phase",
        "description": "With the spacecraft over 620 million kilometers away, the 42-minute one-way radio delay complicates communications. Dense Jovian plasma clouds cause refractive beam jitter on high-frequency signals.",
        "nasa_context": "NASA DSN 70m dishes in California, Spain, and Australia utilize cryogenically cooled maser amplifiers and beam waveguides to resolve picowatt signals from the outer planets.",
        "choices": [
          {
            "id": "c1",
            "title": "Switch to Low-Frequency Robust X-Band Carrier with Forward Error Correction",
            "detail": "Slow downlink data rate, but guarantees zero corrupted packets.",
            "effects": {
              "fuel": -10,
              "power": -5,
              "supplies": 0
            },
            "score": 10,
            "log": "Slow downlink data rate, but guarantees zero corrupted packets."
          },
          {
            "id": "c2",
            "title": "Request NASA DSN 70m Dish Arraying with High-Gain Ka-band burst",
            "detail": "Maximizes science throughput, requiring premium DSN ground tracking lock.",
            "effects": {
              "fuel": -4,
              "power": -12,
              "supplies": 0
            },
            "score": 7,
            "log": "Maximizes science throughput, requiring premium DSN ground tracking lock."
          }
        ]
      },
      {
        "title": "Planetary Protection End-of-Life Disposal",
        "phase": "Mission Conclusion",
        "description": "With propulsion fuel at 5%, the mission must execute planetary protection protocols. International COSPAR and NASA guidelines strictly prohibit accidentally contaminating Europa's potentially habitable subsurface ocean with terrestrial microbes.",
        "nasa_context": "NASA Galileo and Cassini were intentionally de-orbited into the crushing atmospheres of Jupiter and Saturn to safeguard Europa and Enceladus from biological contamination.",
        "choices": [
          {
            "id": "c1",
            "title": "Execute Controlled De-orbit Burn into Jupiter's Giant Atmosphere",
            "detail": "Complete spacecraft incineration. 100% planetary protection compliance; NASA gold-standard.",
            "effects": {
              "fuel": -10,
              "power": -5,
              "supplies": 0
            },
            "score": 10,
            "log": "Complete spacecraft incineration. 100% planetary protection compliance; NASA gold-standard."
          },
          {
            "id": "c2",
            "title": "Boost into a stable High Jovian Graveyard Orbit",
            "detail": "Preserves spacecraft intact for potential future relay, but carries small long-term resonance impact risk.",
            "effects": {
              "fuel": -4,
              "power": -12,
              "supplies": 0
            },
            "score": 7,
            "log": "Preserves spacecraft intact for potential future relay, but carries small long-term resonance impact risk."
          }
        ]
      }
    ]
  }
};
