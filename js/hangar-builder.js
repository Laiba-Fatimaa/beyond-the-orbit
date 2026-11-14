/**
 * BEYOND THE ORBIT — CLEANROOM SPACECRAFT BUILDER
 * ===============================================
 * Team Orbitera | NASA Space Apps Challenge 2026
 * 
 * Interactive CAD Assembly & Payload Integration Visualizer:
 * - Dynamic SVG spacecraft blueprint with interactive module sockets
 * - Launch vehicle acoustic fairing envelope with boundary margin lines
 * - Live engineering annotations (mass distribution, power trace lines, link margins)
 */

class HangarBuilder {
    constructor() {
        this.selectedSocket = "space";
    }

    renderCleanroomBlueprint(calc, destination) {
        const comps = calc.selectedComponents;
        const pwr = comps.powerGen.id;
        const struct = comps.structure.id;
        const comm = comps.comms.id;
        const prop = comps.propulsion.id;
        const insts = comps.instruments;

        const isOverload = calc.totalMassKg > calc.lvMaxPayloadKg;
        const fairingStroke = isOverload ? "#FF2A55" : "#00F0FF";
        const fairingFill = isOverload ? "rgba(255, 42, 85, 0.05)" : "rgba(0, 240, 255, 0.03)";

        const busStroke = struct === "struct_vault" ? "#FFB800" : (struct === "struct_carbon" ? "#00F0FF" : "#CAD5E8");
        const busFill = struct === "struct_vault" ? "#1A2234" : "#0D182A";

        // Power Generation Wings SVG
        let pwrSvgLeft = "";
        let pwrSvgRight = "";
        if (pwr.includes("mmrtg")) {
            pwrSvgLeft = `
                <!-- MMRTG Nuclear Generator -->
                <g class="hangar-socket" transform="translate(60, 110)">
                    <rect x="0" y="0" width="42" height="32" fill="#D97706" rx="2" stroke="#F59E0B" stroke-width="1.5"/>
                    <line x1="8" y1="0" x2="8" y2="32" stroke="#78350F" stroke-width="2"/>
                    <line x1="18" y1="0" x2="18" y2="32" stroke="#78350F" stroke-width="2"/>
                    <line x1="28" y1="0" x2="28" y2="32" stroke="#78350F" stroke-width="2"/>
                    <line x1="42" y1="16" x2="68" y2="16" stroke="#94A3B8" stroke-width="3"/>
                    <text x="5" y="20" font-family="'Rajdhani', sans-serif" font-size="9" fill="#FFF" font-weight="bold">MMRTG</text>
                </g>
            `;
            pwrSvgRight = `
                <g class="hangar-socket" transform="translate(258, 115)">
                    <rect x="0" y="0" width="34" height="22" fill="#334155" rx="2" stroke="#94A3B8" stroke-width="1.5"/>
                    <line x1="-20" y1="11" x2="0" y2="11" stroke="#94A3B8" stroke-width="3"/>
                    <text x="4" y="15" font-family="'Rajdhani', sans-serif" font-size="8" fill="#CAD5E8">RADIATOR</text>
                </g>
            `;
        } else if (pwr === "pwr_ultraflex") {
            pwrSvgLeft = `
                <!-- UltraFlex Circular GaAs Wing Left -->
                <g class="hangar-socket" transform="translate(75, 125)">
                    <circle cx="0" cy="0" r="42" fill="#0B2355" stroke="#00F0FF" stroke-width="1.5"/>
                    <circle cx="0" cy="0" r="26" fill="none" stroke="#60A5FA" stroke-width="1" stroke-dasharray="3,3"/>
                    <line x1="0" y1="-42" x2="0" y2="42" stroke="#38BDF8" stroke-width="1"/>
                    <line x1="-42" y1="0" x2="42" y2="0" stroke="#38BDF8" stroke-width="1"/>
                    <line x1="42" y1="0" x2="55" y2="0" stroke="#CAD5E8" stroke-width="4"/>
                </g>
            `;
            pwrSvgRight = `
                <!-- UltraFlex Circular GaAs Wing Right -->
                <g class="hangar-socket" transform="translate(285, 125)">
                    <circle cx="0" cy="0" r="42" fill="#0B2355" stroke="#00F0FF" stroke-width="1.5"/>
                    <circle cx="0" cy="0" r="26" fill="none" stroke="#60A5FA" stroke-width="1" stroke-dasharray="3,3"/>
                    <line x1="0" y1="-42" x2="0" y2="42" stroke="#38BDF8" stroke-width="1"/>
                    <line x1="-42" y1="0" x2="42" y2="0" stroke="#38BDF8" stroke-width="1"/>
                    <line x1="-55" y1="0" x2="-42" y2="0" stroke="#CAD5E8" stroke-width="4"/>
                </g>
            `;
        } else {
            pwrSvgLeft = `
                <!-- Standard Silicon Panel Left -->
                <g class="hangar-socket" transform="translate(35, 105)">
                    <rect x="0" y="0" width="90" height="42" fill="#0B2046" stroke="#2563EB" stroke-width="1.5" rx="1"/>
                    <line x1="30" y1="0" x2="30" y2="42" stroke="#1D4ED8" stroke-width="1"/>
                    <line x1="60" y1="0" x2="60" y2="42" stroke="#1D4ED8" stroke-width="1"/>
                    <line x1="90" y1="21" x2="95" y2="21" stroke="#94A3B8" stroke-width="3"/>
                </g>
            `;
            pwrSvgRight = `
                <!-- Standard Silicon Panel Right -->
                <g class="hangar-socket" transform="translate(235, 105)">
                    <rect x="0" y="0" width="90" height="42" fill="#0B2046" stroke="#2563EB" stroke-width="1.5" rx="1"/>
                    <line x1="30" y1="0" x2="30" y2="42" stroke="#1D4ED8" stroke-width="1"/>
                    <line x1="60" y1="0" x2="60" y2="42" stroke="#1D4ED8" stroke-width="1"/>
                    <line x1="-5" y1="21" x2="0" y2="21" stroke="#94A3B8" stroke-width="3"/>
                </g>
            `;
        }

        // Antenna Dish SVG
        let commSvg = "";
        if (comm === "comm_ka_optical") {
            commSvg = `
                <!-- Ka-band Reflector & DSOC Optical Laser -->
                <path d="M 152 75 Q 180 50 208 75" stroke="#00F0FF" stroke-width="2.5" fill="none"/>
                <line x1="180" y1="58" x2="180" y2="75" stroke="#00F0FF" stroke-width="2"/>
                <circle cx="180" cy="56" r="3.5" fill="#38BDF8"/>
                <rect x="187" y="60" width="6" height="12" fill="#FF2A55" rx="1"/>
                <text x="196" y="70" font-family="'Rajdhani', sans-serif" font-size="8" fill="#FF2A55">DSOC</text>
            `;
        } else if (comm === "comm_x_band") {
            commSvg = `
                <!-- High-Gain X-band Parabolic Dish -->
                <path d="M 155 78 Q 180 54 205 78" stroke="#CBD5E1" stroke-width="2.5" fill="none"/>
                <line x1="180" y1="62" x2="180" y2="78" stroke="#CBD5E1" stroke-width="2"/>
                <circle cx="180" cy="60" r="3" fill="#00F0FF"/>
            `;
        } else {
            commSvg = `
                <!-- Low-Gain S-band Omni Whip -->
                <line x1="180" y1="50" x2="180" y2="78" stroke="#94A3B8" stroke-width="2.5"/>
                <circle cx="180" cy="48" r="3.5" fill="#FFB800"/>
            `;
        }

        // Propulsion Nozzle SVG
        let propSvg = "";
        if (prop === "prop_ion") {
            propSvg = `
                <!-- NEXT-C Ion Thruster Grid -->
                <polygon points="166,162 194,162 198,178 162,178" fill="#1E293B" stroke="#00F0FF" stroke-width="1.5"/>
                <line x1="168" y1="178" x2="192" y2="178" stroke="#00FF88" stroke-width="2"/>
                <text x="165" y="190" font-family="'Rajdhani', sans-serif" font-size="8" fill="#00FF88">ION GRIDS</text>
            `;
        } else {
            propSvg = `
                <!-- Monopropellant Hydrazine Thruster Cone -->
                <polygon points="168,162 192,162 196,176 164,176" fill="#334155" stroke="#94A3B8" stroke-width="1.5"/>
            `;
        }

        // Active Instruments Badges on Bus
        const instBadgeSvg = insts.map((inst, idx) => {
            const yOffset = 90 + idx * 11;
            return `
                <circle cx="140" cy="${yOffset}" r="2.5" fill="#00FF88"/>
                <text x="146" y="${yOffset + 3}" font-family="'Rajdhani', sans-serif" font-size="8.5" fill="#CAD5E8">${inst.name.slice(0, 14)}</text>
            `;
        }).join("");

        return `
        <svg viewBox="0 0 360 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#070E1E;">
            <!-- Grid lines & Coordinate Rulers -->
            <defs>
                <pattern id="cleanroomGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(30, 45, 74, 0.4)" stroke-width="0.8"/>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cleanroomGrid)"/>

            <!-- Acoustic Fairing Envelope Outline -->
            <path d="M 180 20 Q 235 35 235 90 L 235 205 L 125 205 L 125 90 Q 125 35 180 20 Z" 
                  fill="${fairingFill}" stroke="${fairingStroke}" stroke-width="1.5" stroke-dasharray="6,4"/>
            <text x="132" y="32" font-family="'Orbitron', sans-serif" font-size="7.5" fill="${fairingStroke}" opacity="0.8">
                FAIRING ENVELOPE [${calc.lvMaxPayloadKg} KG LIMIT]
            </text>

            <!-- Ground plane -->
            <line x1="20" y1="210" x2="340" y2="210" stroke="#1E2D4A" stroke-width="2"/>
            <line x1="180" y1="15" x2="180" y2="215" stroke="rgba(0, 240, 255, 0.2)" stroke-width="1" stroke-dasharray="3,3"/>

            ${pwrSvgLeft}
            ${pwrSvgRight}

            <!-- Central Core Bus Structure -->
            <rect x="130" y="78" width="100" height="84" fill="${busFill}" stroke="${busStroke}" stroke-width="2" rx="4"/>
            <rect x="135" y="84" width="90" height="72" fill="#040814" stroke="#1E2D4A" stroke-width="1" rx="2"/>

            <!-- Avionics & Instruments Readout inside Bus -->
            ${instBadgeSvg}

            ${commSvg}
            ${propSvg}

            <!-- Cleanroom Metadata Overlays -->
            <text x="12" y="16" font-family="'Orbitron', sans-serif" font-size="9" fill="#00F0FF" letter-spacing="1">
                CAD CLEANROOM BLUEPRINT
            </text>
            <text x="12" y="28" font-family="'Rajdhani', sans-serif" font-size="10" fill="#9BAAC2">
                STRUCTURE: ${comps.structure.name.toUpperCase()}
            </text>
            <text x="245" y="16" font-family="'Rajdhani', sans-serif" font-size="9.5" fill="${isOverload ? '#FF2A55' : '#00FF88'}" font-weight="bold">
                ${isOverload ? '⚠ OVER MASS CAPACITY' : '✔ MASS ENVELOPE OK'}
            </text>
        </svg>
        `;
    }
}

window.HangarBuilder = HangarBuilder;
