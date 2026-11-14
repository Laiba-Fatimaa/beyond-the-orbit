/**
 * BEYOND THE ORBIT — CLEANROOM SPACECRAFT BUILDER
 * ===============================================
 * Team Orbitera | NASA Space Apps Challenge 2026
 * 
 * Interactive CAD Spacecraft Assembly Bay Visualizer:
 * - High-detail SVG spacecraft rendered on a circular perspective turntable
 * - Concentric glowing blue floor alignment rings & spotlight reflections
 * - Subsystems dynamically update in real time:
 *   * Solar arrays (Silicon panels, UltraFlex GaAs circular wings, or MMRTG nuclear generator with radiators)
 *   * Communication antennae (X-band dish, Ka-band optical laser, or omni whip)
 *   * Propulsion thrusters (Hydrazine chemical nozzle or NEXT-C ion engine with plasma glow)
 *   * Core structure (Gold thermal MLI foil, Aluminum truss, Carbon composite, or Radiation Vault)
 *   * Scientific instruments suite mounted along payload booms
 */

class HangarBuilder {
    constructor() {
        this.activeCategory = "power";
    }

    setActiveCategory(cat) {
        this.activeCategory = cat;
    }

    renderCleanroomBlueprint(calc, destination) {
        const comps = calc.selectedComponents;
        const pwr = comps.powerGen.id;
        const struct = comps.structure.id;
        const comm = comps.comms.id;
        const prop = comps.propulsion.id;
        const insts = comps.instruments;

        const isOverload = calc.totalMassKg > calc.lvMaxPayloadKg;
        const fairingStroke = isOverload ? "#FF2A55" : "rgba(0, 212, 255, 0.4)";
        const fairingFill = isOverload ? "rgba(255, 42, 85, 0.04)" : "rgba(0, 212, 255, 0.02)";

        // Core bus material styling
        let busMainColor = "#1A253D";
        let busTrimColor = "#4A6FA5";
        let mliPatternColor = "#C8A230"; // Gold MLI Foil
        if (struct === "struct_vault") {
            busMainColor = "#1F232D";
            busTrimColor = "#FFB547";
            mliPatternColor = "#A67C1E";
        } else if (struct === "struct_carbon") {
            busMainColor = "#121722";
            busTrimColor = "#00D4FF";
            mliPatternColor = "#38BDF8";
        }

        // --- POWER GENERATION SUBSYSTEM ---
        let powerSvg = "";
        if (pwr.includes("mmrtg")) {
            // MMRTG Nuclear Generator + Cooling Radiator
            powerSvg = `
                <!-- MMRTG Nuclear RTG (Left) -->
                <g class="subsystem-node" transform="translate(100, 155)">
                    <rect x="0" y="0" width="46" height="34" rx="3" fill="#D97706" stroke="#F59E0B" stroke-width="2"/>
                    <line x1="10" y1="0" x2="10" y2="34" stroke="#78350F" stroke-width="2.5"/>
                    <line x1="22" y1="0" x2="22" y2="34" stroke="#78350F" stroke-width="2.5"/>
                    <line x1="34" y1="0" x2="34" y2="34" stroke="#78350F" stroke-width="2.5"/>
                    <line x1="46" y1="17" x2="75" y2="17" stroke="#94A3B8" stroke-width="4"/>
                    <text x="6" y="22" font-family="'Rajdhani', sans-serif" font-size="10" fill="#FFF" font-weight="bold">MMRTG</text>
                </g>
                <!-- Thermal Radiator (Right) -->
                <g class="subsystem-node" transform="translate(330, 160)">
                    <rect x="0" y="0" width="44" height="26" rx="2" fill="#334155" stroke="#94A3B8" stroke-width="2"/>
                    <line x1="-25" y1="13" x2="0" y2="13" stroke="#94A3B8" stroke-width="4"/>
                    <line x1="11" y1="0" x2="11" y2="26" stroke="#64748B" stroke-width="1.5"/>
                    <line x1="22" y1="0" x2="22" y2="26" stroke="#64748B" stroke-width="1.5"/>
                    <line x1="33" y1="0" x2="33" y2="26" stroke="#64748B" stroke-width="1.5"/>
                    <text x="5" y="17" font-family="'Rajdhani', sans-serif" font-size="9" fill="#CAD5E8" font-weight="bold">RADIATOR</text>
                </g>
            `;
        } else if (pwr === "pwr_ultraflex") {
            // UltraFlex Circular GaAs Solar Wings
            powerSvg = `
                <!-- UltraFlex Left Wing -->
                <g class="subsystem-node" transform="translate(105, 170)">
                    <circle cx="0" cy="0" r="54" fill="#0A1C3E" stroke="#00D4FF" stroke-width="2.5"/>
                    <circle cx="0" cy="0" r="36" fill="none" stroke="#38BDF8" stroke-width="1.5" stroke-dasharray="4,4"/>
                    <circle cx="0" cy="0" r="18" fill="none" stroke="#60A5FA" stroke-width="1"/>
                    <line x1="0" y1="-54" x2="0" y2="54" stroke="#38BDF8" stroke-width="1.5"/>
                    <line x1="-54" y1="0" x2="54" y2="0" stroke="#38BDF8" stroke-width="1.5"/>
                    <line x1="38" y1="-38" x2="-38" y2="38" stroke="#38BDF8" stroke-width="1.2"/>
                    <line x1="-38" y1="-38" x2="38" y2="38" stroke="#38BDF8" stroke-width="1.2"/>
                    <line x1="54" y1="0" x2="70" y2="0" stroke="#CAD5E8" stroke-width="5"/>
                    <circle cx="0" cy="0" r="6" fill="#00D4FF"/>
                </g>
                <!-- UltraFlex Right Wing -->
                <g class="subsystem-node" transform="translate(375, 170)">
                    <circle cx="0" cy="0" r="54" fill="#0A1C3E" stroke="#00D4FF" stroke-width="2.5"/>
                    <circle cx="0" cy="0" r="36" fill="none" stroke="#38BDF8" stroke-width="1.5" stroke-dasharray="4,4"/>
                    <circle cx="0" cy="0" r="18" fill="none" stroke="#60A5FA" stroke-width="1"/>
                    <line x1="0" y1="-54" x2="0" y2="54" stroke="#38BDF8" stroke-width="1.5"/>
                    <line x1="-54" y1="0" x2="54" y2="0" stroke="#38BDF8" stroke-width="1.5"/>
                    <line x1="38" y1="-38" x2="-38" y2="38" stroke="#38BDF8" stroke-width="1.2"/>
                    <line x1="-38" y1="-38" x2="38" y2="38" stroke="#38BDF8" stroke-width="1.2"/>
                    <line x1="-70" y1="0" x2="-54" y2="0" stroke="#CAD5E8" stroke-width="5"/>
                    <circle cx="0" cy="0" r="6" fill="#00D4FF"/>
                </g>
            `;
        } else {
            // Standard Multi-Junction Silicon Solar Panels
            powerSvg = `
                <!-- Left Solar Array -->
                <g class="subsystem-node" transform="translate(45, 140)">
                    <rect x="0" y="0" width="125" height="58" rx="3" fill="#081A3C" stroke="#2563EB" stroke-width="2"/>
                    <!-- Panel Grid Lines -->
                    <line x1="40" y1="0" x2="40" y2="58" stroke="#1D4ED8" stroke-width="1.5"/>
                    <line x1="82" y1="0" x2="82" y2="58" stroke="#1D4ED8" stroke-width="1.5"/>
                    <line x1="0" y1="29" x2="125" y2="29" stroke="#1D4ED8" stroke-width="1"/>
                    <line x1="125" y1="29" x2="135" y2="29" stroke="#94A3B8" stroke-width="5"/>
                    <circle cx="20" cy="14" r="2" fill="#38BDF8"/>
                    <circle cx="61" cy="14" r="2" fill="#38BDF8"/>
                    <circle cx="103" cy="14" r="2" fill="#38BDF8"/>
                </g>
                <!-- Right Solar Array -->
                <g class="subsystem-node" transform="translate(310, 140)">
                    <rect x="0" y="0" width="125" height="58" rx="3" fill="#081A3C" stroke="#2563EB" stroke-width="2"/>
                    <line x1="42" y1="0" x2="42" y2="58" stroke="#1D4ED8" stroke-width="1.5"/>
                    <line x1="84" y1="0" x2="84" y2="58" stroke="#1D4ED8" stroke-width="1.5"/>
                    <line x1="0" y1="29" x2="125" y2="29" stroke="#1D4ED8" stroke-width="1"/>
                    <line x1="-10" y1="29" x2="0" y2="29" stroke="#94A3B8" stroke-width="5"/>
                    <circle cx="21" cy="14" r="2" fill="#38BDF8"/>
                    <circle cx="63" cy="14" r="2" fill="#38BDF8"/>
                    <circle cx="105" cy="14" r="2" fill="#38BDF8"/>
                </g>
            `;
        }

        // --- COMMUNICATION ANTENNA ---
        let commSvg = "";
        if (comm === "comm_ka_optical") {
            commSvg = `
                <!-- Ka-Band High Gain Reflector + DSOC Laser -->
                <g class="subsystem-node" transform="translate(240, 105)">
                    <path d="M -38 0 Q 0 -35 38 0" stroke="#00D4FF" stroke-width="3" fill="none"/>
                    <line x1="0" y1="-24" x2="0" y2="0" stroke="#00D4FF" stroke-width="2.5"/>
                    <circle cx="0" cy="-26" r="4.5" fill="#38BDF8"/>
                    <!-- Optical Laser Pod -->
                    <rect x="18" y="-15" width="10" height="18" fill="#FF2A55" rx="2" stroke="#FFF" stroke-width="1"/>
                    <line x1="23" y1="-15" x2="23" y2="-32" stroke="#FF2A55" stroke-width="2" stroke-dasharray="2,2"/>
                    <text x="32" y="-18" font-family="'Rajdhani', sans-serif" font-size="10" fill="#FF2A55" font-weight="bold">DSOC LASER</text>
                </g>
            `;
        } else if (comm === "comm_x_band") {
            commSvg = `
                <!-- Parabolic X-Band High-Gain Dish -->
                <g class="subsystem-node" transform="translate(240, 110)">
                    <path d="M -34 0 Q 0 -30 34 0" stroke="#CBD5E1" stroke-width="3.5" fill="rgba(203, 213, 225, 0.1)"/>
                    <line x1="0" y1="-20" x2="0" y2="0" stroke="#CBD5E1" stroke-width="2.5"/>
                    <circle cx="0" cy="-22" r="4" fill="#00D4FF"/>
                    <line x1="-15" y1="0" x2="0" y2="-20" stroke="#94A3B8" stroke-width="1"/>
                    <line x1="15" y1="0" x2="0" y2="-20" stroke="#94A3B8" stroke-width="1"/>
                </g>
            `;
        } else {
            commSvg = `
                <!-- Low-Gain S-Band Omni Antenna -->
                <g class="subsystem-node" transform="translate(240, 110)">
                    <line x1="0" y1="-35" x2="0" y2="0" stroke="#94A3B8" stroke-width="3"/>
                    <circle cx="0" cy="-38" r="5" fill="#FFB800"/>
                </g>
            `;
        }

        // --- PROPULSION SUBSYSTEM ---
        let propSvg = "";
        if (prop === "prop_ion") {
            propSvg = `
                <!-- NEXT-C Ion Thruster Grid with Emerald Plasma Plume -->
                <g class="subsystem-node" transform="translate(240, 228)">
                    <polygon points="-22,0 22,0 28,24 -28,24" fill="#1E293B" stroke="#00D4FF" stroke-width="2"/>
                    <line x1="-24" y1="24" x2="24" y2="24" stroke="#00FF88" stroke-width="3"/>
                    <!-- Ion Glow Plume -->
                    <polygon points="-20,26 20,26 0,55" fill="rgba(0, 255, 136, 0.45)"/>
                    <polygon points="-10,26 10,26 0,42" fill="rgba(255, 255, 255, 0.7)"/>
                    <text x="-26" y="40" font-family="'Rajdhani', sans-serif" font-size="10" fill="#00FF88" font-weight="bold">ION ENGINE</text>
                </g>
            `;
        } else {
            propSvg = `
                <!-- Chemical Monopropellant Hydrazine Thruster -->
                <g class="subsystem-node" transform="translate(240, 228)">
                    <polygon points="-20,0 20,0 25,22 -25,22" fill="#334155" stroke="#94A3B8" stroke-width="2"/>
                    <!-- Chemical Heat Shield -->
                    <rect x="-14" y="0" width="28" height="6" fill="#64748B"/>
                    <polygon points="-16,24 16,24 0,46" fill="rgba(255, 140, 40, 0.35)"/>
                </g>
            `;
        }

        // --- SCIENTIFIC INSTRUMENT BADGES ---
        const instBadgeSvg = insts.map((inst, idx) => {
            const yOffset = 135 + idx * 16;
            return `
                <g transform="translate(186, ${yOffset})">
                    <circle cx="0" cy="0" r="3.5" fill="#00FF88"/>
                    <text x="8" y="3.5" font-family="'Rajdhani', sans-serif" font-size="11" fill="#CAD5E8" font-weight="600">
                        ${inst.name.slice(0, 15)}
                    </text>
                </g>
            `;
        }).join("");

        return `
        <svg viewBox="0 0 480 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <!-- Radial Turntable Glow -->
                <radialGradient id="turntableGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="rgba(0, 212, 255, 0.25)"/>
                    <stop offset="60%" stop-color="rgba(30, 107, 255, 0.08)"/>
                    <stop offset="100%" stop-color="rgba(4, 8, 20, 0)"/>
                </radialGradient>
                <!-- Gold MLI Foil Texture -->
                <pattern id="goldFoil" width="6" height="6" patternUnits="userSpaceOnUse">
                    <rect width="6" height="6" fill="${mliPatternColor}"/>
                    <rect x="0" y="0" width="3" height="3" fill="#D4AF37"/>
                    <rect x="3" y="3" width="3" height="3" fill="#B38B20"/>
                </pattern>
                <!-- Cleanroom Grid Floor -->
                <pattern id="cleanroomGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(26, 42, 74, 0.45)" stroke-width="0.8"/>
                </pattern>
            </defs>

            <!-- Grid Floor in Perspective -->
            <rect width="100%" height="100%" fill="url(#cleanroomGrid)"/>

            <!-- Industrial Turntable Circular Floor Pedestal (Perspective Ellipses) -->
            <ellipse cx="240" cy="275" rx="205" ry="46" fill="url(#turntableGlow)"/>
            <ellipse cx="240" cy="275" rx="195" ry="42" fill="none" stroke="rgba(139, 199, 213, 0.4)" stroke-width="1.5" stroke-dasharray="6,4"/>
            <ellipse cx="240" cy="275" rx="150" ry="32" fill="none" stroke="rgba(139, 199, 213, 0.6)" stroke-width="1.8"/>
            <ellipse cx="240" cy="275" rx="100" ry="22" fill="none" stroke="rgba(139, 199, 213, 0.85)" stroke-width="2"/>
            <line x1="240" y1="255" x2="240" y2="295" stroke="rgba(139, 199, 213, 0.5)" stroke-width="1.5"/>
            <line x1="140" y1="275" x2="340" y2="275" stroke="rgba(139, 199, 213, 0.5)" stroke-width="1.5"/>

            <!-- Acoustic Fairing Envelope Limit Lines -->
            <path d="M 240 28 Q 320 45 320 120 L 320 280 L 160 280 L 160 120 Q 160 45 240 28 Z" 
                  fill="${fairingFill}" stroke="${fairingStroke}" stroke-width="1.5" stroke-dasharray="7,5"/>
            <text x="175" y="42" font-family="'Orbitron', sans-serif" font-size="8.5" fill="${fairingStroke}" letter-spacing="1">
                FAIRING ENVELOPE [${calc.lvMaxPayloadKg} KG LIMIT]
            </text>

            <!-- Centerline Coordinate Beam -->
            <line x1="240" y1="25" x2="240" y2="280" stroke="rgba(139, 199, 213, 0.2)" stroke-width="1" stroke-dasharray="4,4"/>

            <!-- Central Photographic Spacecraft on Turntable -->
            <g class="real-spacecraft-focus" transform="translate(240, 175)">
                <!-- Ambient pedestal shadow -->
                <ellipse cx="0" cy="72" rx="90" ry="18" fill="rgba(0,0,0,0.65)" filter="blur(6px)"/>
                <!-- Real high-detail NASA spacecraft reference (NASA 0701891) -->
                <image href="assets/spacecraft_cleanroom_nasa.png" x="-145" y="-105" width="290" height="185" preserveAspectRatio="xMidYMid meet" style="filter: drop-shadow(0 12px 28px rgba(0,0,0,0.85)); border-radius: 6px;"/>
            </g>

            <!-- Active Hardware Telemetry Callout Pins Over Real Spacecraft -->
            <!-- 1. Power Array Pin (Upper Left) -->
            <g class="hud-callout-pin" transform="translate(68, 92)">
                <line x1="0" y1="0" x2="75" y2="45" stroke="var(--accent-cyan)" stroke-width="1.2" stroke-dasharray="3,3"/>
                <circle cx="75" cy="45" r="3.5" fill="var(--accent-cyan)"/>
                <rect x="-6" y="-14" width="135" height="20" rx="3" fill="rgba(9, 15, 25, 0.9)" stroke="var(--accent-cyan)" stroke-width="1"/>
                <text x="4" y="0" font-family="'Rajdhani', sans-serif" font-size="10" font-weight="700" fill="#FFF">⚡ ${comps.powerGen.name.toUpperCase()}</text>
            </g>

            <!-- 2. High-Gain Antenna Pin (Upper Right) -->
            <g class="hud-callout-pin" transform="translate(325, 80)">
                <line x1="0" y1="0" x2="-45" y2="40" stroke="var(--accent-cyan)" stroke-width="1.2" stroke-dasharray="3,3"/>
                <circle cx="-45" cy="40" r="3.5" fill="var(--accent-cyan)"/>
                <rect x="-6" y="-14" width="130" height="20" rx="3" fill="rgba(9, 15, 25, 0.9)" stroke="var(--accent-cyan)" stroke-width="1"/>
                <text x="4" y="0" font-family="'Rajdhani', sans-serif" font-size="10" font-weight="700" fill="#FFF">📡 ${comps.comms.name.toUpperCase()}</text>
            </g>

            <!-- 3. Propulsion Core Pin (Lower Center) -->
            <g class="hud-callout-pin" transform="translate(240, 260)">
                <line x1="0" y1="0" x2="0" y2="-30" stroke="var(--accent-amber)" stroke-width="1.2" stroke-dasharray="3,3"/>
                <circle cx="0" cy="-30" r="3.5" fill="var(--accent-amber)"/>
                <rect x="-75" y="4" width="150" height="20" rx="3" fill="rgba(9, 15, 25, 0.9)" stroke="var(--accent-amber)" stroke-width="1"/>
                <text x="-65" y="18" font-family="'Rajdhani', sans-serif" font-size="10" font-weight="700" fill="#FFF">🚀 ${comps.propulsion.name.toUpperCase()}</text>
            </g>

            <!-- 4. Thermal & Structural Shield Pin (Lower Left) -->
            <g class="hud-callout-pin" transform="translate(50, 205)">
                <line x1="75" y1="0" x2="130" y2="-15" stroke="var(--accent-cyan)" stroke-width="1.2" stroke-dasharray="3,3"/>
                <circle cx="130" cy="-15" r="3.5" fill="var(--accent-cyan)"/>
                <rect x="-6" y="-12" width="135" height="20" rx="3" fill="rgba(9, 15, 25, 0.9)" stroke="var(--accent-cyan)" stroke-width="1"/>
                <text x="4" y="2" font-family="'Rajdhani', sans-serif" font-size="10" font-weight="700" fill="#FFF">🛡 ${comps.structure.name.toUpperCase()}</text>
            </g>

            <!-- 5. Science Payload Pod Pin (Lower Right) -->
            <g class="hud-callout-pin" transform="translate(330, 205)">
                <line x1="0" y1="0" x2="-45" y2="-15" stroke="var(--accent-green)" stroke-width="1.2" stroke-dasharray="3,3"/>
                <circle cx="-45" cy="-15" r="3.5" fill="var(--accent-green)"/>
                <rect x="-6" y="-12" width="140" height="20" rx="3" fill="rgba(9, 15, 25, 0.9)" stroke="var(--accent-green)" stroke-width="1"/>
                <text x="4" y="2" font-family="'Rajdhani', sans-serif" font-size="10" font-weight="700" fill="#FFF">🔬 ${insts.length} SENSOR SUITES</text>
            </g>

            <!-- Metadata Overlay Pill -->
            <g transform="translate(18, 22)">
                <rect x="0" y="0" width="165" height="24" rx="4" fill="rgba(7, 14, 30, 0.85)" stroke="var(--border-subtle)"/>
                <circle cx="12" cy="12" r="3.5" fill="#00D4FF"/>
                <text x="22" y="15.5" font-family="'Orbitron', sans-serif" font-size="9" fill="#00D4FF" font-weight="bold" letter-spacing="1">
                    CAD TURNTABLE BAY
                </text>
            </g>

            <g transform="translate(320, 22)">
                <rect x="0" y="0" width="142" height="24" rx="4" fill="rgba(7, 14, 30, 0.85)" stroke="${isOverload ? '#FF2A55' : 'var(--accent-green)'}"/>
                <circle cx="12" cy="12" r="3.5" fill="${isOverload ? '#FF2A55' : 'var(--accent-green)'}"/>
                <text x="22" y="15.5" font-family="'Rajdhani', sans-serif" font-size="11" fill="${isOverload ? '#FF2A55' : 'var(--accent-green)'}" font-weight="bold">
                    ${isOverload ? '⚠ OVER MASS LIMIT' : '✔ MASS ENVELOPE OK'}
                </text>
            </g>
        </svg>
        `;
    }
}

window.HangarBuilder = HangarBuilder;
