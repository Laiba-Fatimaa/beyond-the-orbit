"""
BEYOND THE ORBIT — Space Mission Design Game
============================================
NASA Space Apps Challenge 2026 — Faisalabad Local Event
Team: Orbitera | Tagline: YOUR NEXT FRONTIER IS UNKNOWN.

Main interactive application powering the 5 core screens:
1. Cinematic Landing Page
2. Mission Selection
3. Spacecraft Engineering & Mission Planning (Four Segments)
4. Interactive Mission Simulation & Decision Engine
5. Mission Debrief, Evaluation & PDF/HTML Export
"""

import streamlit as st
import time
from typing import Dict, Any, List

# Core modules
from missions import MISSIONS, get_mission, list_missions
from spacecraft import (
    LAUNCH_VEHICLES,
    STRUCTURE_OPTIONS,
    POWER_GENERATION_OPTIONS,
    BATTERY_OPTIONS,
    COMMUNICATION_OPTIONS,
    AVIONICS_OPTIONS,
    PROPULSION_OPTIONS,
    THERMAL_OPTIONS,
    INSTRUMENT_CATALOG,
    GROUND_SEGMENT_OPTIONS,
    USER_SEGMENT_OPTIONS
)
from game_logic import calculate_mission_design
from events import MISSION_EVENTS, apply_event_choice
from scoring import evaluate_mission
from report_generator import generate_html_report, generate_pdf_report
from components import render_celestial_svg, render_spacecraft_schematic
from nasa_data import NASA_REFERENCES, PLANETARY_DATA, get_nasa_fact_callout
from styles import MAIN_CSS

