# BEYOND THE ORBIT

### Your Next Frontier Is Unknown.

**NASA Space Apps Challenge 2026 | Faisalabad Local Event**  
**Project:** Space Mission Design Game  
**Team:** Orbitera

---

## Overview

**Beyond the Orbit** is an interactive educational prototype of a space mission design and simulation game developed for the NASA Space Apps Challenge 2026.

Players take on the role of a mission planner, choosing between three destinations — the Moon, Mars, and Europa. They configure spacecraft systems, manage mission resources, respond to simulated challenges, and explore scientific objectives.

Inspired by NASA's Science Mission Directorate Four-Segment Mission Architecture, the project introduces space mission planning and systems engineering through an interactive learning experience.

**This is an educational prototype, not a professional spacecraft simulator.** Its calculations and mission scenarios are simplified for demonstration and learning purposes.

## Key Features

- **Three Mission Destinations:** Explore the Moon, Mars, and Europa, each with different environmental conditions and scientific objectives.
- **Spacecraft Configuration:** Select launch vehicles, power systems, propulsion, communication equipment, thermal protection, and scientific instruments.
- **Mission Readiness Checks:** Evaluate payload mass, power availability, communication constraints, and resource margins.
- **Simulated Flight Operations:** Experience launch sequences, deep-space travel, and unexpected mission events.
- **Scientific Reconnaissance:** Scan selected planetary targets, including Shackleton Crater, Jezero Delta, and Conamara Chaos.
- **Mission Debrief:** Receive a performance score based on six categories, with downloadable HTML and PDF reports.

## Mission Architecture

The prototype draws inspiration from NASA's Four-Segment Mission Architecture:

- **Launch Segment:** Launch vehicle and payload delivery.
- **Space Segment:** Spacecraft bus and scientific instruments.
- **Ground Segment:** Communication and tracking support.
- **User Segment:** Science-data processing and access.

## Technologies Used

- **Frontend:** HTML5, CSS3, JavaScript ES6, Canvas, SVG
- **Backend:** Python 3.11, Streamlit
- **Reports:** ReportLab
- **Audio:** Web Audio API
- **Testing:** Python-based frontend, game logic, and integration tests

## Scientific Concepts

The educational models introduce selected concepts such as:

- Inverse-square law and solar power availability.
- Speed of light and communication delay.
- Payload mass, resource management, and contingency margins.
- Spacecraft subsystem integration and mission reliability.

These models are simplified and are not intended for actual spacecraft engineering.

## NASA Resources and Attribution

The project uses NASA-related scientific references and space imagery documented in the repository.

- [NASA Science Mission Directorate](https://science.nasa.gov/learn/design-and-develop-science-missions/)
- [NASA Planetary Fact Sheets](https://nssdc.gsfc.nasa.gov/planetary/factsheet/)
- [NASA Systems Engineering Handbook](https://www.nasa.gov/reference/systems-engineering-handbook/)
- [NASA Deep Space Network](https://deepspace.jpl.nasa.gov/about/)

For image sources and additional documentation, see:

- [IMAGE_ATTRIBUTION.md](IMAGE_ATTRIBUTION.md)
- [NASA_DATA_RECORD.md](NASA_DATA_RECORD.md)

## Run Locally

### Prerequisites

- Python 3.11 or later
- Git
- A modern web browser

### 1. Clone the Repository

```bash
git clone https://github.com/Laiba-Fatimaa/beyond-the-orbit.git
cd beyond-the-orbit
```

### 2. Run the Streamlit Application

Install the required dependencies:

```bash
pip install -r requirements.txt
```

Start the application:

```bash
streamlit run app.py
```

Open the local URL displayed in your terminal, usually:

```text
http://localhost:8501
```

### 3. Run the Standalone Frontend

The project also includes a standalone frontend.

From the project directory, run:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Alternatively, open `index.html` directly in your browser.

**Note:** The standalone frontend and Streamlit application are separate ways to run the project. The standalone version does not require Streamlit, while the Streamlit version uses the Python backend.

## Project Structure

```text
beyond-the-orbit/
│
├── app.py
├── index.html
├── missions.py
├── spacecraft.py
├── game_logic.py
├── events.py
├── scoring.py
├── report_generator.py
├── components.py
├── styles.py
├── nasa_data.py
│
├── css/
├── js/
├── assets/
│
├── test_frontend.py
├── test_game.py
├── test_integration.py
├── requirements.txt
│
├── IMAGE_ATTRIBUTION.md
├── NASA_DATA_RECORD.md
├── PROJECT_SUBMISSION.md
└── README.md
```

## Project Links

- **GitHub Repository:** https://github.com/Laiba-Fatimaa/beyond-the-orbit
- **Project Presentation:** https://gamma.app/docs/BEYOND-THE-ORBIT-qpe5tpx84puk9hu
- **GitHub Pages:** https://laiba-fatimaa.github.io/beyond-the-orbit/ *(intended deployment address; availability subject to deployment configuration)*

## Prototype Scope

Beyond the Orbit demonstrates selected space mission design concepts through simplified calculations, interactive spacecraft configuration, and simulated mission events.

It does not reproduce the full complexity of real NASA missions or provide operational spacecraft control. Its purpose is to make space science and systems engineering more accessible through experimentation and interactive learning.

---

**ORBITERA**  
*Exploring beyond boundaries. Building beyond expectations.*

NASA Space Apps Challenge 2026
