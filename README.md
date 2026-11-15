# BEYOND THE ORBIT

### *YOUR NEXT FRONTIER IS UNKNOWN.*

**NASA Space Apps Challenge 2026 — Faisalabad Local Event**  
**Challenge:** Space Mission Design Game  
**Team:** Orbitera  

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.30+-FF4B4B.svg)](https://streamlit.io/)
[![NASA SMD Architecture](https://img.shields.io/badge/NASA-SMD%20Four--Segment-004385.svg)](https://science.nasa.gov/learn/design-and-develop-science-missions/)
[![Test Suite](https://img.shields.io/badge/Test%20Suite-All%20Passing-brightgreen.svg)]()

---

## 1. Overview & Educational Purpose

**BEYOND THE ORBIT** is a single-player educational space systems engineering and flight simulation game. Designing a space exploration mission requires balancing deeply interconnected trade-offs: payload mass vs. launcher capacity, inverse-square solar power decay vs. nuclear power costs, communication latency vs. autonomy, and scientific instrument yield vs. survival in hostile planetary environments. Traditional educational resources often teach these concepts in isolation.

*Beyond the Orbit* bridges this gap by placing the player in the role of a NASA Flight Director and Chief Systems Engineer. Grounded in the **NASA Science Mission Directorate (SMD) Four-Segment Architecture** and verified **NASA Goddard Space Flight Center Planetary Fact Sheets**, players configure custom spacecraft for the **Moon**, **Mars**, or **Europa**, navigate real in-flight operational crises, and evaluate their mission through a transparent 100-point systems engineering debrief.

---

## 2. Core Game Architecture & Flow

The experience runs across 5 interconnected phases with continuous, automated state transitions:

1. **Cinematic Landing Page:** Introduces mission command with a high-resolution orbital Earth globe, Three.js starfield canvas, satellite telemetry, and responsive aerospace controls.
2. **Destination Selection:**
   - **Lunar Explorer (The Moon):** Survey South Pole-Aitken Basin cold traps; manage 1.28 s light latency and survive 14-day lunar nights and regolith dust.
   - **Mars Discovery (Mars):** Investigate Jezero Crater Delta ancient hydrology; overcome 4–24 min radio light delays, solar flux drop ($589 \text{ W/m}^2$), and global atmospheric dust storms.
   - **Europa Frontier (Europa):** Probe subsurface oceans and Conamara Chaos ice plumes amidst Jupiter's severe radiation belts (~5.4 Sv/day) and extreme solar starvation ($50.3 \text{ W/m}^2$).
3. **Spacecraft Configuration & Systems Engineering Lab:**
   - Configures the four NASA SMD segments:
     - **Launch Segment:** Match payload mass against Light, Medium, Heavy, or Super-Heavy launch vehicle capacities.
     - **Space Segment (Bus Subsystems):** Select structural bus and radiation shielding, power generation (Silicon vs. UltraFlex GaAs vs. MMRTG Nuclear), batteries, communications (S-Band, X-Band, Ka/Optical DSOC), avionics (RAD750, COTS, Fault-Tolerant), propulsion, and thermal loops.
     - **Space Segment (Scientific Instruments):** High-Resolution Framing Camera, Near-IR Spectrometer, Subsurface Radar (SHARAD/REASON), Thermal Radiometer, and Magnetometer.
     - **Ground & User Segments:** Earth tracking ground support (Commercial, NASA Near Space Network [NSN], NASA Deep Space Network [DSN] 34m/70m arrays) and science pipelines (Open Planetary Data System [PDS]).
   - **Live Telemetry & 3-State Validation Engine:** Continuously evaluates mass margin (enforcing the NASA 15–20% Systems Engineering contingency guideline), budget reserve, power balance ($1/r^2$ decay), and telemetry downlink rates, producing `READY FOR LAUNCH`, `NEEDS ATTENTION`, or `LAUNCH BLOCKED` status.
4. **Flight Operations Simulation:**
   - Real-time 5-4-3-2-1 terminal launch countdown sequence.
   - Deep-space cruise with animated starfield, cockpit telemetry HUD, and 15 dynamic deep-space anomalies.
   - Interactive scientific reconnaissance: align spacecraft sensors and perform geological scans over target planetary terrain (Shackleton Crater, Jezero Delta, Conamara Chaos).
5. **Mission Debrief & Scoring:**
   - Automatically evaluates mission performance against objectives and terminal failure conditions.
   - 100-point aerospace scorecard across 6 categories (Payload Delivery, Resource Conservation, Science Yield, Systems Reliability, Risk Management, Architecture Efficiency).
   - Generates downloadable standalone **HTML** and native ReportLab **PDF** flight debrief reports.

---

## 3. Dual-Delivery Architecture: Web & Python

*Beyond the Orbit* features a synchronized dual-execution architecture:

- **Standalone Web Application (`index.html`):**  
  A zero-dependency client application running modular ES6 JavaScript, HTML5 Canvas, Web Audio API procedural sound synthesis, and CSS3. Can be launched instantly in any browser or served via GitHub Pages with no build step or backend required.
- **Python Systems Backend (`app.py`):**  
  A Streamlit application that mounts the web frontend via `streamlit.components.v1.declare_component`, synchronizing session state, calculating mathematical physics models, and generating ReportLab PDF debrief certificates.

---

## 4. Technologies Used

- **Frontend:** Vanilla JavaScript (ES6 Modules: `ui-controller.js`, `game-data.js`, `audio-fx.js`, `space-renderer.js`), HTML5 Canvas, SVG vector spacecraft models, custom CSS3 design system with glassmorphism and keyframe animations.
- **Audio Engineering:** Custom procedural Web Audio API and synthesized 16-bit 44.1 kHz aerospace WAV soundscapes (`assets/audio/`).
- **Backend & Physics:** Python 3.11, Streamlit 1.30+, ReportLab 4.0+ (PDF debrief generation).
- **Physical Modeling:**
  - *Inverse-Square Law:* $P(r) = P_0 \times (r_{\text{Earth}} / r)^2$ governing planetary solar power generation.
  - *Speed-of-Light Latency:* Exact radio signal propagation time calculations ($c = 299,792 \text{ km/s}$).
  - *NASA Systems Engineering Handbook (NASA/SP-2016-6105 Rev 2):* 15–20% mass contingency margins.

---

## 5. Verified NASA Data & Asset Integration

All scientific models, planetary data, and imagery are documented and verified from official space agency archives:

- **NASA Science Mission Directorate (SMD):** Four-Segment Mission Architecture standard ([science.nasa.gov](https://science.nasa.gov/learn/design-and-develop-science-missions/)).
- **NASA Goddard Space Flight Center (GSFC):** NSSDC Planetary Fact Sheets for planetary constants, gravity, irradiance, and thermal ranges ([nssdc.gsfc.nasa.gov](https://nssdc.gsfc.nasa.gov/planetary/factsheet/)).
- **NASA Systems Engineering Handbook:** Margin policies and failure mitigations ([nasa.gov](https://www.nasa.gov/reference/systems-engineering-handbook/)).
- **NASA Jet Propulsion Laboratory (JPL):** Deep Space Network (DSN) link budgets ([deepspace.jpl.nasa.gov](https://deepspace.jpl.nasa.gov/about/)).
- **NASA Photographic Archives:**
  - *Earth:* Artemis II Optical Nav Camera / ISS Expedition 65 (`art002e000192`).
  - *Moon:* LRO LROC global mosaic (`GSFC_20171208_Archive_e000868`) & Shackleton Crater.
  - *Mars:* Viking 1 & 2 Orbiter color mosaic (`PIA00407`) & Jezero Delta MRO HiRISE (`PIA26018`).
  - *Europa:* Galileo SSI natural color mosaic (`PIA19048`) & Conamara Chaos (`PIA01296`).
  - *Jupiter:* Cassini ISS Jupiter global mosaic (`PIA04866`).
  - *Asteroids:* OSIRIS-REx (Bennu), Dawn (Vesta), Hayabusa2 (Ryugu / JAXA), NEAR Shoemaker (Eros).

For full details, exact NASA identifiers, and license records, see:
- [IMAGE_ATTRIBUTION.md](IMAGE_ATTRIBUTION.md) — Complete image source and license attribution catalog.
- [NASA_DATA_RECORD.md](NASA_DATA_RECORD.md) — Detailed mapping of authentic NASA parameters vs. educational game models.

---

## 6. How to Run Locally

### Option A: Standalone Browser Play (Zero Dependencies)
Simply open [`index.html`](index.html) directly in any modern web browser (Chrome, Edge, Firefox, Safari), or serve locally:
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000`.

### Option B: Python Streamlit Application
For the complete systems engineering experience with session synchronization and PDF export:

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the automated test suites
python test_frontend.py
python test_game.py
python test_integration.py

# 3. Launch the Streamlit application
streamlit run app.py
```
Then navigate to `http://localhost:8501`.

---

## 7. Deployment & Repository Links

- **GitHub Repository:** [https://github.com/Laiba-Fatimaa/beyond-the-orbit.git](https://github.com/Laiba-Fatimaa/beyond-the-orbit.git)
- **Interactive Presentation (7 Slides in Gamma):** [https://gamma.app/docs/BEYOND-THE-ORBIT-qpe5tpx84puk9hu](https://gamma.app/docs/BEYOND-THE-ORBIT-qpe5tpx84puk9hu)
- **Public Playable Web Deployment:** `https://laiba-fatimaa.github.io/beyond-the-orbit/`  
  *(Note: GitHub Pages becomes immediately accessible once enabled in repository settings under Settings > Pages > Deploy from branch `main` / `/ (root)`).*

---

## 8. Project Structure

```
beyond-the-orbit/
├── index.html                  # Standalone client web application entry point
├── app.py                      # Main Streamlit application & component bridge
├── missions.py                 # Moon, Mars, Europa destination profiles & science targets
├── spacecraft.py               # Launch vehicles, bus subsystems, instruments & ground networks
├── game_logic.py               # Live calculations, NASA margin checks & validation engine
├── events.py                   # In-flight anomaly scenarios, decision trees & consequence handlers
├── scoring.py                  # 100-point transparent systems engineering evaluation engine
├── report_generator.py         # Downloadable HTML & ReportLab PDF report generation
├── components.py               # Backend SVG celestial body & spacecraft schematic generators
├── styles.py                   # Mission control CSS & deep-space color palette
├── nasa_data.py                # Verified NASA fact sheets, constants & reference registry
├── audit.py                    # Verification script for JS modules & audio asset integrity
├── test_frontend.py            # Automated validation for 74 DOM element IDs & JS modules
├── test_game.py                # 11-part automated physics & systems engineering test suite
├── test_integration.py         # End-to-end integration test (Moon, Mars, Europa & failure modes)
├── requirements.txt            # Python dependencies (streamlit, reportlab)
├── README.md                   # Project documentation and quickstart
├── IMAGE_ATTRIBUTION.md        # Comprehensive NASA, ESA, and JAXA image attribution record
├── NASA_DATA_RECORD.md         # Official NASA resource mapping and data transparency
├── PROJECT_SUBMISSION.md       # NASA Space Apps official project submission document
├── css/
│   ├── main.css                # Base typography, layout grid, cards, and UI components
│   ├── cinematic.css           # Mission control aesthetic, glassmorphic HUD, planet discs
│   └── animations.css          # Orbit rotations, engine pulses, and keyframe animations
├── js/
│   ├── ui-controller.js        # 5-screen state machine, event handlers, and HUD updates
│   ├── game-data.js            # Synchronized NASA mission data, subsystems, and anomalies
│   ├── audio-fx.js             # Web Audio API procedural sound effects synthesizer
│   └── space-renderer.js       # Three.js / Canvas celestial starfield simulation
└── assets/
    ├── planet_earth_globe.jpg  # Center-cropped circular NASA Earth globe (art002e000192)
    ├── planet_moon_clean.jpg   # Clean circular NASA LRO Moon disc (GSFC_20171208)
    ├── planet_mars_clean.jpg   # Clean circular NASA Viking Mars disc (PIA00407)
    ├── planet_europa_clean.jpg # Clean circular NASA Galileo Europa disc (PIA19048)
    ├── probe_satellite_clean.png # Transparent vector spacecraft satellite probe
    ├── moon_mission_env.jpg    # Shackleton Crater South Pole terrain viewfinder
    ├── mars_surface.jpg        # Jezero Crater Delta MRO HiRISE viewfinder (PIA26018)
    ├── europa_mission_env.jpg  # Conamara Chaos Galileo SSI viewfinder (PIA01296)
    ├── asteroid_bennu.png      # NASA OSIRIS-REx asteroid sprite
    ├── asteroid_eros.png       # NASA NEAR Shoemaker asteroid sprite
    ├── asteroid_ryugu.png      # JAXA Hayabusa2 asteroid sprite
    ├── asteroid_vesta.png      # NASA Dawn asteroid sprite
    ├── starfield_loop.mp4      # NASA Marshall Night Stars astrophotography loop
    ├── cockpit_overlay.png     # Space Shuttle orbiter cockpit deck cutout
    ├── audio/                  # 10 custom synthesized aerospace WAV sound effects
    │   ├── alarm.wav           # Hazard caution klaxon
    │   ├── click.wav           # Mechanical switch engagement
    │   ├── downlink.wav        # Deep Space Network carrier lock
    │   ├── failure.wav         # Mission failure tone
    │   ├── flight.wav          # Deep space flight beacon
    │   ├── launch.wav          # Rocket countdown and combustion rumble
    │   ├── scan.wav            # Geological sensor reconnaissance ping
    │   ├── spacecraft_ambience.wav # Continuous cabin environmental hum
    │   ├── startup.wav         # Systems initialization chime
    │   └── success.wav         # Mission success harmonic triad
    └── ...                     # Source attribution hardware & environment references
```

---

## 9. Team Orbitera — NASA Space Apps Challenge 2026

*Dedicated to inspiring the next generation of space explorers and mission architects.*
