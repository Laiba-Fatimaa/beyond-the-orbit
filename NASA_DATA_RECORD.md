# NASA DATA & OFFICIAL CHALLENGE RECORD

**Project:** BEYOND THE ORBIT  
**Team:** Orbitera  
**Event:** NASA Space Apps Challenge 2026 — Faisalabad Local Event  
**Challenge:** Space Mission Design Game  

---

## 1. Verified Official NASA Resources Used

| Resource Name | Source Agency | Official URL | Information / Concepts Extracted | In-Game Location & Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Design and Develop Science Missions** | NASA Science Mission Directorate (SMD) | [science.nasa.gov/learn/design-and-develop-science-missions/](https://science.nasa.gov/learn/design-and-develop-science-missions/) | **Four-Segment Mission Architecture:** Launch Segment, Space Segment, Ground Segment, and User Segment. Teaches that missions extend from launch vehicle through spacecraft to ground receivers and science teams. | **Screen 3 (Tabs A, B, C, D)**, **Debrief Summary**, and Systems Architecture. |
| **Planetary Fact Sheets** | NASA Goddard Space Flight Center (GSFC) | [nssdc.gsfc.nasa.gov/planetary/factsheet/](https://nssdc.gsfc.nasa.gov/planetary/factsheet/) | **Physical parameters:** Solar irradiance ($1361 \text{ W/m}^2$ at Moon, $589 \text{ W/m}^2$ at Mars, $50.3 \text{ W/m}^2$ at Europa), one-way radio light travel time, surface gravity, surface thermal ranges, and atmospheric pressure. | **Screen 2 (Planetary Physics Cards)**, **Screen 3 (Power $1/r^2$ calculations)**, and **Screen 4 (Telemetry)**. |
| **NASA Systems Engineering Handbook** (NASA/SP-2016-6105 Rev 2) | NASA Headquarters / NTRS | [nasa.gov/reference/systems-engineering-handbook/](https://www.nasa.gov/reference/systems-engineering-handbook/) | **Contingency Margin Policies:** Mass margins (15–20% required during preliminary design), power balance buffers, thermal envelopes, and single-point failure mitigations. | **Screen 3 Live Validation Engine** (`READY FOR LAUNCH`, `NEEDS ATTENTION`, `LAUNCH BLOCKED`), and **Debrief Lessons Learned**. |
| **CubeSat 101: Basic Concepts and Processes for First-Time Developers** | NASA Small Spacecraft Technology Program | [nasa.gov/reference/cubesat-101/](https://www.nasa.gov/reference/cubesat-101/) | **Spacecraft Subsystem Decomposition:** EPS (Electrical Power), CDH (Command & Data Handling), ADCS (Attitude Determination & Control), Comms, Thermal Control (TCS), and Payload Integration. | **Screen 3 (Space Segment Subsystems Configuration)**. |
| **Deep Space Network (DSN) Telecommunications Link Design Handbooks** | NASA Jet Propulsion Laboratory (JPL) | [deepspace.jpl.nasa.gov/about/](https://deepspace.jpl.nasa.gov/about/) | **Deep-space telecommunications:** 34m Beam Waveguide and 70m Goldstone/Madrid/Canberra antenna arrays, X-band/Ka-band data rates, light time latency, and solar conjunction RF degradation. | **Screen 3 (Ground Segment)**, **Screen 4 (Events 4 & 5)**, and Downlink throughput algorithms. |
| **JPL Concept Maturity Levels (CML)** | NASA Jet Propulsion Laboratory (JPL) | [jpl.nasa.gov](https://www.jpl.nasa.gov/) | **Mission Readiness Framework:** Validates mission transition readiness from initial trade-space concept to flight verification. | **Screen 3 Readiness Validation critiques**. |

---

## 2. Distinction Between Authentic NASA Data vs. Educational Game Models

To maintain complete scientific and educational integrity:

1. **Authentic NASA Data Points:**
   - Planetary distances, orbital semi-major axes, solar irradiance values (W/m²), surface temperatures, and gravity metrics are 100% verified NASA GSFC measurements.
   - The Four-Segment breakdown is the official NASA Science Mission Directorate mission formulation standard.
   - Spacecraft components are modeled directly after real NASA flight hardware (e.g., BAE RAD750 flight computer, MMRTG plutonium-238 generators, SHARAD radar, LROC cameras, DSN 70m antennas, DSOC optical laser communications).
   - Speed-of-light delays (1.28s for Moon, ~12.5 min for Mars, ~40 min for Europa) are exact physics calculations.

2. **Educational Game Models:**
   - Trajectory mechanics are simplified into mission architecture archetypes (e.g., Polar Orbit, Aerobraking Elliptical, Resonant Jovian Flybys) rather than requiring numerical integration of N-body orbital ephemerides in GMAT.
   - Subsystem costs ($M) and mass budgets are calibrated for balanced educational gameplay while reflecting realistic proportional cost ratios (e.g., Super-heavy SLS launcher > Medium Atlas; MMRTG > Silicon solar).
   - Component reliability is modeled using probabilistic MTBF indices to teach single-point failure trade-offs.

---

## 3. Verified Reference Links
- NASA Science Mission Directorate: https://science.nasa.gov/learn/design-and-develop-science-missions/
- NASA NSSDC Planetary Fact Sheet: https://nssdc.gsfc.nasa.gov/planetary/factsheet/
- NASA Systems Engineering Handbook: https://www.nasa.gov/reference/systems-engineering-handbook/
- NASA CubeSat 101: https://www.nasa.gov/reference/cubesat-101/
- NASA Deep Space Network: https://deepspace.jpl.nasa.gov/about/
- NASA Mars Exploration Program: https://mars.nasa.gov/
- NASA Europa Clipper: https://europa.nasa.gov/

