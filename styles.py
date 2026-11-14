"""
STYLES MODULE — FUTURISTIC SPACE MISSION CONTROL THEME
======================================================
BEYOND THE ORBIT - Space Mission Design Game
Color Palette:
- Background: #060B18
- Secondary background: #0B1224
- Panels: #101B30
- Cyan accent: #43D9FF
- Blue accent: #3D7BFF
- Amber: #FFB547
- Red: #FF5263
- Main text: #F4F7FF
- Secondary text: #9BAAC2
"""

MAIN_CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');

/* Main app background */
.stApp {
    background-color: #060B18 !important;
    color: #F4F7FF !important;
    font-family: 'Inter', -apple-system, sans-serif !important;
}

/* Hide Streamlit top header line and footer */
header[data-testid="stHeader"] {
    background: transparent !important;
}
footer {
    visibility: hidden;
}

/* Custom animated star background */
.space-stars {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 0;
    background: radial-gradient(ellipse at bottom, #0B1224 0%, #060B18 100%);
    opacity: 0.6;
}

/* Heading font styling */
h1, h2, h3, .orbitron-font {
    font-family: 'Orbitron', sans-serif !important;
    letter-spacing: 1.5px;
}

.rajdhani-font {
    font-family: 'Rajdhani', sans-serif !important;
    letter-spacing: 0.8px;
}

/* Mission Control Card Panels */
.mc-card {
    background: #101B30;
    border: 1px solid #1E2D4A;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 18px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
    transition: transform 0.2s ease, border-color 0.2s ease;
}

.mc-card:hover {
    border-color: #43D9FF;
    box-shadow: 0 10px 30px rgba(67, 217, 255, 0.12);
}

.mc-card-highlight {
    background: linear-gradient(145deg, #101B30 0%, #152442 100%);
    border: 1px solid #43D9FF;
    box-shadow: 0 0 20px rgba(67, 217, 255, 0.2);
}

/* Telemetry stat display */
.telemetry-box {
    background: #0B1224;
    border: 1px solid #1A2844;
    border-radius: 8px;
    padding: 12px 16px;
    text-align: center;
}

.telemetry-val {
    font-family: 'Orbitron', monospace;
    font-size: 24px;
    font-weight: 700;
    color: #43D9FF;
}

.telemetry-label {
    font-family: 'Rajdhani', sans-serif;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #9BAAC2;
    margin-top: 4px;
}

/* Status Badges */
.badge-ready {
    background: rgba(67, 217, 255, 0.15);
    border: 1px solid #43D9FF;
    color: #43D9FF;
    padding: 6px 14px;
    border-radius: 6px;
    font-family: 'Orbitron', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 1px;
    display: inline-block;
}

.badge-attention {
    background: rgba(255, 181, 71, 0.15);
    border: 1px solid #FFB547;
    color: #FFB547;
    padding: 6px 14px;
    border-radius: 6px;
    font-family: 'Orbitron', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 1px;
    display: inline-block;
}

.badge-blocked {
    background: rgba(255, 82, 99, 0.15);
    border: 1px solid #FF5263;
    color: #FF5263;
    padding: 6px 14px;
    border-radius: 6px;
    font-family: 'Orbitron', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 1px;
    display: inline-block;
}

/* NASA Badge Callout */
.nasa-badge {
    background: linear-gradient(90deg, rgba(61, 123, 255, 0.25) 0%, rgba(67, 217, 255, 0.15) 100%);
    border-left: 3px solid #3D7BFF;
    border-radius: 0 6px 6px 0;
    padding: 10px 14px;
    font-size: 12.5px;
    color: #CAD5E8;
    margin: 8px 0;
}

/* Streamlit Native Button Overrides */
.stButton > button {
    background: linear-gradient(135deg, #101B30 0%, #152442 100%) !important;
    color: #F4F7FF !important;
    border: 1px solid #43D9FF !important;
    border-radius: 6px !important;
    font-family: 'Orbitron', sans-serif !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    letter-spacing: 1px !important;
    padding: 10px 22px !important;
    transition: all 0.25s ease !important;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4) !important;
}

.stButton > button:hover {
    background: linear-gradient(135deg, #3D7BFF 0%, #43D9FF 100%) !important;
    color: #060B18 !important;
    border-color: #F4F7FF !important;
    box-shadow: 0 0 20px rgba(67, 217, 255, 0.4) !important;
    transform: translateY(-2px) !important;
}

/* Primary Launch Action Button */
.stButton > button[kind="primary"] {
    background: linear-gradient(135deg, #3D7BFF 0%, #43D9FF 100%) !important;
    color: #060B18 !important;
    border: 1px solid #F4F7FF !important;
    box-shadow: 0 0 24px rgba(67, 217, 255, 0.5) !important;
}

.stButton > button[kind="primary"]:hover {
    background: linear-gradient(135deg, #43D9FF 0%, #5FF5FF 100%) !important;
    box-shadow: 0 0 32px rgba(67, 217, 255, 0.8) !important;
}

/* Streamlit Tabs Customization */
.stTabs [data-baseweb="tab-list"] {
    gap: 8px;
    background-color: #0B1224;
    padding: 6px;
    border-radius: 8px;
    border: 1px solid #1E2D4A;
}

.stTabs [data-baseweb="tab"] {
    font-family: 'Rajdhani', sans-serif !important;
    font-size: 15px !important;
    font-weight: 700 !important;
    letter-spacing: 0.8px !important;
    color: #9BAAC2 !important;
    background-color: transparent !important;
    border-radius: 6px !important;
    padding: 8px 18px !important;
}

.stTabs [aria-selected="true"] {
    color: #060B18 !important;
    background: #43D9FF !important;
}

/* Metric component override */
[data-testid="stMetricValue"] {
    font-family: 'Orbitron', sans-serif !important;
    color: #43D9FF !important;
    font-size: 24px !important;
}
[data-testid="stMetricLabel"] {
    color: #9BAAC2 !important;
    font-family: 'Rajdhani', sans-serif !important;
    font-size: 13px !important;
    text-transform: uppercase;
}

/* Radio and selectbox tweaks */
.stSelectbox label, .stRadio label, .stMultiSelect label {
    font-family: 'Rajdhani', sans-serif !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    color: #CAD5E8 !important;
    letter-spacing: 0.5px;
}

/* Streamlit Expander styling */
.streamlit-expanderHeader {
    background-color: #101B30 !important;
    color: #43D9FF !important;
    font-family: 'Rajdhani', sans-serif !important;
    font-weight: 700 !important;
    border: 1px solid #1E2D4A !important;
    border-radius: 6px !important;
}

/* Cinematic banner header */
.mission-header {
    background: linear-gradient(180deg, rgba(16, 27, 48, 0.9) 0%, rgba(11, 18, 36, 0.95) 100%);
    border: 1px solid #1E2D4A;
    border-radius: 12px;
    padding: 24px 30px;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}
</style>
"""

