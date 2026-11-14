"""
UI COMPONENTS & SVG VISUALIZATIONS MODULE
=========================================
BEYOND THE ORBIT - Space Mission Design Game
Provides rich SVG illustrations, orbital graphics, telemetry cards,
and visual status widgets.
"""

from typing import Dict, Any, List

def render_celestial_svg(destination: str) -> str:
    """Generates a futuristic SVG visualization of the target celestial body & orbit."""
    if destination == "Moon":
        body_color = "#C5CBD3"
        crater_color = "#9AA3B0"
        orbit_glow = "#43D9FF"
        svg = f"""
        <svg viewBox="0 0 400 240" width="100%" height="220" xmlns="http://www.w3.org/2000/svg" style="background:#080E1E; border-radius:10px; border:1px solid #1E2D4A;">
            <defs>
                <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="60%" stop-color="{body_color}"/>
                    <stop offset="95%" stop-color="{crater_color}"/>
                    <stop offset="100%" stop-color="#4B5568"/>
                </radialGradient>
                <filter id="glowEffect">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
            </defs>
            <!-- Deep space star dots -->
            <circle cx="45" cy="35" r="1.2" fill="#FFFFFF" opacity="0.8"/>
            <circle cx="95" cy="180" r="1.5" fill="#43D9FF" opacity="0.6"/>
            <circle cx="340" cy="45" r="1" fill="#FFFFFF" opacity="0.7"/>
            <circle cx="320" cy="190" r="1.8" fill="#FFFFFF" opacity="0.8"/>
            <circle cx="28" cy="110" r="1.4" fill="#FFFFFF" opacity="0.5"/>

            <!-- Orbit Ellipse -->
            <ellipse cx="200" cy="120" rx="150" ry="50" fill="none" stroke="{orbit_glow}" stroke-width="2" stroke-dasharray="6,4" opacity="0.75"/>

            <!-- Celestial Body: Moon -->
            <circle cx="200" cy="120" r="55" fill="url(#moonGlow)"/>
            <circle cx="180" cy="100" r="10" fill="{crater_color}" opacity="0.6"/>
            <circle cx="220" cy="135" r="14" fill="{crater_color}" opacity="0.5"/>
            <circle cx="195" cy="145" r="8" fill="{crater_color}" opacity="0.6"/>
            <circle cx="215" cy="95" r="7" fill="{crater_color}" opacity="0.5"/>

            <!-- Polar shadow trap indicator -->
            <path d="M 175 68 Q 200 75 225 68 Z" fill="#1A202C" opacity="0.7"/>

            <!-- Satellite in orbit -->
            <g transform="translate(320, 100)" filter="url(#glowEffect)">
                <rect x="-10" y="-5" width="20" height="10" fill="#43D9FF" rx="2"/>
                <line x1="-22" y1="0" x2="-10" y2="0" stroke="#FFB547" stroke-width="3"/>
                <line x1="10" y1="0" x2="22" y2="0" stroke="#FFB547" stroke-width="3"/>
                <circle cx="0" cy="0" r="2.5" fill="#FFFFFF"/>
            </g>

            <text x="20" y="30" font-family="'Orbitron', sans-serif" font-size="12" fill="#43D9FF" letter-spacing="1">TARGET: THE MOON (1.0 AU)</text>
            <text x="20" y="48" font-family="'Rajdhani', sans-serif" font-size="11" fill="#9BAAC2">SOLAR IRRADIANCE: 1361 W/m² | NO ATMOSPHERE</text>
        </svg>
        """
    elif destination == "Mars":
        body_color = "#E05A36"
        crater_color = "#A8381A"
        orbit_glow = "#FFB547"
        svg = f"""
        <svg viewBox="0 0 400 240" width="100%" height="220" xmlns="http://www.w3.org/2000/svg" style="background:#080E1E; border-radius:10px; border:1px solid #1E2D4A;">
            <defs>
                <radialGradient id="marsGlow" cx="45%" cy="45%" r="55%">
                    <stop offset="50%" stop-color="{body_color}"/>
                    <stop offset="90%" stop-color="{crater_color}"/>
                    <stop offset="100%" stop-color="#5C1B0A"/>
                </radialGradient>
                <filter id="glowEffect">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
            </defs>
            <circle cx="45" cy="35" r="1.2" fill="#FFFFFF" opacity="0.8"/>
            <circle cx="340" cy="45" r="1" fill="#FFFFFF" opacity="0.7"/>
            <circle cx="320" cy="190" r="1.8" fill="#FFFFFF" opacity="0.8"/>

            <!-- Elliptical Areocentric Orbit -->
            <ellipse cx="200" cy="120" rx="160" ry="55" fill="none" stroke="{orbit_glow}" stroke-width="2" stroke-dasharray="6,4" opacity="0.75" transform="rotate(-8 200 120)"/>

            <!-- Celestial Body: Mars -->
            <circle cx="200" cy="120" r="58" fill="url(#marsGlow)"/>
            <!-- Polar Ice Cap -->
            <ellipse cx="200" cy="65" rx="18" ry="6" fill="#F8FAFC" opacity="0.9"/>
            <!-- Valles Marineris canyon feature -->
            <path d="M 160 120 Q 200 130 240 118" stroke="#5C1B0A" stroke-width="4" fill="none" opacity="0.7"/>
            <ellipse cx="175" cy="105" rx="12" ry="8" fill="#8C2C12" opacity="0.6"/>

            <!-- Satellite -->
            <g transform="translate(70, 95)" filter="url(#glowEffect)">
                <rect x="-10" y="-5" width="20" height="10" fill="#FFB547" rx="2"/>
                <line x1="-24" y1="0" x2="-10" y2="0" stroke="#43D9FF" stroke-width="3"/>
                <line x1="10" y1="0" x2="24" y2="0" stroke="#43D9FF" stroke-width="3"/>
                <circle cx="0" cy="0" r="2.5" fill="#FFFFFF"/>
            </g>

            <text x="20" y="30" font-family="'Orbitron', sans-serif" font-size="12" fill="#FFB547" letter-spacing="1">TARGET: MARS (1.52 AU)</text>
            <text x="20" y="48" font-family="'Rajdhani', sans-serif" font-size="11" fill="#9BAAC2">SOLAR IRRADIANCE: 589 W/m² | CO2 ATMOSPHERE | DUST STORMS</text>
        </svg>
        """
    else: # Europa / Jupiter
        body_color = "#E2E8F0"
        bands_color = "#C8B598"
        orbit_glow = "#43D9FF"
        svg = f"""
        <svg viewBox="0 0 400 240" width="100%" height="220" xmlns="http://www.w3.org/2000/svg" style="background:#080E1E; border-radius:10px; border:1px solid #1E2D4A;">
            <defs>
                <radialGradient id="europaGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="60%" stop-color="#E2E8F0"/>
                    <stop offset="90%" stop-color="#94A3B8"/>
                    <stop offset="100%" stop-color="#334155"/>
                </radialGradient>
                <radialGradient id="jupiterGiant" cx="40%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#D97706"/>
                    <stop offset="40%" stop-color="#B45309"/>
                    <stop offset="100%" stop-color="#78350F"/>
                </radialGradient>
            </defs>
            <!-- Jupiter in background -->
            <circle cx="60" cy="120" r="110" fill="url(#jupiterGiant)" opacity="0.45"/>
            <!-- Jovian bands -->
            <path d="M 0 80 Q 70 85 140 80" stroke="#78350F" stroke-width="6" fill="none" opacity="0.5"/>
            <path d="M 0 110 Q 70 115 150 110" stroke="#FEF3C7" stroke-width="5" fill="none" opacity="0.4"/>
            <path d="M 0 140 Q 70 145 145 140" stroke="#92400E" stroke-width="7" fill="none" opacity="0.5"/>

            <!-- Radiation belt lines -->
            <ellipse cx="60" cy="120" rx="190" ry="90" fill="none" stroke="#FF5263" stroke-width="1.5" stroke-dasharray="4,6" opacity="0.6"/>

            <!-- Europa -->
            <circle cx="270" cy="120" r="46" fill="url(#europaGlow)"/>
            <!-- Chaos cracks (lineae) -->
            <path d="M 240 100 Q 270 120 295 105" stroke="#9A3412" stroke-width="1.5" fill="none" opacity="0.7"/>
            <path d="M 250 135 Q 275 125 305 140" stroke="#9A3412" stroke-width="1.5" fill="none" opacity="0.7"/>
            <path d="M 265 85 Q 270 120 280 155" stroke="#9A3412" stroke-width="1.2" fill="none" opacity="0.6"/>

            <!-- Cryovolcanic plume vapor -->
            <path d="M 270 74 C 265 50, 275 50, 270 40" stroke="#38BDF8" stroke-width="3" fill="none" opacity="0.85" stroke-linecap="round"/>
            <circle cx="270" cy="40" r="4" fill="#38BDF8" opacity="0.9"/>

            <!-- Flyby Spacecraft -->
            <g transform="translate(330, 75)">
                <rect x="-8" y="-4" width="16" height="8" fill="#43D9FF" rx="1.5"/>
                <line x1="-18" y1="0" x2="-8" y2="0" stroke="#38BDF8" stroke-width="2.5"/>
                <line x1="8" y1="0" x2="18" y2="0" stroke="#38BDF8" stroke-width="2.5"/>
            </g>

            <text x="180" y="25" font-family="'Orbitron', sans-serif" font-size="12" fill="#43D9FF" letter-spacing="1">TARGET: EUROPA (5.2 AU)</text>
            <text x="180" y="42" font-family="'Rajdhani', sans-serif" font-size="11" fill="#FF5263">EXTREME RADIATION | CRYOPLUMES | 50 W/m²</text>
        </svg>
        """
    return svg


