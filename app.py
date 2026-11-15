"""
BEYOND THE ORBIT — Space Mission Design Game
============================================
NASA Space Apps Challenge 2026 — Faisalabad Local Event
Team: Orbitera | Tagline: YOUR NEXT FRONTIER IS UNKNOWN.

Unified Main Application:
Integrates the recovered cinematic frontend directly with the authentic
NASA SMD Four-Segment Python backend and Streamlit session state.
"""

import streamlit as st
import streamlit.components.v1 as components
import json
import base64
import urllib.parse
from typing import Dict, Any

# Core backend modules
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
from nasa_data import NASA_REFERENCES, PLANETARY_DATA

# -------------------------------------------------------------
# PAGE CONFIGURATION
# -------------------------------------------------------------
st.set_page_config(
    page_title="BEYOND THE ORBIT | Space Mission Design Game",
    page_icon="🚀",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Seamless custom styling for Streamlit container
st.markdown("""
<style>
    /* Clean, immersive display */
    #MainMenu, header, footer, .stDeployButton, div[data-testid="stDecoration"] {
        visibility: hidden !important;
        display: none !important;
        height: 0 !important;
    }
    .block-container {
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100vw !important;
    }
    iframe {
        border: none !important;
        width: 100vw !important;
        min-height: 100vh !important;
        display: block !important;
    }
    html, body {
        overflow-x: hidden;
        background-color: #080d19;
    }
</style>
""", unsafe_allow_html=True)

# -------------------------------------------------------------
# SESSION STATE INITIALIZATION
# -------------------------------------------------------------
if "mission_id" not in st.session_state:
    st.session_state.mission_id = "lunar_explorer"

if "objective" not in st.session_state:
    st.session_state.objective = "geology"

if "craft" not in st.session_state:
    st.session_state.craft = "pathfinder"

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

if "calc" not in st.session_state:
    st.session_state.calc = calculate_mission_design(st.session_state.mission_id, st.session_state.config)

if "sim_state" not in st.session_state:
    st.session_state.sim_state = {
        "event_idx": 0,
        "health_pct": 100.0,
        "power_pct": 65.0,
        "fuel_pct": 70.0,
        "supplies_pct": 60.0,
        "data_collected_mb": 0.0,
        "data_transmitted_mb": 0.0,
        "science_points": 0.0,
        "log": [],
        "completed": False,
        "last_consequence": ""
    }

if "score_report" not in st.session_state:
    st.session_state.score_report = None

if "html_report_data_uri" not in st.session_state:
    st.session_state.html_report_data_uri = ""

if "pdf_report_base64" not in st.session_state:
    st.session_state.pdf_report_base64 = ""

if "last_action_timestamp" not in st.session_state:
    st.session_state.last_action_timestamp = 0


# -------------------------------------------------------------
# BACKEND LOGIC HANDLERS
# -------------------------------------------------------------
def map_destination(dest_str: str) -> str:
    dest_map = {
        "moon": "lunar_explorer",
        "mars": "mars_discovery",
        "europa": "europa_frontier"
    }
    return dest_map.get(dest_str.lower(), "lunar_explorer")


def set_mission(mission_id: str, objective: str = "geology"):
    st.session_state.mission_id = mission_id
    st.session_state.objective = objective
    mission = get_mission(mission_id)
    st.session_state.config["architecture"] = mission["suggested_architectures"][0]["id"]

    # Authentic subsystem defaults tailored for target destination
    if mission_id == "europa_frontier":
        st.session_state.config["launch_vehicle"] = "lv_heavy"
        st.session_state.config["structure"] = "struct_vault"
        st.session_state.config["power_gen"] = "pwr_mmrtg"
        st.session_state.config["ground_segment"] = "ground_dsn_34m"
        st.session_state.config["instruments"] = ["radar", "spectrometer"]
    elif mission_id == "mars_discovery":
        st.session_state.config["launch_vehicle"] = "lv_medium"
        st.session_state.config["structure"] = "struct_aluminum"
        st.session_state.config["power_gen"] = "pwr_ultraflex"
        st.session_state.config["ground_segment"] = "ground_nsn"
        st.session_state.config["instruments"] = ["camera", "spectrometer"]
    else:
        st.session_state.config["launch_vehicle"] = "lv_medium"
        st.session_state.config["structure"] = "struct_aluminum"
        st.session_state.config["power_gen"] = "pwr_silicon"
        st.session_state.config["ground_segment"] = "ground_nsn"
        st.session_state.config["instruments"] = ["camera", "spectrometer"]

    st.session_state.calc = calculate_mission_design(mission_id, st.session_state.config)
    reset_simulation()


def update_craft_loadout(craft_type: str, fuel: float, power: float, supplies: float):
    st.session_state.craft = craft_type
    mission_id = st.session_state.mission_id

    if craft_type == "pioneer":
        st.session_state.config["launch_vehicle"] = "lv_light"
        st.session_state.config["avionics"] = "av_cots"
        st.session_state.config["thermal"] = "thm_passive"
        st.session_state.config["propulsion"] = "prop_cold_gas"
    elif craft_type == "sentinel":
        st.session_state.config["launch_vehicle"] = "lv_heavy"
        st.session_state.config["avionics"] = "av_tri_modular"
        st.session_state.config["thermal"] = "thm_active"
        st.session_state.config["propulsion"] = "prop_biprop"
    else:  # pathfinder
        st.session_state.config["launch_vehicle"] = "lv_medium"
        st.session_state.config["avionics"] = "av_rad750"
        st.session_state.config["thermal"] = "thm_active"
        st.session_state.config["propulsion"] = "prop_monoprop"

    # Scale instruments according to objective
    obj = st.session_state.objective
    if obj == "resources":
        st.session_state.config["instruments"] = ["radar", "thermal_sensor"] if mission_id == "lunar_explorer" else ["radar", "spectrometer"]
    elif obj == "environment":
        st.session_state.config["instruments"] = ["spectrometer", "particle_detector"] if mission_id != "lunar_explorer" else ["spectrometer"]
    else:
        st.session_state.config["instruments"] = ["camera", "spectrometer"]

    st.session_state.calc = calculate_mission_design(mission_id, st.session_state.config)
    st.session_state.sim_state["fuel_pct"] = fuel
    st.session_state.sim_state["power_pct"] = power
    st.session_state.sim_state["supplies_pct"] = supplies
    st.session_state.sim_state["health_pct"] = 100.0


def reset_simulation():
    st.session_state.sim_state = {
        "event_idx": 0,
        "health_pct": 100.0,
        "power_pct": 65.0,
        "fuel_pct": 70.0,
        "supplies_pct": 60.0,
        "data_collected_mb": 0.0,
        "data_transmitted_mb": 0.0,
        "science_points": 0.0,
        "log": [],
        "completed": False,
        "last_consequence": ""
    }
    st.session_state.score_report = None
    st.session_state.html_report_data_uri = ""
    st.session_state.pdf_report_base64 = ""


def finalize_mission_debrief(telemetry: Dict[str, Any], emergency: bool = False, fail_reason: str = ""):
    mission_id = st.session_state.mission_id
    mission = get_mission(mission_id)
    calc = st.session_state.calc

    # Synchronize flight telemetry values
    st.session_state.sim_state["health_pct"] = max(0.0, float(telemetry.get("hull", 100)))
    st.session_state.sim_state["power_pct"] = max(0.0, float(telemetry.get("power", 0)))
    st.session_state.sim_state["fuel_pct"] = max(0.0, float(telemetry.get("fuel", 0)))
    st.session_state.sim_state["supplies_pct"] = max(0.0, float(telemetry.get("supplies", 0)))
    st.session_state.sim_state["completed"] = (not emergency) and (st.session_state.sim_state["health_pct"] > 0)
    st.session_state.sim_state["science_points"] = max(0.0, float(telemetry.get("score", 60)))

    # Compute authentic 100-point systems engineering scoring
    score_report = evaluate_mission(mission_id, calc, st.session_state.sim_state)
    score = score_report.get("total_score", 0)
    score_report["grade"] = "A+" if score >= 90 else ("A" if score >= 80 else ("B" if score >= 70 else ("C" if score >= 60 else "D")))
    st.session_state.score_report = score_report

    # Generate downloadable HTML and PDF debrief artifacts
    try:
        html_content = generate_html_report(mission_id, mission, calc, st.session_state.sim_state, score_report)
        st.session_state.html_report_data_uri = "data:text/html;charset=utf-8," + urllib.parse.quote(html_content)
    except Exception as e:
        st.session_state.html_report_data_uri = ""

    try:
        pdf_bytes = generate_pdf_report(mission_id, mission, calc, st.session_state.sim_state, score_report)
        st.session_state.pdf_report_base64 = base64.b64encode(pdf_bytes).decode("utf-8")
    except Exception as e:
        st.session_state.pdf_report_base64 = ""


# -------------------------------------------------------------
# STREAMLIT CUSTOM COMPONENT MOUNT
# -------------------------------------------------------------
_bto_component = components.declare_component("beyond_the_orbit", path=".")

backend_state = {
    "mission_id": st.session_state.mission_id,
    "destination": st.session_state.mission_id.replace("_explorer", "").replace("_discovery", "").replace("_frontier", ""),
    "objective": st.session_state.objective,
    "craft": st.session_state.craft,
    "calc": st.session_state.calc,
    "sim_state": st.session_state.sim_state,
    "score_report": st.session_state.score_report,
    "html_report_data_uri": st.session_state.html_report_data_uri,
    "pdf_report_base64": st.session_state.pdf_report_base64
}

# Mount component and capture incoming client actions
component_response = _bto_component(
    backend_state=backend_state,
    default=None,
    key="beyond_the_orbit_game"
)

# Process incoming actions from the frontend
if component_response and isinstance(component_response, dict):
    action = component_response.get("action")
    payload = component_response.get("payload", {})
    ts = component_response.get("timestamp", 0)

    if ts > st.session_state.last_action_timestamp:
        st.session_state.last_action_timestamp = ts

        if action == "SELECT_DESTINATION":
            dest_name = payload.get("destination", "moon")
            obj_name = payload.get("objective", "geology")
            mapped_id = map_destination(dest_name)
            set_mission(mapped_id, obj_name)
            st.rerun()

        elif action == "CONFIGURE_SPACECRAFT":
            craft = payload.get("craft", "pathfinder")
            fuel = float(payload.get("fuel", 70))
            power = float(payload.get("power", 65))
            supplies = float(payload.get("supplies", 60))
            update_craft_loadout(craft, fuel, power, supplies)
            st.rerun()

        elif action == "APPLY_DECISION":
            event_idx = payload.get("event_idx", 0)
            choice_idx = payload.get("choice_idx", 0)
            telemetry = payload.get("telemetry", {})
            st.session_state.sim_state["fuel_pct"] = telemetry.get("fuel", st.session_state.sim_state["fuel_pct"])
            st.session_state.sim_state["power_pct"] = telemetry.get("power", st.session_state.sim_state["power_pct"])
            st.session_state.sim_state["supplies_pct"] = telemetry.get("supplies", st.session_state.sim_state["supplies_pct"])
            st.session_state.sim_state["health_pct"] = telemetry.get("hull", st.session_state.sim_state["health_pct"])

            # Execute authentic decision engine
            sim_updated, consequence = apply_event_choice(
                st.session_state.mission_id,
                event_idx,
                choice_idx,
                st.session_state.sim_state,
                st.session_state.calc
            )
            st.session_state.sim_state = sim_updated
            st.session_state.sim_state["last_consequence"] = consequence
            st.rerun()

        elif action == "EVALUATE_MISSION":
            telemetry = payload.get("telemetry", {})
            emergency = payload.get("emergency", False)
            fail_reason = payload.get("failReason", "")
            finalize_mission_debrief(telemetry, emergency, fail_reason)
            st.rerun()

        elif action == "RESET_MISSION":
            reset_simulation()
            st.rerun()

# -------------------------------------------------------------
# SIDEBAR INSPECTOR (Available for Judges & Technical Evaluation)
# -------------------------------------------------------------
with st.sidebar:
    st.markdown("""
        <div style="text-align:center; padding:10px 0; border-bottom:1px solid #1E2D4A;">
            <div style="font-family:'Orbitron', monospace; font-size:16px; font-weight:800; color:#43D9FF;">
                BEYOND THE ORBIT
            </div>
            <div style="font-size:11px; color:#CAD5E8; margin-top:2px;">
                NASA SPACE APPS 2026 | SYSTEMS MONITOR
            </div>
        </div>
    """, unsafe_allow_html=True)

    cur_m = get_mission(st.session_state.mission_id)
    calc = st.session_state.calc
    st.markdown(f"""
        <div style="background:#0b1224; border:1px solid #1E2D4A; border-radius:6px; padding:10px; margin-top:12px; font-size:12px;">
            <div style="color:#43D9FF; font-weight:bold;">ACTIVE TARGET: {cur_m['name'].upper()}</div>
            <div style="color:#CAD5E8;">Destination: {cur_m['destination']}</div>
            <div style="color:#FFB547;">Budget: ${cur_m['budget_million']}M</div>
            <hr style="border-color:#1E2D4A; margin:6px 0;">
            <div>Mass Margin: <strong>{calc.get('mass_margin_pct', 0)}%</strong></div>
            <div>Power Balance: <strong>{calc.get('power_balance_w', 0)} W</strong></div>
            <div>Launch Status: <strong>{calc.get('validation_status', 'READY')}</strong></div>
        </div>
    """, unsafe_allow_html=True)

    if st.button("🔄 Reset to Mission Start", use_container_width=True):
        reset_simulation()
        st.rerun()
