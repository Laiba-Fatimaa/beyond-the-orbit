# NASA SPACE APPS CHALLENGE 2026 — OFFICIAL PROJECT SUBMISSION

**Project Title:** BEYOND THE ORBIT  
**Tagline:** YOUR NEXT FRONTIER IS UNKNOWN.  
**Challenge:** Space Mission Design Game  
**Event:** NASA Space Apps Challenge 2026 — Faisalabad Local Event  
**Team Name:** Orbitera  

---

## 1. High-Level Summary

**BEYOND THE ORBIT** is a single-player educational space mission design and simulation game that places players in the role of a NASA Flight Director and Chief Systems Engineer. 

Designing a space exploration mission requires balancing deeply interconnected engineering trade-offs: payload mass vs. launcher capacity, solar energy loss vs. nuclear power costs, communication latency vs. autonomy, and scientific instrument yield vs. survival in hostile planetary environments. Traditional educational materials teach these concepts in isolation, obscuring how a mission operates as a single integrated system.

BEYOND THE ORBIT solves this by delivering a five-screen cinematic mission control experience. Grounded in the **NASA Science Mission Directorate Four-Segment Architecture** (Launch, Space, Ground, and User Segments) and **NASA Goddard Planetary Fact Sheets**, players design custom spacecraft for the **Moon**, **Mars**, or **Europa**, experience realistic in-flight operational crises, and evaluate their final mission through a transparent 100-point systems engineering debrief and downloadable flight report.

---

## 2. Project Demo

- **Application URL:** Local Streamlit deployment running on Python 3.11.
- **Repository:** https://github.com/Laiba-Fatimaa/beyond-the-orbit.git
- **Gameplay Walkthrough Video (Suggested 30-Second Script below)**
- **Report Samples:** Standalone interactive HTML debrief report and ReportLab PDF generated natively in-game.

---

## 3. Final Project

The final project is a complete, fully functional software application implemented in Python and Streamlit with custom CSS and SVG visual architectures. It comprises 5 interconnected screens:

1. **Cinematic Landing Page:** Introduces the project identity, the player's role, and core educational pillars with an animated deep-space interface.
2. **Mission Selection:** Offers three distinct destinations—**Lunar Explorer** (Moon), **Mars Discovery** (Mars), and **Europa Frontier** (Europa)—each with unique scientific objectives, real planetary constraints, and distinct budgets.
3. **Mission Planning & Spacecraft Design:** A full engineering lab where players configure the four mission segments:
   - *Launch Segment:* Match payload to launch vehicle performance envelopes.
   - *Space Segment:* Select bus structure, power generation (Silicon vs. UltraFlex GaAs vs. MMRTG Nuclear), batteries, comms, avionics, ADCS propulsion, thermal loops, and scientific payload (Camera, Spectrometer, Radar, Radiometer, Particle Detector).
   - *Orbit Architecture:* Destination-tailored flight profiles (e.g., polar low orbit, aerobraking elliptical, resonant flybys).
   - *Ground & User Segments:* Earth tracking networks (NSN, DSN 34m, DSN 70m) and planetary data ingestion pipelines.
   - *Live Telemetry & 3-State Validation Engine:* Live updates for mass margins (NASA 15-20% guideline), budget, power balance ($1/r^2$ inverse-square law), and telemetry downlink rates, producing `READY FOR LAUNCH`, `NEEDS ATTENTION`, or `LAUNCH BLOCKED` status.
4. **Mission Simulation:** Step through 5-8 destination-specific operational anomalies per mission (dust storms, radiation flares, light delays, plume encounters). Decisions dynamically interact with installed hardware.
5. **Mission Debrief & Scoring:** A 100-point transparent evaluation across 6 aerospace engineering categories, presenting lessons learned, scientific objective milestones, and downloadable HTML/PDF reports.

---

## 4. Project Details

### Technical Architecture
- **Language / Runtime:** Python 3.11
- **UI & Interaction:** Streamlit 1.66+ with custom CSS styling, responsive layout, and SVG vector graphics
- **Export Engine:** Native HTML5 printable export and ReportLab 5.1 PDF generation
- **State Architecture:** Unified session state tracking design choices, flight logs, telemetry, and objective achievements
- **Physical Models:**
  - *Solar Irradiance Decay:* $P(r) = P_0 \times (r_{\text{Earth}} / r)^2$, enforcing severe power loss at Mars ($589 \text{ W/m}^2$) and Europa ($50.3 \text{ W/m}^2$).
  - *NASA Margin Rules:* Enforces the NASA Systems Engineering Handbook standard (15-20% contingency margin).
  - *Light Delay:* Radio signal delays calculated based on speed of light (1.28s to 42 min).