def render_spacecraft_schematic(design_calc: Dict[str, Any]) -> str:
    """Generates an interactive SVG schematic of the user's designed spacecraft."""
    comps = design_calc["selected_components"]
    pwr = comps["power_gen"]["id"]
    struct = comps["structure"]["id"]
    comm = comps["comms"]["id"]
    prop = comps["propulsion"]["id"]
    num_insts = len(comps["instruments"])

    # Determine visual colors based on hardware
    bus_stroke = "#FF5263" if struct == "struct_vault" else ("#43D9FF" if struct == "struct_carbon" else "#CAD5E8")
    bus_fill = "#152442" if struct == "struct_vault" else "#101B30"

    # Power visual
    if pwr == "pwr_mmrtg":
        power_left = """
        <!-- MMRTG Nuclear Generator Left -->
        <rect x="70" y="95" width="35" height="30" fill="#D97706" rx="2" stroke="#F59E0B" stroke-width="1.5"/>
        <line x1="75" y1="95" x2="75" y2="125" stroke="#78350F" stroke-width="2"/>
        <line x1="85" y1="95" x2="85" y2="125" stroke="#78350F" stroke-width="2"/>
        <line x1="95" y1="95" x2="95" y2="125" stroke="#78350F" stroke-width="2"/>
        <text x="73" y="114" font-family="'Rajdhani', sans-serif" font-size="9" fill="#FEF3C7" font-weight="bold">MMRTG</text>
        """
        power_right = """
        <!-- Auxiliary Radiator Right -->
        <rect x="255" y="100" width="30" height="20" fill="#334155" rx="2" stroke="#94A3B8" stroke-width="1"/>
        <line x1="262" y1="100" x2="262" y2="120" stroke="#1E293B" stroke-width="1.5"/>
        <line x1="272" y1="100" x2="272" y2="120" stroke="#1E293B" stroke-width="1.5"/>
        """
    elif pwr == "pwr_ultraflex":
        power_left = """
        <!-- UltraFlex Circular Array Left -->
        <circle cx="75" cy="110" r="38" fill="#1E3A8A" stroke="#38BDF8" stroke-width="1.5"/>
        <circle cx="75" cy="110" r="24" fill="none" stroke="#60A5FA" stroke-width="1" stroke-dasharray="3,3"/>
        <circle cx="75" cy="110" r="10" fill="#0F172A" stroke="#93C5FD" stroke-width="1"/>
        <line x1="75" y1="72" x2="75" y2="148" stroke="#38BDF8" stroke-width="1"/>
        <line x1="37" y1="110" x2="113" y2="110" stroke="#38BDF8" stroke-width="1"/>
        <line x1="113" y1="110" x2="135" y2="110" stroke="#CAD5E8" stroke-width="3"/>
        """
        power_right = """
        <!-- UltraFlex Circular Array Right -->
        <circle cx="285" cy="110" r="38" fill="#1E3A8A" stroke="#38BDF8" stroke-width="1.5"/>
        <circle cx="285" cy="110" r="24" fill="none" stroke="#60A5FA" stroke-width="1" stroke-dasharray="3,3"/>
        <circle cx="285" cy="110" r="10" fill="#0F172A" stroke="#93C5FD" stroke-width="1"/>
        <line x1="285" y1="72" x2="285" y2="148" stroke="#38BDF8" stroke-width="1"/>
        <line x1="247" y1="110" x2="323" y2="110" stroke="#38BDF8" stroke-width="1"/>
        <line x1="225" y1="110" x2="247" y2="110" stroke="#CAD5E8" stroke-width="3"/>
        """
    else: # Standard Silicon
        power_left = """
        <!-- Silicon Solar Panel Left -->
        <rect x="40" y="88" width="85" height="44" fill="#0C2556" stroke="#2563EB" stroke-width="1.5" rx="1"/>
        <line x1="68" y1="88" x2="68" y2="132" stroke="#1D4ED8" stroke-width="1"/>
        <line x1="96" y1="88" x2="96" y2="132" stroke="#1D4ED8" stroke-width="1"/>
        <line x1="40" y1="110" x2="125" y2="110" stroke="#1D4ED8" stroke-width="1"/>
        <line x1="125" y1="110" x2="135" y2="110" stroke="#94A3B8" stroke-width="3"/>
        """
        power_right = """
        <!-- Silicon Solar Panel Right -->
        <rect x="235" y="88" width="85" height="44" fill="#0C2556" stroke="#2563EB" stroke-width="1.5" rx="1"/>
        <line x1="263" y1="88" x2="263" y2="132" stroke="#1D4ED8" stroke-width="1"/>
        <line x1="291" y1="88" x2="291" y2="132" stroke="#1D4ED8" stroke-width="1"/>
        <line x1="235" y1="110" x2="320" y2="110" stroke="#1D4ED8" stroke-width="1"/>
        <line x1="225" y1="110" x2="235" y2="110" stroke="#94A3B8" stroke-width="3"/>
        """

    # Antenna Visual
    if comm == "comm_ka_optical":
        dish_svg = """
        <!-- Ka-band Dish & Optical Telescope -->
        <path d="M 155 70 Q 180 48 205 70" stroke="#43D9FF" stroke-width="2.5" fill="none"/>
        <line x1="180" y1="56" x2="180" y2="70" stroke="#43D9FF" stroke-width="2"/>
        <circle cx="180" cy="54" r="3" fill="#38BDF8"/>
        <!-- Optical Laser Tube -->
        <rect x="187" y="58" width="6" height="12" fill="#FF5263" rx="1"/>
        """
    elif comm == "comm_x_band":
        dish_svg = """
        <!-- High-Gain X-band Parabolic Dish -->
        <path d="M 158 72 Q 180 52 202 72" stroke="#CBD5E1" stroke-width="2.5" fill="none"/>
        <line x1="180" y1="60" x2="180" y2="72" stroke="#CBD5E1" stroke-width="2"/>
        <circle cx="180" cy="58" r="2.5" fill="#43D9FF"/>
        """
    else: # S-band Low Gain
        dish_svg = """
        <!-- S-band Omni Whip Antenna -->
        <line x1="180" y1="50" x2="180" y2="72" stroke="#94A3B8" stroke-width="2"/>
        <circle cx="180" cy="48" r="3" fill="#FFB547"/>
        """

    # Propulsion Nozzle
    prop_svg = """
    <!-- Propulsion Engine / RCS -->
    <polygon points="168,148 192,148 196,162 164,162" fill="#334155" stroke="#64748B" stroke-width="1"/>
    """

    svg = f"""
    <svg viewBox="0 0 360 200" width="100%" height="190" xmlns="http://www.w3.org/2000/svg" style="background:#080E1E; border-radius:10px; border:1px solid #1E2D4A;">
        <!-- Telemetry Grids -->
        <line x1="20" y1="185" x2="340" y2="185" stroke="#1A2844" stroke-width="1"/>
        <line x1="180" y1="20" x2="180" y2="180" stroke="#1A2844" stroke-width="1" stroke-dasharray="3,3"/>

        {power_left}
        {power_right}

        <!-- Spacecraft Central Bus -->
        <rect x="135" y="72" width="90" height="76" fill="{bus_fill}" stroke="{bus_stroke}" stroke-width="2" rx="4"/>

        <!-- Avionics & Core Vault internal representation -->
        <rect x="145" y="84" width="70" height="38" fill="#0B1224" stroke="#1E2D4A" stroke-width="1" rx="2"/>
        <text x="154" y="98" font-family="'Orbitron', sans-serif" font-size="9" fill="#43D9FF">BUS: {comps['structure']['name'][:12]}</text>
        <text x="154" y="112" font-family="'Rajdhani', sans-serif" font-size="9" fill="#9BAAC2">INST: {num_insts} ACTIVE</text>

        {dish_svg}
        {prop_svg}

        <!-- Status footer -->
        <text x="20" y="25" font-family="'Orbitron', sans-serif" font-size="11" fill="#43D9FF">SPACECRAFT CONFIGURATION</text>
        <text x="20" y="195" font-family="'Rajdhani', sans-serif" font-size="10" fill="#9BAAC2">TOTAL MASS: {design_calc['total_mass_kg']} KG | POWER: {design_calc['power_generation_w']} W</text>
    </svg>
    """
    return svg

