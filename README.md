# BEYOND THE ORBIT

### *YOUR NEXT FRONTIER IS UNKNOWN.*

**NASA Space Apps Challenge 2026 — Faisalabad Local Event**  
**Challenge:** Space Mission Design Game  
**Team:** Orbitera  

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.66-FF4B4B.svg)](https://streamlit.io/)
[![NASA SMD Model](https://img.shields.io/badge/NASA-SMD%20Four--Segment-004385.svg)](https://science.nasa.gov/)
[![Tests](https://img.shields.io/badge/Test%20Suite-11%2F11%20Passing-brightgreen.svg)]()

---

## Overview

**BEYOND THE ORBIT** is a single-player educational space mission design and simulation game. It bridges the gap in space science education by turning interconnected aerospace engineering trade-offs into an interactive, five-screen mission control experience.

Players take on the role of a NASA Flight Director and Chief Systems Engineer to design, launch, operate, and evaluate deep-space missions to the **Moon**, **Mars**, and **Europa**.

---

## Key Features

- **Cinematic Landing Page:** Futuristic mission control visual theme utilizing custom SVG schematics, subtle animated starfields, and typography.
- **Three Distinct Destinations:**
  - **Lunar Explorer (Moon):** Survey South Pole permanently shadowed cold traps; survive 14-day lunar nights and regolith dust.
  - **Mars Discovery (Mars):** Unravel ancient hydrology and methane cycles; overcome 4–24 min light delays and global dust storms.
  - **Europa Frontier (Europa):** Probe subsurface oceans and cryovolcanic plumes amidst Jupiter's radiation inferno and severe solar starvation ($50 \text{ W/m}^2$).
- **Four-Segment Mission Architecture (NASA SMD Standard):**
  - **A. Launch Segment:** Launch vehicle payload matching and injection energy.
  - **B. Space Segment:** Structure & shielding, electrical power (Silicon / UltraFlex / MMRTG Nuclear), batteries, communications, avionics (RAD750 / fault-tolerant), ADCS propulsion, thermal loops, and scientific payload (Camera, Spectrometer, Radar, Radiometer, Particle Detector).
  - **C. Orbit & Architecture:** Destination-tailored orbital geometry (polar low orbit, aerobraking elliptical, resonant flybys).
  - **D. Ground & User Segments:** Earth tracking ground networks (NSN, DSN 34m, DSN 70m) and data science pipelines (Open PDS).
- **Live Live Telemetry & 3-State Validation Engine:** Immediate calculations for mass margin (NASA 15-20% guideline), budget reserve, power balance ($1/r^2$ decay), and downlink throughput, displaying `READY FOR LAUNCH`, `NEEDS ATTENTION`, or `LAUNCH BLOCKED`.
- **Dynamic Decision Simulation:** 5–8 destination-specific interactive scenarios per mission where choices dynamically interact with installed hardware.
- **Transparent 100-Point Debrief & Export:** Detailed evaluation across 6 engineering categories, systems lessons learned, and downloadable **HTML** and **PDF** flight debrief reports.

---

## Verified NASA Data Integration

BEYOND THE ORBIT directly incorporates verified official NASA resources:
- **NASA Science Mission Directorate (SMD):** *Design and Develop Science Missions* (Four-Segment Architecture standard).
- **NASA Goddard Space Flight Center (GSFC):** *NSSDC Planetary Fact Sheets* (Solar flux, distances, light delays, surface gravity).
- **NASA Systems Engineering Handbook (NASA/SP-2016-6105 Rev 2):** Margin policies (15–20% mass contingency).
- **NASA Small Spacecraft Technology Program:** *CubeSat 101* (Subsystem hierarchy).
- **NASA Jet Propulsion Laboratory (JPL):** *Deep Space Network (DSN) Telecommunications Link Handbook*.

For full details, see [NASA_DATA_RECORD.md](NASA_DATA_RECORD.md).

---

## Installation & Quickstart

### Prerequisites
- Python 3.10+ (Tested on Python 3.11.9)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Laiba-Fatimaa/beyond-the-orbit.git
cd beyond-the-orbit
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the Automated Test Suite
Verify that all 11 test suites pass with 100% success:
```bash
python test_game.py
```

### 4. Launch the Game
```bash
streamlit run app.py
```
Open your browser to `http://localhost:8501`.

---

## File Structure

```
beyond-the-orbit/
├── app.py                  # Main Streamlit application & 5-screen controller
├── missions.py             # Moon, Mars, Europa destination profiles & objectives
├── spacecraft.py           # Launchers, bus subsystems, instruments & ground networks
├── game_logic.py           # Live calculations, NASA margin checks & validation engine
├── events.py               # Interactive in-flight scenarios & branching choices
├── scoring.py              # 100-point transparent systems engineering evaluation
├── report_generator.py     # Downloadable HTML & ReportLab PDF report generation
├── components.py           # Futuristic SVG celestial bodies & spacecraft schematics
├── styles.py               # Mission control CSS & deep-space color palette
├── nasa_data.py            # Verified NASA fact sheets, constants & reference registry
├── test_game.py            # Comprehensive 11-part test suite verifying all mechanics
├── requirements.txt        # Python package dependencies
├── README.md               # Project documentation and quickstart
├── NASA_DATA_RECORD.md     # Official NASA resource mapping and data transparency
└── PROJECT_SUBMISSION.md   # NASA Space Apps official submission (7 sections, pitch & script)
```

---

## Team Orbitera — NASA Space Apps 2026

*Dedicated to inspiring the next generation of space explorers and mission architects.*