---

## 5. Use of SI (Synthetic Intelligence / Artificial Intelligence)

In adherence to NASA Space Apps Challenge AI disclosure rules:
- **AI Tools Used:** Google DeepMind / Google Antigravity Agent.
- **Development Contributions:** AI assisted with architectural code generation, modular Python engineering, CSS design system drafting, and test suite automation.
- **Data Integrity:** No planetary facts, NASA URLs, or physical constants were hallucinated or fabricated by AI. All constants were verified against official NASA Goddard Space Flight Center Planetary Fact Sheets and NASA Technical Reports.
- **No AI-generated logos:** Official NASA insignia were not altered or falsely generated.

---

## 6. Space Agency Data

Official NASA resources utilized directly in the application:
1. **NASA Science Mission Directorate (SMD):** *Design and Develop Science Missions* (Four-Segment Architecture).
2. **NASA Goddard Space Flight Center (GSFC):** *NSSDC Planetary Fact Sheets* (Planetary physical constants).
3. **NASA Headquarters:** *NASA Systems Engineering Handbook (NASA/SP-2016-6105 Rev 2)* (Margin policies).
4. **NASA Small Spacecraft Technology Program:** *CubeSat 101* (Subsystem breakdown).
5. **NASA Jet Propulsion Laboratory (JPL):** *Deep Space Network (DSN) Telecommunications Link Handbook* (Antennas & link budgets).

Detailed parameter mapping is documented in [NASA_DATA_RECORD.md](NASA_DATA_RECORD.md).

---

## 7. References

1. NASA Science Mission Directorate: https://science.nasa.gov/learn/design-and-develop-science-missions/
2. NASA Goddard Space Flight Center Planetary Fact Sheets: https://nssdc.gsfc.nasa.gov/planetary/factsheet/
3. NASA Systems Engineering Handbook: https://www.nasa.gov/reference/systems-engineering-handbook/
4. NASA CubeSat 101: https://www.nasa.gov/reference/cubesat-101/
5. NASA Deep Space Network: https://deepspace.jpl.nasa.gov/about/
6. NASA Europa Clipper Mission: https://europa.nasa.gov/
7. NASA Mars Exploration: https://mars.nasa.gov/

---

## Appendix A: Suggested 7-Slide Pitch Presentation Outline

- **Slide 1: Title & Vision** — *Beyond The Orbit: Your Next Frontier is Unknown.* Team Orbitera. The problem: space systems engineering is taught in disconnected silos.
- **Slide 2: The Core Innovation** — Bridging the gap: an interactive mission design simulation based on NASA SMD's Four-Segment Architecture.
- **Slide 3: Destination Dilemmas** — Moon (polar ice vs. 14-day night), Mars (dust storms vs. 14m light delay), Europa (ocean plumes vs. 50 W/m² solar starvation & lethal radiation).
- **Slide 4: Systems Engineering Lab** — Live trade-off engine: mass margins (NASA 20%), power balance, downlink bandwidth, and 3-state validation.
- **Slide 5: Live Flight Operations** — Hardware-connected decision-making: surviving radiation storms, dust occlusions, and cryogenic freezes.
- **Slide 6: Transparent Evaluation** — 100-point aerospace scorecard, objectives verification, lessons learned, and downloadable PDF debrief.
- **Slide 7: Educational Impact & NASA Data** — Real NASA Planetary Fact Sheet integration, authentic systems engineering pedagogy.

---

## Appendix B: Suggested 30-Second Video Script

**[Visual: Cinematic landing page with glowing telemetry]**  
**VO (0:00 - 0:08):** "Designing a space mission isn’t just about building a rocket. It’s an interconnected puzzle of mass, power, communications, and planetary survival."

**[Visual: Quick cut to Spacecraft Planning screen, selecting MMRTG and Radar, showing live validation bar turning Cyan]**  
**VO (0:08 - 0:18):** "In *Beyond The Orbit*, you are the Flight Director. Choose between the Moon, Mars, or Europa. Balance real NASA engineering margins across launch, space, ground, and science segments."

**[Visual: Mars dust storm event with branching command options, followed by the debrief score screen and PDF report download]**  
**VO (0:18 - 0:26):** "Face realistic in-flight crises where your spacecraft hardware dictates your survival. Learn from every decision with a detailed 100-point systems debrief."

**[Visual: Title Card: BEYOND THE ORBIT — YOUR NEXT FRONTIER IS UNKNOWN.]**  
**VO (0:26 - 0:30):** "*Beyond The Orbit.* Built for NASA Space Apps Challenge 2026."