# -------------------------------------------------------------
# PAGE CONFIGURATION & STYLES
# -------------------------------------------------------------
st.set_page_config(
    page_title="BEYOND THE ORBIT | Space Mission Design Game",
    page_icon="🚀",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.markdown(MAIN_CSS, unsafe_allow_html=True)

# -------------------------------------------------------------
# SESSION STATE INITIALIZATION
# -------------------------------------------------------------
if "screen" not in st.session_state:
    st.session_state.screen = "landing"  # landing, selection, planning, simulation, debrief

if "mission_id" not in st.session_state:
    st.session_state.mission_id = "lunar_explorer"

if "config" not in st.session_state:
    st.session_state.config = {
        "launch_vehicle": "lv_medium",
        "architecture": "polar_low_orbit",
        "structure": "struct_aluminum",
        "power_gen": "pwr_silicon",
        "battery": "bat_li_ion",
        "comms": "comm_x_band",
        "avionics": "av_rad750",
        "propulsion": "prop_monoprop",
        "thermal": "thm_active",
        "instruments": ["camera", "spectrometer"],
        "ground_segment": "ground_nsn",
        "user_segment": "user_multicenter"
    }

if "sim_state" not in st.session_state:
    st.session_state.sim_state = {
        "event_idx": 0,
        "health_pct": 100.0,
        "power_pct": 100.0,
        "data_collected_mb": 0.0,
        "data_transmitted_mb": 0.0,
        "science_points": 0.0,
        "log": [],
        "completed": False,
        "last_consequence": ""
    }

def reset_simulation():
    """Resets the simulation telemetry to starting conditions."""
    st.session_state.sim_state = {
        "event_idx": 0,
        "health_pct": 100.0,
        "power_pct": 100.0,
        "data_collected_mb": 0.0,
        "data_transmitted_mb": 0.0,
        "science_points": 0.0,
        "log": [],
        "completed": False,
        "last_consequence": ""
    }

def set_mission(mission_id: str):
    """Sets new mission and default architecture."""
    st.session_state.mission_id = mission_id
    mission = get_mission(mission_id)
    st.session_state.config["architecture"] = mission["suggested_architectures"][0]["id"]
    # Sensible defaults for target
    if mission_id == "europa_frontier":
        st.session_state.config["launch_vehicle"] = "lv_heavy"
        st.session_state.config["structure"] = "struct_vault"
        st.session_state.config["power_gen"] = "pwr_mmrtg"
        st.session_state.config["ground_segment"] = "ground_dsn_34m"
    elif mission_id == "mars_discovery":
        st.session_state.config["launch_vehicle"] = "lv_medium"
        st.session_state.config["ground_segment"] = "ground_nsn"
    reset_simulation()

# -------------------------------------------------------------
# SIDEBAR NAVIGATION & TELEMETRY
# -------------------------------------------------------------
with st.sidebar:
    st.markdown("""
        <div style="text-align: center; padding: 10px 0 15px 0; border-bottom: 1px solid #1E2D4A;">
            <div style="font-family:'Orbitron', sans-serif; font-size:18px; font-weight:800; color:#43D9FF; letter-spacing:1.5px;">
                BEYOND THE ORBIT
            </div>
            <div style="font-family:'Rajdhani', sans-serif; font-size:12px; color:#9BAAC2; margin-top:2px;">
                YOUR NEXT FRONTIER IS UNKNOWN.
            </div>
            <div style="font-size:10px; color:#3D7BFF; margin-top:4px; font-weight:600;">
                NASA SPACE APPS 2026 | TEAM ORBITERA
            </div>
        </div>
    """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown("<div style='font-family:Rajdhani; font-size:13px; color:#9BAAC2; font-weight:bold; letter-spacing:1px;'>MISSION WORKFLOW</div>", unsafe_allow_html=True)

    screens = [
        ("landing", "1. Mission Briefing"),
        ("selection", "2. Destination Select"),
        ("planning", "3. Spacecraft Engineering"),
        ("simulation", "4. Mission Flight Simulation"),
        ("debrief", "5. Flight Debrief & Score")
    ]

    for scr_id, scr_label in screens:
        is_active = st.session_state.screen == scr_id
        btn_label = f"▶ {scr_label}" if is_active else scr_label
        if st.button(btn_label, key=f"nav_{scr_id}", use_container_width=True):
            st.session_state.screen = scr_id
            st.rerun()

    st.markdown("<br>", unsafe_allow_html=True)

    # Active Mission Mini-Telemetry
    cur_mission = get_mission(st.session_state.mission_id)
    st.markdown(f"""
        <div style="background:#0B1224; border:1px solid #1E2D4A; border-radius:8px; padding:12px; margin-top:10px;">
            <div style="font-family:'Orbitron', sans-serif; font-size:11px; color:#43D9FF;">ACTIVE TARGET</div>
            <div style="font-size:15px; font-weight:bold; color:#F4F7FF; margin-top:2px;">{cur_mission['name']}</div>
            <div style="font-size:11px; color:#9BAAC2;">Destination: {cur_mission['destination']}</div>
            <div style="font-size:11px; color:#FFB547; margin-top:4px;">Budget: ${cur_mission['budget_million']}M</div>
        </div>
    """, unsafe_allow_html=True)

    # NASA Resource Quick Reference Expander
    with st.expander("📚 NASA Data Sources & Reference"):
        st.markdown("""
        **Official NASA Challenge Resources Integrated:**
        - **NASA SMD**: *Design & Develop Science Missions* (Four Segments)
        - **NASA GSFC**: *Planetary Fact Sheets* (Solar Flux, Distance, Gravity)
        - **NASA Systems Engineering Handbook** (20% Mass Contingency Margin)
        - **NASA JPL**: *Deep Space Network (DSN) Telecommunications Link Handbook*
        - **NASA CubeSat 101**: Subsystems Architecture (EPS, CDH, ADCS, Payload)
        """)

    if st.button("🔄 Reset Mission State", use_container_width=True):
        reset_simulation()
        st.session_state.screen = "landing"
        st.rerun()


# =============================================================
# SCREEN 1 — CINEMATIC LANDING PAGE
# =============================================================
if st.session_state.screen == "landing":
    st.markdown("""
        <div class="mission-header" style="flex-direction: column; text-align: center; padding: 45px 20px 35px 20px;">
            <div style="font-family:'Rajdhani', sans-serif; font-size:14px; font-weight:700; color:#3D7BFF; letter-spacing:2px; text-transform:uppercase;">
                NASA Space Apps Challenge 2026 — Faisalabad Local Event | Team Orbitera
            </div>
            <h1 style="font-size: 46px; font-weight: 900; color: #43D9FF; margin: 10px 0; text-shadow: 0 0 30px rgba(67, 217, 255, 0.4);">
                BEYOND THE ORBIT
            </h1>
            <div style="font-family:'Orbitron', sans-serif; font-size: 17px; font-weight: 700; color: #FFB547; letter-spacing: 2px;">
                YOUR NEXT FRONTIER IS UNKNOWN.
            </div>
            <p style="max-width: 780px; margin: 18px auto 0 auto; font-size: 15px; color: #CAD5E8; line-height: 1.6;">
                Step into the shoes of a NASA Flight Director and Chief Systems Engineer. 
                Experience the authentic trade-offs of designing, building, and operating deep-space exploration missions. 
                Balance payload mass, electrical power margins, link budgets, and radiation hardening against the uncompromising physics of the Solar System.
            </p>
        </div>
    """, unsafe_allow_html=True)

    # CTA Button
    c1, c2, c3 = st.columns([1, 2, 1])
    with c2:
        if st.button("🚀 INITIALIZE MISSION DESIGN", type="primary", use_container_width=True):
            st.session_state.screen = "selection"
            st.rerun()

    st.markdown("<br>", unsafe_allow_html=True)

    # Core Pillar Highlights
    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown("""
            <div class="mc-card">
                <div style="font-family:'Orbitron', sans-serif; font-size:14px; color:#43D9FF; font-weight:700;">
                    01. FOUR-SEGMENT ARCHITECTURE
                </div>
                <p style="font-size:13px; color:#9BAAC2; margin-top:8px; line-height:1.5;">
                    Modeled directly on the <strong>NASA Science Mission Directorate (SMD)</strong> framework: 
                    configure the <em>Launch Segment</em>, <em>Space Segment</em>, <em>Ground Segment</em>, and <em>User Science Segment</em> into a unified flight system.
                </p>
            </div>
        """, unsafe_allow_html=True)

    with col2:
        col_dest = "02. REAL PLANETARY PHYSICS"
        st.markdown(f"""
            <div class="mc-card">
                <div style="font-family:'Orbitron', sans-serif; font-size:14px; color:#FFB547; font-weight:700;">
                    {col_dest}
                </div>
                <p style="font-size:13px; color:#9BAAC2; margin-top:8px; line-height:1.5;">
                    Grounded in <strong>NASA Goddard Planetary Fact Sheets</strong>. 
                    Experience authentic distance delays (up to 42 min), inverse-square solar power penalties (50 W/m² at Europa), and extreme radiation belts.
                </p>
            </div>
        """, unsafe_allow_html=True)

    with col3:
        st.markdown("""
            <div class="mc-card">
                <div style="font-family:'Orbitron', sans-serif; font-size:14px; color:#3D7BFF; font-weight:700;">
                    03. DYNAMIC SIMULATION & SCORING
                </div>
                <p style="font-size:13px; color:#9BAAC2; margin-top:8px; line-height:1.5;">
                    Navigate 5-8 in-flight operational crises per mission where decisions interact with your physical spacecraft build. 
                    Receive a transparent 100-point systems engineering debrief and downloadable report.
                </p>
            </div>
        """, unsafe_allow_html=True)

    # Destination Teaser Cards
    st.markdown("<h3 style='color:#F4F7FF; text-align:center; margin: 30px 0 20px 0;'>EXPLORATION DESTINATIONS</h3>", unsafe_allow_html=True)
    d1, d2, d3 = st.columns(3)

    with d1:
        st.markdown(render_celestial_svg("Moon"), unsafe_allow_html=True)
        st.markdown("""
            <div style="text-align:center; margin-top:8px;">
                <strong style="color:#F4F7FF; font-size:16px;">LUNAR EXPLORER</strong><br>
                <span style="color:#9BAAC2; font-size:12px;">Difficulty: Cadet (★★☆☆☆) | Budget: $280M</span>
            </div>
        """, unsafe_allow_html=True)

    with d2:
        st.markdown(render_celestial_svg("Mars"), unsafe_allow_html=True)
        st.markdown("""
            <div style="text-align:center; margin-top:8px;">
                <strong style="color:#F4F7FF; font-size:16px;">MARS DISCOVERY</strong><br>
                <span style="color:#9BAAC2; font-size:12px;">Difficulty: Flight Director (★★★★☆) | Budget: $520M</span>
            </div>
        """, unsafe_allow_html=True)

    with d3:
        st.markdown(render_celestial_svg("Europa"), unsafe_allow_html=True)
        st.markdown("""
            <div style="text-align:center; margin-top:8px;">
                <strong style="color:#F4F7FF; font-size:16px;">EUROPA FRONTIER</strong><br>
                <span style="color:#9BAAC2; font-size:12px;">Difficulty: Mission Director (★★★★★) | Budget: $880M</span>
            </div>
        """, unsafe_allow_html=True)


# =============================================================
# SCREEN 2 — MISSION SELECTION
# =============================================================
elif st.session_state.screen == "selection":
    st.markdown("""
        <div class="mission-header">
            <div>
                <div style="font-family:'Rajdhani', sans-serif; font-size:13px; color:#43D9FF; font-weight:700; letter-spacing:1px;">
                    MISSION ARCHITECTURE SELECTION
                </div>
                <h2 style="font-size:28px; margin:4px 0 0 0; color:#F4F7FF;">SELECT TARGET DESTINATION</h2>
            </div>
            <div style="text-align:right;">
                <span class="badge-ready">STATUS: SELECT DESTINATION</span>
            </div>
        </div>
    """, unsafe_allow_html=True)

    cols = st.columns(3)
    missions_list = list_missions()

    for idx, m in enumerate(missions_list):
        with cols[idx]:
            is_active = st.session_state.mission_id == m["id"]
            card_class = "mc-card mc-card-highlight" if is_active else "mc-card"

            st.markdown(f"""
                <div class="{card_class}">
                    <div style="font-family:'Orbitron', sans-serif; font-size:16px; font-weight:800; color:#43D9FF;">
                        {m['name'].upper()}
                    </div>
                    <div style="font-family:'Rajdhani', sans-serif; font-size:12px; color:#FFB547; font-weight:bold; margin-top:2px;">
                        {m['difficulty']} | {m['difficulty_stars']}
                    </div>
                    <div style="font-size:12px; color:#CAD5E8; margin: 10px 0; min-height: 55px; line-height: 1.4;">
                        {m['overview'][:160]}...
                    </div>
                    <div style="background:#080E1E; padding:8px 10px; border-radius:6px; font-size:11px; margin-bottom:10px;">
                        <div><strong style="color:#9BAAC2;">Destination:</strong> <span style="color:#F4F7FF;">{m['destination']}</span></div>
                        <div><strong style="color:#9BAAC2;">Budget Cap:</strong> <span style="color:#FFB547;">${m['budget_million']} Million</span></div>
                        <div><strong style="color:#9BAAC2;">Primary Target:</strong> <span style="color:#CAD5E8;">{m['primary_target']}</span></div>
                    </div>
                </div>
            """, unsafe_allow_html=True)

            st.markdown(render_celestial_svg(m["destination"]), unsafe_allow_html=True)

            # Scientific Objectives Preview
            with st.expander(f"🔬 Scientific Objectives ({len(m['scientific_objectives'])})"):
                for obj in m["scientific_objectives"]:
                    st.markdown(f"• **{obj['title']}** ({obj['points']} pts)\n  *{obj['description']}*")

            # Planetary Physics Data Callout
            fact = PLANETARY_DATA[m["destination"]]
            with st.expander("🪐 Planetary Physics (NASA GSFC)"):
                st.markdown(f"""
                - **Distance:** {fact['distance_km']:,} km
                - **Solar Irradiance:** {fact['solar_irradiance_wm2']} W/m²
                - **Light Delay (one-way):** {round(fact['light_time_one_way_s']/60, 1) if fact['light_time_one_way_s'] >= 60 else fact['light_time_one_way_s']} {'min' if fact['light_time_one_way_s'] >= 60 else 'sec'}
                - **Radiation Environment:** {fact['radiation_env']}
                - **NASA Missions:** {fact['nasa_missions']}
                """)

            if st.button(f"CHOOSE {m['name'].upper()}", key=f"sel_{m['id']}", type="primary" if is_active else "secondary", use_container_width=True):
                set_mission(m["id"])
                st.session_state.screen = "planning"
                st.rerun()


# =============================================================
# SCREEN 3 — MISSION PLANNING & SPACECRAFT DESIGN
# =============================================================
elif st.session_state.screen == "planning":
    mission = get_mission(st.session_state.mission_id)
    dest_name = mission["destination"]

    # Compute live mission calculations
    calc = calculate_mission_design(st.session_state.mission_id, st.session_state.config)

    # 1. LIVE TELEMETRY HEADER
    st.markdown(f"""
        <div class="mission-header" style="padding: 16px 24px;">
            <div>
                <div style="font-family:'Rajdhani', sans-serif; font-size:12px; color:#43D9FF; font-weight:700; letter-spacing:1px;">
                    MISSION DESIGN & SYSTEMS ENGINEERING LAB
                </div>
                <h2 style="font-size:24px; margin:2px 0 0 0; color:#F4F7FF;">
                    {mission['name'].upper()} — SPACECRAFT INTEGRATION
                </h2>
            </div>
            <div>
                <span class="{'badge-ready' if calc['validation_status']=='READY FOR LAUNCH' else ('badge-attention' if calc['validation_status']=='NEEDS ATTENTION' else 'badge-blocked')}">
                    {calc['validation_status']}
                </span>
            </div>
        </div>
    """, unsafe_allow_html=True)

    # 2. LIVE METRIC CARDS ROW
    mcol1, mcol2, mcol3, mcol4, mcol5 = st.columns(5)
    with mcol1:
        st.markdown(f"""
            <div class="telemetry-box">
                <div class="telemetry-val" style="color: {'#FF5263' if calc['total_mass_kg'] > calc['lv_max_payload_kg'] else '#43D9FF'};">
                    {calc['total_mass_kg']} <span style="font-size:14px;">kg</span>
                </div>
                <div class="telemetry-label">MASS / CAP ({calc['lv_max_payload_kg']:.0f} kg)</div>
                <div style="font-size:11px; color: {'#FF5263' if calc['mass_margin_pct']<0 else ('#FFB547' if calc['mass_margin_pct']<15 else '#43D9FF')}; margin-top:2px;">
                    Margin: {calc['mass_margin_pct']}% ({calc['mass_margin_kg']} kg)
                </div>
            </div>
        """, unsafe_allow_html=True)

    with mcol2:
        st.markdown(f"""
            <div class="telemetry-box">
                <div class="telemetry-val" style="color: {'#FF5263' if calc['budget_margin_million'] < 0 else '#FFB547'};">
                    ${calc['total_cost_million']} <span style="font-size:14px;">M</span>
                </div>
                <div class="telemetry-label">COST / BUDGET (${calc['budget_million']:.0f}M)</div>
                <div style="font-size:11px; color: {'#FF5263' if calc['budget_margin_million']<0 else '#CAD5E8'}; margin-top:2px;">
                    Reserve: ${calc['budget_margin_million']}M ({calc['budget_margin_pct']}%)
                </div>
            </div>
        """, unsafe_allow_html=True)

    with mcol3:
        st.markdown(f"""
            <div class="telemetry-box">
                <div class="telemetry-val" style="color: {'#FF5263' if calc['power_balance_w'] < -20 else ('#FFB547' if calc['power_balance_w'] < 0 else '#43D9FF')};">
                    {calc['power_balance_w']:+0.0f} <span style="font-size:14px;">W</span>
                </div>
                <div class="telemetry-label">POWER BALANCE</div>
                <div style="font-size:11px; color:#CAD5E8; margin-top:2px;">
                    Gen: {calc['power_generation_w']:.0f}W | Load: {calc['power_consumption_w']:.0f}W
                </div>
            </div>
        """, unsafe_allow_html=True)

    with mcol4:
        st.markdown(f"""
            <div class="telemetry-box">
                <div class="telemetry-val" style="color: {'#FFB547' if calc['data_balance_mb'] < 0 else '#43D9FF'};">
                    {calc['daily_downlink_capacity_mb']:.0f} <span style="font-size:14px;">MB/d</span>
                </div>
                <div class="telemetry-label">DOWNLINK CAPACITY</div>
                <div style="font-size:11px; color:#CAD5E8; margin-top:2px;">
                    Data Rate: {calc['daily_data_generated_mb']:.0f} MB/d gen
                </div>
            </div>
        """, unsafe_allow_html=True)

    with mcol5:
        st.markdown(f"""
            <div class="telemetry-box">
                <div class="telemetry-val" style="color: {'#43D9FF' if calc['composite_reliability_pct'] >= 80 else '#FFB547'};">
                    {calc['composite_reliability_pct']}%
                </div>
                <div class="telemetry-label">SYSTEM RELIABILITY</div>
                <div style="font-size:11px; color:#CAD5E8; margin-top:2px;">
                    Yield: {calc['projected_science_yield']} pts
                </div>
            </div>
        """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # 3. INTERACTIVE SPACECRAFT SCHEMATIC & VALIDATION MESSAGES
    schem_col, val_col = st.columns([1, 1])
    with schem_col:
        st.markdown(render_spacecraft_schematic(calc), unsafe_allow_html=True)
    with val_col:
        st.markdown("""
            <div style="background:#0B1224; border:1px solid #1E2D4A; border-radius:8px; padding:14px; min-height:190px;">
                <div style="font-family:'Orbitron', sans-serif; font-size:12px; color:#43D9FF; margin-bottom:8px;">
                    FLIGHT READINESS CRITIQUE
                </div>
        """, unsafe_allow_html=True)

        if calc["blockers"]:
            for b in calc["blockers"]:
                st.markdown(f"<div style='color:#FF5263; font-size:12.5px; margin-bottom:4px;'>✖ <strong>BLOCKER:</strong> {b}</div>", unsafe_allow_html=True)
        if calc["warnings"]:
            for w in calc["warnings"]:
                st.markdown(f"<div style='color:#FFB547; font-size:12px; margin-bottom:4px;'>▲ <strong>CAUTION:</strong> {w}</div>", unsafe_allow_html=True)
        if calc["confirmations"]:
            for c in calc["confirmations"][:2]:
                st.markdown(f"<div style='color:#43D9FF; font-size:12px; margin-bottom:3px;'>✔ <strong>VERIFIED:</strong> {c}</div>", unsafe_allow_html=True)

        st.markdown("</div>", unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # 4. FOUR-SEGMENT ENGINEERING TABS
    st.markdown("<div style='font-family:Orbitron; font-size:14px; color:#F4F7FF; margin-bottom:6px;'>FOUR-SEGMENT MISSION DESIGN (NASA SMD MODEL)</div>", unsafe_allow_html=True)
    tab_a, tab_b, tab_c, tab_d = st.tabs([
        "A. LAUNCH SEGMENT",
        "B. SPACE SEGMENT (BUS & PAYLOAD)",
        "C. ORBIT & MISSION ARCHITECTURE",
        "D. GROUND & USER SEGMENTS"
    ])

    # ------------------ TAB A: LAUNCH SEGMENT ------------------
    with tab_a:
        st.markdown("""
            <div class="nasa-badge">
                <strong>[NASA SMD Launch Segment]</strong> The launch vehicle must deliver sufficient translunar/interplanetary injection velocity (C3) while respecting fairing acoustic limits and mass capability envelopes.
            </div>
        """, unsafe_allow_html=True)

        lv_options = list(LAUNCH_VEHICLES.keys())
        current_lv_idx = lv_options.index(st.session_state.config.get("launch_vehicle", "lv_medium"))
        selected_lv_key = st.selectbox(
            "Select Launch Vehicle Architecture:",
            options=lv_options,
            index=current_lv_idx,
            format_func=lambda k: f"{LAUNCH_VEHICLES[k]['name']} — ${LAUNCH_VEHICLES[k]['cost_million']}M (Cap to {dest_name}: {LAUNCH_VEHICLES[k]['max_payload_kg'][dest_name]} kg)"
        )
        st.session_state.config["launch_vehicle"] = selected_lv_key
        sel_lv = LAUNCH_VEHICLES[selected_lv_key]

        l1, l2 = st.columns(2)
        with l1:
            st.markdown(f"**Vehicle Class:** {sel_lv['class']}")
            st.markdown(f"**Reliability Rating:** {int(sel_lv['reliability']*100)}%")
            st.markdown(f"**NASA Analogue:** *{sel_lv['nasa_note']}*")
        with l2:
            st.markdown(f"**Pros:** {sel_lv['pros']}")
            st.markdown(f"**Limitations:** {sel_lv['cons']}")

    # ------------------ TAB B: SPACE SEGMENT ------------------
    with tab_b:
        st.markdown("""
            <div class="nasa-badge">
                <strong>[NASA CubeSat 101 & Systems Engineering]</strong> The space segment integrates structural bus mechanics, electrical power (EPS), command & data (CDH), radio frequency communications, attitude control (ADCS), thermal management, and scientific payloads.
            </div>
        """, unsafe_allow_html=True)

        bcol1, bcol2 = st.columns(2)
        with bcol1:
            # Structure
            struct_opts = list(STRUCTURE_OPTIONS.keys())
            st.session_state.config["structure"] = st.selectbox(
                "Primary Structure & Radiation Shielding:",
                options=struct_opts,
                index=struct_opts.index(st.session_state.config.get("structure", "struct_aluminum")),
                format_func=lambda k: f"{STRUCTURE_OPTIONS[k]['name']} ({STRUCTURE_OPTIONS[k]['mass_kg']} kg, ${STRUCTURE_OPTIONS[k]['cost_million']}M)"
            )
            # Power Generation
            pwr_opts = list(POWER_GENERATION_OPTIONS.keys())
            st.session_state.config["power_gen"] = st.selectbox(
                "Electrical Power Subsystem (EPS) — Generation:",
                options=pwr_opts,
                index=pwr_opts.index(st.session_state.config.get("power_gen", "pwr_silicon")),
                format_func=lambda k: f"{POWER_GENERATION_OPTIONS[k]['name']} ({POWER_GENERATION_OPTIONS[k]['base_power_w']}W base, ${POWER_GENERATION_OPTIONS[k]['cost_million']}M)"
            )
            st.markdown(f"<div style='font-size:11.5px; color:#9BAAC2; margin-top:-8px;'>{get_nasa_fact_callout(dest_name, 'solar')}</div>", unsafe_allow_html=True)

            # Battery Storage
            bat_opts = list(BATTERY_OPTIONS.keys())
            st.session_state.config["battery"] = st.selectbox(
                "Energy Storage & Batteries:",
                options=bat_opts,
                index=bat_opts.index(st.session_state.config.get("battery", "bat_li_ion")),
                format_func=lambda k: f"{BATTERY_OPTIONS[k]['name']} ({BATTERY_OPTIONS[k]['capacity_wh']} Wh, ${BATTERY_OPTIONS[k]['cost_million']}M)"
            )

            # Propulsion / ADCS
            prop_opts = list(PROPULSION_OPTIONS.keys())
            st.session_state.config["propulsion"] = st.selectbox(
                "Propulsion & Attitude Determination (ADCS):",
                options=prop_opts,
                index=prop_opts.index(st.session_state.config.get("propulsion", "prop_monoprop")),
                format_func=lambda k: f"{PROPULSION_OPTIONS[k]['name']} (ΔV {PROPULSION_OPTIONS[k]['delta_v_ms']} m/s, ${PROPULSION_OPTIONS[k]['cost_million']}M)"
            )

        with bcol2:
            # Communications
            comm_opts = list(COMMUNICATION_OPTIONS.keys())
            st.session_state.config["comms"] = st.selectbox(
                "Radio Frequency & Optical Communications:",
                options=comm_opts,
                index=comm_opts.index(st.session_state.config.get("comms", "comm_x_band")),
                format_func=lambda k: f"{COMMUNICATION_OPTIONS[k]['name']} ({COMMUNICATION_OPTIONS[k]['max_data_rate_mb_day']} MB/d, ${COMMUNICATION_OPTIONS[k]['cost_million']}M)"
            )
            st.markdown(f"<div style='font-size:11.5px; color:#9BAAC2; margin-top:-8px;'>{get_nasa_fact_callout(dest_name, 'comms')}</div>", unsafe_allow_html=True)

            # Avionics / CDH
            av_opts = list(AVIONICS_OPTIONS.keys())
            st.session_state.config["avionics"] = st.selectbox(
                "Command & Data Handling (CDH / Avionics):",
                options=av_opts,
                index=av_opts.index(st.session_state.config.get("avionics", "av_rad750")),
                format_func=lambda k: f"{AVIONICS_OPTIONS[k]['name']} (${AVIONICS_OPTIONS[k]['cost_million']}M, Rad-Tol: {AVIONICS_OPTIONS[k]['rad_tolerance_krad']} krad)"
            )

            # Thermal Management
            thm_opts = list(THERMAL_OPTIONS.keys())
            st.session_state.config["thermal"] = st.selectbox(
                "Thermal Control System (TCS):",
                options=thm_opts,
                index=thm_opts.index(st.session_state.config.get("thermal", "thm_active")),
                format_func=lambda k: f"{THERMAL_OPTIONS[k]['name']} (${THERMAL_OPTIONS[k]['cost_million']}M)"
            )

            # Scientific Instruments (Multi-Select)
            st.markdown("**Scientific Instruments (Payload):**")
            all_insts = list(INSTRUMENT_CATALOG.keys())
            chosen_insts = st.multiselect(
                "Select scientific payloads to install:",
                options=all_insts,
                default=st.session_state.config.get("instruments", ["camera", "spectrometer"]),
                format_func=lambda k: f"{INSTRUMENT_CATALOG[k]['name']} (+{INSTRUMENT_CATALOG[k]['science_val']} pts, {INSTRUMENT_CATALOG[k]['mass_kg']}kg, {INSTRUMENT_CATALOG[k]['power_w']}W, ${INSTRUMENT_CATALOG[k]['cost_million']}M)"
            )
            st.session_state.config["instruments"] = chosen_insts

    # ------------------ TAB C: ORBIT & ARCHITECTURE ------------------
    with tab_c:
        st.markdown(f"""
            <div class="nasa-badge">
                <strong>[NASA Mission Architecture]</strong> Simplified orbital geometry and trajectory models for {dest_name}. 
                Trajectory design balances science observation geometry, solar illumination periods, and station-keeping fuel.
            </div>
        """, unsafe_allow_html=True)

        arch_choices = mission["suggested_architectures"]
        arch_ids = [a["id"] for a in arch_choices]
        curr_arch_idx = arch_ids.index(st.session_state.config.get("architecture", arch_ids[0])) if st.session_state.config.get("architecture") in arch_ids else 0

        selected_arch_id = st.radio(
            f"Select Mission Architecture for {dest_name}:",
            options=arch_ids,
            index=curr_arch_idx,
            format_func=lambda aid: next(a["name"] + f" (+${a['complexity_cost']}M, +{a['complexity_mass']}kg)" for a in arch_choices if a["id"] == aid)
        )
        st.session_state.config["architecture"] = selected_arch_id
        active_arch = next(a for a in arch_choices if a["id"] == selected_arch_id)

        st.markdown(f"**Operational Concept:** {active_arch['description']}")
        st.markdown(f"- **Science Observation Multiplier:** {active_arch['science_multiplier']}x")
        st.markdown(f"- **Communication Window Availability:** {active_arch['comm_window_pct']}% of orbit")

    # ------------------ TAB D: GROUND & USER SEGMENTS ------------------
    with tab_d:
        st.markdown("""
            <div class="nasa-badge">
                <strong>[NASA Ground & User Segments]</strong> A mission does not end at spacecraft injection. 
                Data must be downlinked across planetary distances via Earth ground networks, calibrated, and analyzed by the science working group.
            </div>
        """, unsafe_allow_html=True)

        gcol1, gcol2 = st.columns(2)
        with gcol1:
            st.markdown("### Ground Segment (Earth Tracking & Comms)")
            ground_opts = list(GROUND_SEGMENT_OPTIONS.keys())
            st.session_state.config["ground_segment"] = st.selectbox(
                "Ground Station Network Support:",
                options=ground_opts,
                index=ground_opts.index(st.session_state.config.get("ground_segment", "ground_nsn")),
                format_func=lambda k: f"{GROUND_SEGMENT_OPTIONS[k]['name']} (${GROUND_SEGMENT_OPTIONS[k]['cost_million']}M)"
            )
            sg = GROUND_SEGMENT_OPTIONS[st.session_state.config["ground_segment"]]
            st.markdown(f"*{sg['description']}*")
            st.markdown(f"- **Contact Hours:** {sg['contact_hours_day']} hrs/day | **Link Efficiency:** {int(sg['downlink_efficiency']*100)}%")

        with gcol2:
            st.markdown("### User Segment (Science & Data Pipeline)")
            user_opts = list(USER_SEGMENT_OPTIONS.keys())
            st.session_state.config["user_segment"] = st.selectbox(
                "User Segment & Science Consortium:",
                options=user_opts,
                index=user_opts.index(st.session_state.config.get("user_segment", "user_multicenter")),
                format_func=lambda k: f"{USER_SEGMENT_OPTIONS[k]['name']} (${USER_SEGMENT_OPTIONS[k]['cost_million']}M)"
            )
            su = USER_SEGMENT_OPTIONS[st.session_state.config["user_segment"]]
            st.markdown(f"*{su['description']}*")
            st.markdown(f"- **Science Pipeline Multiplier:** {su['science_pipeline_multiplier']}x")

    st.markdown("<br><hr style='border-color:#1E2D4A;'>", unsafe_allow_html=True)

    # 5. LAUNCH ACTION BUTTON
    act_col1, act_col2 = st.columns([1, 1])
    with act_col1:
        if st.button("⬅ RETURN TO MISSION SELECTION", use_container_width=True):
            st.session_state.screen = "selection"
            st.rerun()

    with act_col2:
        is_blocked = calc["validation_status"] == "LAUNCH BLOCKED"
        if is_blocked:
            st.button("✖ LAUNCH BLOCKED (RESOLVE SYSTEM CONFLICTS)", disabled=True, use_container_width=True)
            st.caption("Review flight readiness blockers above to qualify for launch.")
        else:
            launch_label = "🚀 LAUNCH MISSION INTO FLIGHT" if calc["validation_status"] == "READY FOR LAUNCH" else "⚠ ACCEPT RISKS & PROCEED TO LAUNCH"
            if st.button(launch_label, type="primary", use_container_width=True):
                reset_simulation()
                st.session_state.screen = "simulation"
                st.rerun()


# =============================================================
# SCREEN 4 — MISSION SIMULATION & DECISION SYSTEM
# =============================================================
elif st.session_state.screen == "simulation":
    mission = get_mission(st.session_state.mission_id)
    events = MISSION_EVENTS.get(st.session_state.mission_id, [])
    sim = st.session_state.sim_state
    calc = calculate_mission_design(st.session_state.mission_id, st.session_state.config)
    curr_idx = sim["event_idx"]
    total_events = len(events)

    # Telemetry HUD Header
    st.markdown(f"""
        <div class="mission-header" style="padding: 14px 24px;">
            <div>
                <div style="font-family:'Rajdhani', sans-serif; font-size:12px; color:#43D9FF; font-weight:700; letter-spacing:1px;">
                    MISSION CONTROL CENTER — LIVE TELEMETRY STREAM
                </div>
                <h2 style="font-size:24px; margin:2px 0 0 0; color:#F4F7FF;">
                    {mission['name'].upper()} FLIGHT OPERATIONS
                </h2>
            </div>
            <div>
                <span class="badge-ready">
                    PHASE {min(curr_idx + 1, total_events)} OF {total_events}
                </span>
            </div>
        </div>
    """, unsafe_allow_html=True)

    # Live Flight Telemetry Gauges
    tcol1, tcol2, tcol3, tcol4, tcol5 = st.columns(5)
    with tcol1:
        st.markdown(f"""
            <div class="telemetry-box">
                <div class="telemetry-val" style="color: {'#43D9FF' if sim['health_pct']>70 else ('#FFB547' if sim['health_pct']>40 else '#FF5263')};">
                    {sim['health_pct']:.0f}%
                </div>
                <div class="telemetry-label">SPACECRAFT HEALTH</div>
            </div>
        """, unsafe_allow_html=True)

    with tcol2:
        st.markdown(f"""
            <div class="telemetry-box">
                <div class="telemetry-val" style="color: {'#43D9FF' if sim['power_pct']>60 else ('#FFB547' if sim['power_pct']>30 else '#FF5263')};">
                    {sim['power_pct']:.0f}%
                </div>
                <div class="telemetry-label">POWER RESERVE</div>
            </div>
        """, unsafe_allow_html=True)

    with tcol3:
        st.markdown(f"""
            <div class="telemetry-box">
                <div class="telemetry-val" style="color: #43D9FF;">
                    {sim['data_collected_mb']:.0f} <span style="font-size:13px;">MB</span>
                </div>
                <div class="telemetry-label">DATA BUFFERED</div>
            </div>
        """, unsafe_allow_html=True)

    with tcol4:
        st.markdown(f"""
            <div class="telemetry-box">
                <div class="telemetry-val" style="color: #3D7BFF;">
                    {sim['data_transmitted_mb']:.0f} <span style="font-size:13px;">MB</span>
                </div>
                <div class="telemetry-label">DATA DOWNLINKED</div>
            </div>
        """, unsafe_allow_html=True)

    with tcol5:
        st.markdown(f"""
            <div class="telemetry-box">
                <div class="telemetry-val" style="color: #FFB547;">
                    {sim['science_points']:.0f}
                </div>
                <div class="telemetry-label">SCIENCE YIELD PTS</div>
            </div>
        """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # Check if simulation is completed
    if curr_idx >= total_events or sim.get("completed", False):
        st.markdown(f"""
            <div class="mc-card" style="text-align:center; padding:35px 20px;">
                <h2 style="color:#43D9FF; font-size:28px;">FLIGHT MISSION COMPLETE</h2>
                <p style="color:#CAD5E8; max-width:650px; margin:10px auto 20px auto; font-size:15px;">
                    All mission phases and operational anomalies have been executed. 
                    Telemetry recorded. Ground science teams at the User Segment have compiled initial findings.
                </p>
            </div>
        """, unsafe_allow_html=True)

        bcol1, bcol2, bcol3 = st.columns([1, 2, 1])
        with bcol2:
            if st.button("📊 COMMENCE FLIGHT DEBRIEF & SCORING", type="primary", use_container_width=True):
                st.session_state.screen = "debrief"
                st.rerun()

    else:
        # ACTIVE EVENT DISPLAY
        current_event = events[curr_idx]

        ev_col, vis_col = st.columns([1.6, 1])
        with ev_col:
            st.markdown(f"""
                <div class="mc-card mc-card-highlight">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-family:'Rajdhani', sans-serif; font-size:13px; color:#43D9FF; font-weight:bold; letter-spacing:1px;">
                            CURRENT PHASE: {current_event['phase'].upper()}
                        </span>
                        <span style="font-family:'Orbitron', sans-serif; font-size:11px; color:#9BAAC2;">
                            EVENT {curr_idx + 1} OF {total_events}
                        </span>
                    </div>
                    <h3 style="font-size:20px; color:#F4F7FF; margin:8px 0 12px 0;">
                        {current_event['title']}
                    </h3>
                    <p style="font-size:14px; color:#CAD5E8; line-height:1.6; margin-bottom:14px;">
                        {current_event['description']}
                    </p>
                    <div class="nasa-badge" style="font-size:12px;">
                        <strong>[NASA Flight Context]</strong> {current_event['nasa_context']}
                    </div>
                </div>
            """, unsafe_allow_html=True)

            # Last Consequence Feedback Callout
            if sim.get("last_consequence"):
                st.markdown(f"""
                    <div style="background:#0F233A; border-left:3px solid #43D9FF; padding:10px 14px; border-radius:0 6px 6px 0; margin-bottom:14px; font-size:13px; color:#F4F7FF;">
                        <strong>LATEST TELEMETRY UPDATE:</strong> {sim['last_consequence']}
                    </div>
                """, unsafe_allow_html=True)

            # Player Choices Buttons
            st.markdown("<div style='font-family:Rajdhani; font-size:14px; color:#43D9FF; font-weight:bold; margin-bottom:8px;'>SELECT FLIGHT DIRECTOR COMMAND:</div>", unsafe_allow_html=True)

            for c_idx, choice in enumerate(current_event["choices"]):
                btn_text = f"OPTION {chr(65+c_idx)}: {choice['text']}"
                if st.button(btn_text, key=f"choice_{curr_idx}_{c_idx}", use_container_width=True):
                    updated_sim, conseq = apply_event_choice(
                        st.session_state.mission_id,
                        curr_idx,
                        c_idx,
                        st.session_state.sim_state,
                        calc
                    )
                    updated_sim["event_idx"] = curr_idx + 1
                    updated_sim["last_consequence"] = conseq
                    if updated_sim["event_idx"] >= total_events:
                        updated_sim["completed"] = True
                    st.session_state.sim_state = updated_sim
                    st.rerun()

                st.markdown(f"<div style='font-size:11.5px; color:#9BAAC2; margin-top:-6px; margin-bottom:10px; margin-left:10px;'><em>{choice['explanation']}</em></div>", unsafe_allow_html=True)

        with vis_col:
            st.markdown(render_celestial_svg(mission["destination"]), unsafe_allow_html=True)
            st.markdown("<br>", unsafe_allow_html=True)
            st.markdown(render_spacecraft_schematic(calc), unsafe_allow_html=True)


# =============================================================
# SCREEN 5 — MISSION DEBRIEF & SCORING
# =============================================================
elif st.session_state.screen == "debrief":
    mission = get_mission(st.session_state.mission_id)
    calc = calculate_mission_design(st.session_state.mission_id, st.session_state.config)
    sim = st.session_state.sim_state

    # Evaluate scoring model
    score_report = evaluate_mission(st.session_state.mission_id, calc, sim)

    # Debrief Header
    st.markdown(f"""
        <div class="mission-header" style="padding: 20px 28px;">
            <div>
                <div style="font-family:'Rajdhani', sans-serif; font-size:12px; color:#43D9FF; font-weight:700; letter-spacing:1px;">
                    MISSION EVALUATION & POST-FLIGHT DEBRIEF
                </div>
                <h2 style="font-size:26px; margin:2px 0 0 0; color:#F4F7FF;">
                    {mission['name'].upper()} — FLIGHT REPORT
                </h2>
                <div style="font-size:12px; color:#9BAAC2; margin-top:2px;">
                    NASA Space Apps Challenge 2026 | Team Orbitera
                </div>
            </div>
            <div style="text-align:right;">
                <div style="font-family:'Orbitron', monospace; font-size:32px; font-weight:900; color:{score_report['outcome_color']};">
                    {score_report['total_score']} <span style="font-size:16px; color:#9BAAC2;">/ 100</span>
                </div>
                <div style="font-size:12px; font-weight:bold; color:{score_report['outcome_color']};">
                    {score_report['outcome_badge']}
                </div>
            </div>
        </div>
    """, unsafe_allow_html=True)

    # Executive Summary Card
    st.markdown(f"""
        <div class="mc-card">
            <h3 style="color:#43D9FF; font-size:15px; margin-top:0;">EXECUTIVE MISSION SUMMARY</h3>
            <p style="color:#CAD5E8; font-size:14px; line-height:1.6; margin:0;">
                {score_report['summary_text']}
            </p>
        </div>
    """, unsafe_allow_html=True)

    # Category Scores Breakdown
    st.markdown("<h3 style='color:#F4F7FF; margin:20px 0 10px 0;'>SYSTEMS ENGINEERING EVALUATION BREAKDOWN</h3>", unsafe_allow_html=True)
    cats = score_report["categories"]

    sc_col1, sc_col2 = st.columns(2)
    with sc_col1:
        for cat_key in ["scientific_achievement", "engineering_design", "resource_efficiency"]:
            cat = cats[cat_key]
            st.markdown(f"""
                <div style="background:#0B1224; border:1px solid #1E2D4A; border-radius:8px; padding:12px; margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between;">
                        <span style="font-weight:bold; color:#F4F7FF; font-size:13px;">{cat['name']}</span>
                        <span style="font-family:'Orbitron', monospace; color:#43D9FF; font-weight:bold;">{cat['score']} / {cat['max']}</span>
                    </div>
                    <div style="background:#152442; height:6px; border-radius:3px; margin-top:6px; overflow:hidden;">
                        <div style="background:#43D9FF; width:{cat['pct']}%; height:100%;"></div>
                    </div>
                </div>
            """, unsafe_allow_html=True)

    with sc_col2:
        for cat_key in ["spacecraft_health", "communication_data", "mission_operations"]:
            cat = cats[cat_key]
            st.markdown(f"""
                <div style="background:#0B1224; border:1px solid #1E2D4A; border-radius:8px; padding:12px; margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between;">
                        <span style="font-weight:bold; color:#F4F7FF; font-size:13px;">{cat['name']}</span>
                        <span style="font-family:'Orbitron', monospace; color:#43D9FF; font-weight:bold;">{cat['score']} / {cat['max']}</span>
                    </div>
                    <div style="background:#152442; height:6px; border-radius:3px; margin-top:6px; overflow:hidden;">
                        <div style="background:#3D7BFF; width:{cat['pct']}%; height:100%;"></div>
                    </div>
                </div>
            """, unsafe_allow_html=True)

    # Scientific Objectives & Telemetry History
    st.markdown("<br>", unsafe_allow_html=True)
    o_col, l_col = st.columns(2)

    with o_col:
        st.markdown("<div class='mc-card'>", unsafe_allow_html=True)
        st.markdown("<h3 style='color:#43D9FF; font-size:15px; margin-top:0;'>SCIENTIFIC OBJECTIVES STATUS</h3>", unsafe_allow_html=True)
        for obj in score_report["matched_objectives"]:
            color = "#43D9FF" if "Fully" in obj["status"] else ("#FFB547" if "Partially" in obj["status"] else "#FF5263")
            st.markdown(f"• **{obj['title']}** — <span style='color:{color}; font-weight:bold;'>{obj['status']}</span>", unsafe_allow_html=True)
        st.markdown("</div>", unsafe_allow_html=True)

    with l_col:
        st.markdown("<div class='mc-card'>", unsafe_allow_html=True)
        st.markdown("<h3 style='color:#FFB547; font-size:15px; margin-top:0;'>SYSTEMS LESSONS LEARNED</h3>", unsafe_allow_html=True)
        for lesson in score_report["lessons_learned"]:
            st.markdown(f"• <span style='font-size:13px; color:#CAD5E8;'>{lesson}</span>", unsafe_allow_html=True)
        for sug in score_report["suggestions"]:
            st.markdown(f"💡 <span style='font-size:13px; color:#43D9FF;'><strong>Recommendation:</strong> {sug}</span>", unsafe_allow_html=True)
        st.markdown("</div>", unsafe_allow_html=True)

    # In-Flight Event Log
    with st.expander("📜 In-Flight Command History & Event Log"):
        for idx, item in enumerate(sim.get("log", []), 1):
            st.markdown(f"""
                **Phase {idx}: {item.get('phase')}** — *{item.get('event_title')}*  
                - **Decision:** {item.get('choice_text')}  
                - **Consequence:** {item.get('consequence')}  
            """)

    st.markdown("<br><hr style='border-color:#1E2D4A;'>", unsafe_allow_html=True)

    # REPORT DOWNLOADS & ACTION BUTTONS
    st.markdown("### Export Mission Report & Next Operations")
    dcol1, dcol2, dcol3, dcol4 = st.columns(4)

    with dcol1:
        # Standalone HTML Report download
        html_report = generate_html_report(st.session_state.mission_id, mission, calc, sim, score_report)
        st.download_button(
            label="📥 Download HTML Report",
            data=html_report,
            file_name=f"beyond_the_orbit_{st.session_state.mission_id}_report.html",
            mime="text/html",
            use_container_width=True
        )

    with dcol2:
        # Native PDF Report download
        pdf_bytes = generate_pdf_report(st.session_state.mission_id, mission, calc, sim, score_report)
        st.download_button(
            label="📄 Download PDF Debrief",
            data=pdf_bytes,
            file_name=f"beyond_the_orbit_{st.session_state.mission_id}_report.pdf",
            mime="application/pdf",
            use_container_width=True
        )

    with dcol3:
        if st.button("🔧 Redesign Spacecraft", use_container_width=True):
            reset_simulation()
            st.session_state.screen = "planning"
            st.rerun()

    with dcol4:
        if st.button("🪐 Select New Destination", type="primary", use_container_width=True):
            reset_simulation()
            st.session_state.screen = "selection"
            st.rerun()

