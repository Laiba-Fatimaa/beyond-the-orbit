/**
 * BEYOND THE ORBIT — PROCEDURAL SPACE & PLANET CANVAS RENDERER
 * ============================================================
 * Team Orbitera | NASA Space Apps Challenge 2026
 * 
 * High-performance 60 FPS Canvas visualizer:
 * - Procedural planetary spheres with spherical illumination, craters, and limb glow
 * - Dynamic orbital trajectories with animated spacecraft blips and thruster plumes
 * - 3-layer parallax starfield with variable stellar magnitudes and cosmic nebulae
 * - Scientific sensor scan cones and ground-station RF uplink beams
 */

class SpaceRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.stars = [];
        this.planetAngle = 0;
        this.craftOrbitAngle = 0;
        this.orbitSpeed = 0.008;
        this.isWarping = false;
        this.warpSpeed = 0;
        this.activeDestination = "Moon";
        this.thrusterActive = false;
        this.scanningActive = false;
        this.downlinkActive = false;
        this.mouseX = 0;
        this.mouseY = 0;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / (window.innerWidth || 1)) - 0.5;
            this.mouseY = (e.clientY / (window.innerHeight || 1)) - 0.5;
        });
        this.generateStars();
        this.animate();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    generateStars() {
        this.stars = [];
        for (let i = 0; i < 280; i++) {
            this.stars.push({
                x: Math.random() * this.width - this.width / 2,
                y: Math.random() * this.height - this.height / 2,
                z: Math.random() * this.width,
                radius: Math.random() * 1.6 + 0.4,
                twinklePhase: Math.random() * Math.PI * 2,
                twinkleSpeed: Math.random() * 0.04 + 0.01,
                color: this.getStellarColor()
            });
        }
    }

    getStellarColor() {
        const types = [
            'rgba(244, 247, 255, ',  // Class A/F White
            'rgba(180, 220, 255, ',  // Class B Blue
            'rgba(255, 220, 150, ',  // Class G Yellow (Solar)
            'rgba(255, 160, 100, '   // Class M Red Giant
        ];
        return types[Math.floor(Math.random() * types.length)];
    }

    setDestination(dest) {
        this.activeDestination = dest;
    }

    setWarp(enabled) {
        this.isWarping = enabled;
    }

    setThruster(active) {
        this.thrusterActive = active;
    }

    setScanning(active) {
        this.scanningActive = active;
    }

    setDownlink(active) {
        this.downlinkActive = active;
    }

    animate() {
        this.ctx.fillStyle = '#040814';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw deep cosmic nebula dust
        this.drawNebula();

        // Draw starfield
        this.drawStars();

        this.planetAngle += 0.003;
        this.craftOrbitAngle += this.orbitSpeed;

        requestAnimationFrame(() => this.animate());
    }

    drawNebula() {
        const cx = this.width * 0.8;
        const cy = this.height * 0.25;
        const grad = this.ctx.createRadialGradient(cx, cy, 30, cx, cy, this.width * 0.6);
        grad.addColorStop(0, 'rgba(30, 60, 130, 0.12)');
        grad.addColorStop(0.5, 'rgba(67, 217, 255, 0.04)');
        grad.addColorStop(1, 'rgba(4, 8, 20, 0)');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.width, this.height);

        const grad2 = this.ctx.createRadialGradient(this.width * 0.15, this.height * 0.75, 40, this.width * 0.15, this.height * 0.75, this.width * 0.5);
        grad2.addColorStop(0, 'rgba(255, 110, 50, 0.06)');
        grad2.addColorStop(1, 'rgba(4, 8, 20, 0)');
        this.ctx.fillStyle = grad2;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawStars() {
        const targetSpeed = this.isWarping ? 32 : 0.6;
        this.warpSpeed += (targetSpeed - this.warpSpeed) * 0.05;

        const cx = this.width / 2;
        const cy = this.height / 2;

        for (let i = 0; i < this.stars.length; i++) {
            const s = this.stars[i];
            s.z -= this.warpSpeed;
            if (s.z <= 0) {
                s.z = this.width;
                s.x = Math.random() * this.width - this.width / 2;
                s.y = Math.random() * this.height - this.height / 2;
            }

            const k = 260 / s.z;
            const px = s.x * k + cx;
            const py = s.y * k + cy;

            if (px >= 0 && px <= this.width && py >= 0 && py <= this.height) {
                s.twinklePhase += s.twinkleSpeed;
                const alpha = (Math.min(1.0, (1 - s.z / this.width) * 1.3) * (0.6 + 0.4 * Math.sin(s.twinklePhase))).toFixed(2);

                if (this.warpSpeed > 6) {
                    const prevK = 260 / (s.z + this.warpSpeed * 2.2);
                    const prevX = s.x * prevK + cx;
                    const prevY = s.y * prevK + cy;

                    this.ctx.beginPath();
                    this.ctx.moveTo(prevX, prevY);
                    this.ctx.lineTo(px, py);
                    this.ctx.strokeStyle = `${s.color}${alpha})`;
                    this.ctx.lineWidth = s.radius * k * 0.8;
                    this.ctx.stroke();
                } else {
                    this.ctx.beginPath();
                    this.ctx.arc(px, py, Math.max(0.7, s.radius * k), 0, Math.PI * 2);
                    this.ctx.fillStyle = `${s.color}${alpha})`;
                    this.ctx.fill();
                }
            }
        }
    }

    /**
     * Renders a photorealistic procedurally shaded celestial body on any 2D canvas context.
     */
    drawPlanetOnContext(ctx, x, y, radius, destination, rotAngle = 0) {
        ctx.save();
        ctx.translate(x, y);

        if (destination === "Moon") {
            // Moon - Basaltic regolith & rayed craters
            const grad = ctx.createRadialGradient(-radius * 0.35, -radius * 0.35, radius * 0.1, 0, 0, radius);
            grad.addColorStop(0, '#D6DCE5');
            grad.addColorStop(0.55, '#8C96A5');
            grad.addColorStop(0.85, '#4F5866');
            grad.addColorStop(1, '#1E232B');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();

            // Craters & Maria
            ctx.save();
            ctx.clip();
            ctx.rotate(rotAngle);

            // Oceanus Procellarum / Maria patches
            ctx.fillStyle = 'rgba(45, 52, 64, 0.45)';
            ctx.beginPath();
            ctx.arc(-radius * 0.2, -radius * 0.1, radius * 0.38, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(radius * 0.25, radius * 0.2, radius * 0.28, 0, Math.PI * 2);
            ctx.fill();

            // Tycho rayed crater
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.lineWidth = 1;
            for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
                ctx.beginPath();
                ctx.moveTo(-radius * 0.1, radius * 0.45);
                ctx.lineTo(-radius * 0.1 + Math.cos(a) * radius * 0.4, radius * 0.45 + Math.sin(a) * radius * 0.4);
                ctx.stroke();
            }

            // South Pole cold trap indicator
            ctx.fillStyle = '#0B0D12';
            ctx.beginPath();
            ctx.ellipse(0, radius * 0.88, radius * 0.35, radius * 0.1, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

            // Terminator night shadow
            const shadow = ctx.createRadialGradient(radius * 0.5, radius * 0.2, radius * 0.2, 0, 0, radius);
            shadow.addColorStop(0, 'rgba(0,0,0,0)');
            shadow.addColorStop(0.8, 'rgba(4,8,16,0.6)');
            shadow.addColorStop(1, 'rgba(4,8,16,0.95)');
            ctx.fillStyle = shadow;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();

        } else if (destination === "Mars") {
            // Mars - Iron oxide red planet with atmosphere limb
            const grad = ctx.createRadialGradient(-radius * 0.35, -radius * 0.35, radius * 0.1, 0, 0, radius);
            grad.addColorStop(0, '#F56B42');
            grad.addColorStop(0.5, '#C44623');
            grad.addColorStop(0.85, '#872B12');
            grad.addColorStop(1, '#330D05');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.save();
            ctx.clip();
            ctx.rotate(rotAngle);

            // Dark albedo features (Syrtis Major)
            ctx.fillStyle = 'rgba(70, 25, 15, 0.5)';
            ctx.beginPath();
            ctx.moveTo(-radius * 0.3, -radius * 0.1);
            ctx.quadraticCurveTo(0, radius * 0.3, radius * 0.4, 0);
            ctx.quadraticCurveTo(radius * 0.2, -radius * 0.4, -radius * 0.3, -radius * 0.1);
            ctx.fill();

            // Valles Marineris canyon rift
            ctx.strokeStyle = '#381007';
            ctx.lineWidth = Math.max(2, radius * 0.04);
            ctx.beginPath();
            ctx.moveTo(-radius * 0.4, radius * 0.05);
            ctx.quadraticCurveTo(0, radius * 0.15, radius * 0.35, radius * 0.08);
            ctx.stroke();

            // North Polar Ice Cap (CO2 / H2O ice)
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.ellipse(0, -radius * 0.85, radius * 0.32, radius * 0.12, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

            // Thin blue atmospheric limb scattering
            ctx.strokeStyle = 'rgba(100, 180, 255, 0.35)';
            ctx.lineWidth = Math.max(2, radius * 0.06);
            ctx.beginPath();
            ctx.arc(0, 0, radius + 1, -Math.PI * 0.8, Math.PI * 0.3);
            ctx.stroke();

        } else {
            // Europa - Jovian ice moon with fractured lineae & Jupiter backdrop
            const grad = ctx.createRadialGradient(-radius * 0.35, -radius * 0.35, radius * 0.1, 0, 0, radius);
            grad.addColorStop(0, '#FFFFFF');
            grad.addColorStop(0.45, '#DCE4ED');
            grad.addColorStop(0.85, '#8CA0B8');
            grad.addColorStop(1, '#253545');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.save();
            ctx.clip();
            ctx.rotate(rotAngle);

            // Reddish-brown chaos terrain cracks (salts & mineral lineae)
            ctx.strokeStyle = 'rgba(180, 75, 45, 0.7)';
            ctx.lineWidth = Math.max(1.2, radius * 0.025);

            ctx.beginPath();
            ctx.moveTo(-radius * 0.6, -radius * 0.3);
            ctx.quadraticCurveTo(0, -radius * 0.1, radius * 0.6, -radius * 0.4);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(-radius * 0.5, radius * 0.2);
            ctx.quadraticCurveTo(-radius * 0.1, 0, radius * 0.5, radius * 0.35);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(-radius * 0.2, -radius * 0.6);
            ctx.quadraticCurveTo(0, 0, -radius * 0.1, radius * 0.6);
            ctx.stroke();

            // Chaos patch (Conamara Chaos)
            ctx.fillStyle = 'rgba(180, 80, 50, 0.4)';
            ctx.beginPath();
            ctx.arc(radius * 0.2, radius * 0.1, radius * 0.25, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

            // Plume vapor venting (Thrace Macula)
            ctx.strokeStyle = 'rgba(67, 217, 255, 0.8)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(radius * 0.8, -radius * 0.4);
            ctx.quadraticCurveTo(radius * 1.25, -radius * 0.7, radius * 1.35, -radius * 0.95);
            ctx.stroke();

            ctx.fillStyle = 'rgba(67, 217, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(radius * 1.35, -radius * 0.95, radius * 0.15, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Draws the orbital radar view on the mission operations deck.
     */
    /**
     * Draws the cinematic orbital flight deck environment.
     * Features:
     * - Dominant high-resolution planetary horizon
     * - Moving spacecraft along orbital trajectory with glowing thruster plumes
     * - Surface Reconnaissance Viewfinder targeting box over geological target
     * - Scanning laser beam, DSN RF link, and telemetry telemetry HUD
     */
    drawFlightDeckRadar(canvasId, destination, orbitPhase, altitudeKm, isDaylight, isGroundContact, activeTarget = null) {
        const c = document.getElementById(canvasId);
        if (!c) return;
        const ctx = c.getContext('2d');
        const w = c.width = c.clientWidth;
        const h = c.height = c.clientHeight;

        ctx.fillStyle = '#030612';
        ctx.fillRect(0, 0, w, h);

        // Deep space starfield in viewport
        for (let i = 0; i < 40; i++) {
            const sx = (i * 137.5) % w;
            const sy = (i * 89.3) % h;
            ctx.fillStyle = `rgba(200, 225, 255, ${0.2 + (i % 5) * 0.15})`;
            ctx.beginPath();
            ctx.arc(sx, sy, (i % 3 === 0 ? 1.4 : 0.8), 0, Math.PI * 2);
            ctx.fill();
        }

        // Central Planet position — shifted right/center to create dramatic composition
        const cx = w * 0.58;
        const cy = h * 0.56;
        const planetR = Math.min(w, h) * 0.44;
        const orbitRx = planetR * 1.42;
        const orbitRy = orbitRx * 0.62;

        // If Europa, draw colossal Jupiter gas giant with Great Red Spot in background
        if (destination === "Europa") {
            const jx = w * 0.88;
            const jy = h * 0.22;
            const jR = planetR * 0.75;
            const jGrad = ctx.createRadialGradient(jx - jR * 0.3, jy - jR * 0.3, jR * 0.1, jx, jy, jR);
            jGrad.addColorStop(0, '#E8CBB0');
            jGrad.addColorStop(0.4, '#C99065');
            jGrad.addColorStop(0.75, '#8C4B28');
            jGrad.addColorStop(1, '#1A0D06');
            ctx.fillStyle = jGrad;
            ctx.beginPath();
            ctx.arc(jx, jy, jR, 0, Math.PI * 2);
            ctx.fill();

            // Jupiter bands
            ctx.save();
            ctx.beginPath();
            ctx.arc(jx, jy, jR, 0, Math.PI * 2);
            ctx.clip();
            for (let b = -4; b <= 4; b++) {
                ctx.fillStyle = b % 2 === 0 ? 'rgba(90, 40, 15, 0.4)' : 'rgba(235, 200, 170, 0.25)';
                ctx.fillRect(jx - jR, jy + b * (jR * 0.2), jR * 2, jR * 0.12);
            }
            // Great Red Spot
            ctx.fillStyle = '#A33E26';
            ctx.beginPath();
            ctx.ellipse(jx + jR * 0.25, jy + jR * 0.28, jR * 0.22, jR * 0.12, 0.1, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Draw orbital trajectory plane
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.ellipse(cx, cy, orbitRx, orbitRy, -Math.PI * 0.08, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Calculate spacecraft position on orbit
        const craftX = cx + Math.cos(orbitPhase) * orbitRx;
        const craftY = cy + Math.sin(orbitPhase) * orbitRy;

        // Ground station uplink cone (when in contact)
        if (isGroundContact) {
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(w * 0.08, h * 0.92);
            ctx.lineTo(craftX, craftY);
            ctx.stroke();

            ctx.fillStyle = '#00D4FF';
            ctx.font = '10px "Rajdhani", sans-serif';
            ctx.fillText('📡 DSN CARRIER LOCK: 2.2 GHz', w * 0.03, h * 0.95);
        }

        // Draw destination planet
        this.drawPlanetOnContext(ctx, cx, cy, planetR, destination, this.planetAngle);

        // --- SURFACE RECONNAISSANCE VIEWFINDER TARGET BOX ---
        // A high-tech square HUD targeting box over the planet's surface
        const vfSize = Math.min(w, h) * 0.26;
        const vfX = cx + planetR * 0.18;
        const vfY = cy - planetR * 0.32;

        ctx.save();
        // Viewfinder background with magnified planetary surface terrain
        ctx.fillStyle = 'rgba(7, 14, 30, 0.88)';
        ctx.fillRect(vfX, vfY, vfSize, vfSize);

        // Magnified surface terrain inside box
        ctx.save();
        ctx.beginPath();
        ctx.rect(vfX, vfY, vfSize, vfSize);
        ctx.clip();
        
        if (destination === "Mars") {
            // Mars canyon/riverbed terrain inside viewfinder
            ctx.fillStyle = '#A84422';
            ctx.fillRect(vfX, vfY, vfSize, vfSize);
            // Canyon rift
            ctx.strokeStyle = '#4A1406';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(vfX, vfY + vfSize * 0.4);
            ctx.quadraticCurveTo(vfX + vfSize * 0.5, vfY + vfSize * 0.65, vfX + vfSize, vfY + vfSize * 0.5);
            ctx.stroke();
            // Sediment layers
            ctx.strokeStyle = '#752812';
            ctx.lineWidth = 2;
            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.moveTo(vfX, vfY + vfSize * (0.2 + i * 0.18));
                ctx.lineTo(vfX + vfSize, vfY + vfSize * (0.2 + i * 0.18) + 8);
                ctx.stroke();
            }
        } else if (destination === "Moon") {
            // Moon crater basin
            ctx.fillStyle = '#5A6372';
            ctx.fillRect(vfX, vfY, vfSize, vfSize);
            ctx.fillStyle = '#2A303A';
            ctx.beginPath();
            ctx.arc(vfX + vfSize * 0.5, vfY + vfSize * 0.5, vfSize * 0.38, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#8E9AA8';
            ctx.lineWidth = 3;
            ctx.stroke();
        } else {
            // Europa ice cracks
            ctx.fillStyle = '#D2DFEE';
            ctx.fillRect(vfX, vfY, vfSize, vfSize);
            ctx.strokeStyle = '#943820';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(vfX, vfY + vfSize * 0.2);
            ctx.lineTo(vfX + vfSize, vfY + vfSize * 0.8);
            ctx.moveTo(vfX + vfSize * 0.7, vfY);
            ctx.lineTo(vfX + vfSize * 0.2, vfY + vfSize);
            ctx.stroke();
        }

        // Scanlines inside viewfinder
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for (let s = 0; s < vfSize; s += 4) {
            ctx.fillRect(vfX, vfY + s, vfSize, 1.5);
        }
        ctx.restore();

        // High-tech bracket corners
        const cornerLen = 14;
        ctx.strokeStyle = '#00D4FF';
        ctx.lineWidth = 2.5;
        // Top-left
        ctx.beginPath(); ctx.moveTo(vfX, vfY + cornerLen); ctx.lineTo(vfX, vfY); ctx.lineTo(vfX + cornerLen, vfY); ctx.stroke();
        // Top-right
        ctx.beginPath(); ctx.moveTo(vfX + vfSize - cornerLen, vfY); ctx.lineTo(vfX + vfSize, vfY); ctx.lineTo(vfX + vfSize, vfY + cornerLen); ctx.stroke();
        // Bottom-left
        ctx.beginPath(); ctx.moveTo(vfX, vfY + vfSize - cornerLen); ctx.lineTo(vfX, vfY + vfSize); ctx.lineTo(vfX + cornerLen, vfY + vfSize); ctx.stroke();
        // Bottom-right
        ctx.beginPath(); ctx.moveTo(vfX + vfSize - cornerLen, vfY + vfSize); ctx.lineTo(vfX + vfSize, vfY + vfSize); ctx.lineTo(vfX + vfSize, vfY + vfSize - cornerLen); ctx.stroke();

        // Center crosshair
        const vMidX = vfX + vfSize / 2;
        const vMidY = vfY + vfSize / 2;
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.8)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(vMidX - 10, vMidY); ctx.lineTo(vMidX + 10, vMidY);
        ctx.moveTo(vMidX, vMidY - 10); ctx.lineTo(vMidX, vMidY + 10);
        ctx.stroke();
        ctx.strokeRect(vMidX - 4, vMidY - 4, 8, 8);

        // Viewfinder Target Label
        const tgtName = activeTarget ? activeTarget.name : (destination === "Mars" ? "Jezero Crater Paleolake Delta" : (destination === "Moon" ? "Shackleton Crater Ice Basin" : "Conamara Chaos Cryo-Plume"));
        ctx.fillStyle = '#00D4FF';
        ctx.font = '10px "Rajdhani", sans-serif';
        ctx.fillText(`TARGET RECON: ${tgtName.toUpperCase()}`, vfX + 4, vfY - 6);
        ctx.fillStyle = '#CAD5E8';
        ctx.font = '9px "Rajdhani", sans-serif';
        ctx.fillText('COORD: 18.38°N 77.58°E · ELEV -2500m', vfX + 4, vfY + vfSize + 12);

        // Target acquisition lead line from target to spacecraft
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.35)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(vMidX, vMidY);
        ctx.lineTo(craftX, craftY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.restore();

        // --- SENSOR SCANNING CONE & BEAM ---
        if (this.scanningActive) {
            // Intense scanning laser beam from craft to viewfinder center
            const scanGrad = ctx.createLinearGradient(craftX, craftY, vMidX, vMidY);
            scanGrad.addColorStop(0, '#00D4FF');
            scanGrad.addColorStop(0.5, 'rgba(0, 255, 136, 0.8)');
            scanGrad.addColorStop(1, 'rgba(0, 212, 255, 0.1)');
            ctx.strokeStyle = scanGrad;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(craftX, craftY);
            ctx.lineTo(vMidX, vMidY);
            ctx.stroke();

            // Broad sensor scan cone
            ctx.fillStyle = 'rgba(0, 212, 255, 0.18)';
            ctx.beginPath();
            ctx.moveTo(craftX, craftY);
            ctx.lineTo(vfX, vfY);
            ctx.lineTo(vfX + vfSize, vfY + vfSize);
            ctx.closePath();
            ctx.fill();
        }

        // --- DETAILED SPACECRAFT ON ORBIT ---
        ctx.save();
        ctx.translate(craftX, craftY);

        // Orient spacecraft tangential to orbit
        const craftAngle = orbitPhase + Math.PI / 2;
        ctx.rotate(craftAngle);

        // Thruster exhaust plumes (Chemical or Ion)
        if (this.thrusterActive) {
            // Major engine fire
            const fireGrad = ctx.createLinearGradient(0, 10, 0, 45);
            fireGrad.addColorStop(0, '#FFFFFF');
            fireGrad.addColorStop(0.3, '#FFB547');
            fireGrad.addColorStop(0.7, '#FF3355');
            fireGrad.addColorStop(1, 'rgba(255, 51, 85, 0)');
            ctx.fillStyle = fireGrad;
            ctx.beginPath();
            ctx.moveTo(-6, 10);
            ctx.lineTo(0, 48);
            ctx.lineTo(6, 10);
            ctx.closePath();
            ctx.fill();
        } else {
            // Idle blue ion thruster glow
            ctx.fillStyle = 'rgba(0, 212, 255, 0.7)';
            ctx.beginPath();
            ctx.moveTo(-3, 8);
            ctx.lineTo(0, 18);
            ctx.lineTo(3, 8);
            ctx.closePath();
            ctx.fill();
        }

        // Spacecraft bus core body
        ctx.fillStyle = isDaylight ? '#1A294A' : '#0B1324';
        ctx.strokeStyle = '#CAD5E8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-10, -8, 20, 16, 2);
        ctx.fill();
        ctx.stroke();

        // Gold thermal blanket accent
        ctx.fillStyle = '#C8A230';
        ctx.fillRect(-8, -6, 16, 4);

        // Solar panels (Left & Right)
        ctx.fillStyle = '#0B2355';
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1.2;
        // Left wing
        ctx.fillRect(-32, -6, 20, 12);
        ctx.strokeRect(-32, -6, 20, 12);
        // Right wing
        ctx.fillRect(12, -6, 20, 12);
        ctx.strokeRect(12, -6, 20, 12);

        // High gain antenna dish
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, -12, 6, 0, Math.PI);
        ctx.stroke();

        // Blinking green navigation beacon
        const beaconOn = Math.floor(Date.now() / 400) % 2 === 0;
        if (beaconOn) {
            ctx.fillStyle = '#00FF88';
            ctx.beginPath();
            ctx.arc(0, 0, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        // Top telemetry tags on flight deck canvas
        ctx.fillStyle = '#CAD5E8';
        ctx.font = '11px "Orbitron", sans-serif';
        ctx.fillText(`ORBIT ALTITUDE: ${altitudeKm.toFixed(0)} KM`, 20, 32);
        ctx.fillStyle = isDaylight ? '#FFB547' : '#64748B';
        ctx.fillText(isDaylight ? '☀ SUNLIT PASS' : '🌑 ECLIPSE SHADOW', 20, 48);
    }

    /**
     * Renders the cinematic landing page: enormous planet filling the bottom
     * of the viewport with atmospheric glow and a detailed spacecraft in the foreground.
     */
    renderLandingPlanet(canvasId) {
        const c = document.getElementById(canvasId);
        if (!c) return;
        const ctx = c.getContext('2d');
        const w = c.width = c.clientWidth || window.innerWidth;
        const h = c.height = c.clientHeight || window.innerHeight;

        ctx.clearRect(0, 0, w, h);

        // Enormous planet at bottom — radius large enough to fill the bottom half
        const planetR = Math.max(w, h) * 0.65;
        const cx = (w * 0.5) + (this.mouseX * 25);
        const cy = (h + planetR * 0.35) + (this.mouseY * 18); // pushes center below viewport so top of planet is visible

        // Atmospheric outer glow (bluish haze)
        const atmoGlow = ctx.createRadialGradient(cx, cy, planetR * 0.95, cx, cy, planetR * 1.3);
        atmoGlow.addColorStop(0, 'rgba(30, 120, 255, 0.15)');
        atmoGlow.addColorStop(0.5, 'rgba(0, 180, 255, 0.06)');
        atmoGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = atmoGlow;
        ctx.fillRect(0, 0, w, h);

        // Planet body — deep blue-gray Earth-like sphere with terrain
        const bodyGrad = ctx.createRadialGradient(
            cx - planetR * 0.3, cy - planetR * 0.4, planetR * 0.1,
            cx, cy, planetR
        );
        bodyGrad.addColorStop(0, '#4A7CB8');
        bodyGrad.addColorStop(0.2, '#2A5A8F');
        bodyGrad.addColorStop(0.45, '#1A3A6A');
        bodyGrad.addColorStop(0.7, '#0E2245');
        bodyGrad.addColorStop(1, '#040E22');

        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, planetR, 0, Math.PI * 2);
        ctx.fill();

        // Terrain features — continental shapes
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, planetR, 0, Math.PI * 2);
        ctx.clip();

        const t = (this.planetAngle || 0) * 0.3;

        // Landmasses (brownish-green continents)
        ctx.fillStyle = 'rgba(60, 100, 50, 0.25)';
        ctx.beginPath();
        ctx.moveTo(cx - planetR * 0.25 + Math.sin(t) * 20, cy - planetR * 0.35);
        ctx.quadraticCurveTo(cx + planetR * 0.05, cy - planetR * 0.55, cx + planetR * 0.2, cy - planetR * 0.3);
        ctx.quadraticCurveTo(cx + planetR * 0.35, cy - planetR * 0.15, cx + planetR * 0.15, cy - planetR * 0.05);
        ctx.quadraticCurveTo(cx - planetR * 0.1, cy - planetR * 0.1, cx - planetR * 0.25 + Math.sin(t) * 20, cy - planetR * 0.35);
        ctx.fill();

        ctx.fillStyle = 'rgba(80, 120, 60, 0.2)';
        ctx.beginPath();
        ctx.arc(cx - planetR * 0.3, cy - planetR * 0.15, planetR * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Cloud bands
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = planetR * 0.03;
        for (let i = 0; i < 5; i++) {
            const cloudY = cy - planetR * (0.5 - i * 0.15);
            ctx.beginPath();
            ctx.moveTo(cx - planetR * 0.8, cloudY);
            ctx.quadraticCurveTo(cx, cloudY - 15 + Math.sin(t + i) * 8, cx + planetR * 0.8, cloudY + 5);
            ctx.stroke();
        }

        ctx.restore();

        // Atmospheric limb (bright horizon glow)
        const limbGrad = ctx.createRadialGradient(cx, cy, planetR * 0.98, cx, cy, planetR * 1.02);
        limbGrad.addColorStop(0, 'rgba(100, 180, 255, 0.5)');
        limbGrad.addColorStop(0.5, 'rgba(50, 130, 255, 0.25)');
        limbGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.strokeStyle = limbGrad;
        ctx.lineWidth = planetR * 0.015;
        ctx.beginPath();
        ctx.arc(cx, cy, planetR, -Math.PI, 0);
        ctx.stroke();

        // Bright horizon light bloom at the very top of the planet
        const bloomGrad = ctx.createRadialGradient(cx, cy - planetR + 10, 0, cx, cy - planetR + 10, planetR * 0.4);
        bloomGrad.addColorStop(0, 'rgba(140, 200, 255, 0.35)');
        bloomGrad.addColorStop(0.3, 'rgba(60, 140, 255, 0.15)');
        bloomGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = bloomGrad;
        ctx.fillRect(0, 0, w, h);

        // Sunrise glow on the right
        const sunGrad = ctx.createRadialGradient(w * 0.85, cy - planetR * 0.2, 0, w * 0.85, cy - planetR * 0.2, planetR * 0.5);
        sunGrad.addColorStop(0, 'rgba(255, 200, 100, 0.15)');
        sunGrad.addColorStop(0.4, 'rgba(255, 140, 60, 0.05)');
        sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = sunGrad;
        ctx.fillRect(0, 0, w, h);
    }

    /**
     * Renders a detailed spacecraft probe on the landing page canvas.
     */
    renderLandingCraft(canvasId) {
        const c = document.getElementById(canvasId);
        if (!c) return;
        const ctx = c.getContext('2d');
        const w = c.width = c.clientWidth || window.innerWidth;
        const h = c.height = c.clientHeight || window.innerHeight;
        ctx.clearRect(0, 0, w, h);

        const t = Date.now() * 0.001;
        // Spacecraft position — upper-right area, with subtle inverse parallax
        const scX = (w * 0.72) - (this.mouseX * 35);
        const scY = (h * 0.35 + Math.sin(t * 0.4) * 8) - (this.mouseY * 25); // gentle floating
        const scale = Math.min(w, h) / 800; // responsive scaling

        ctx.save();
        ctx.translate(scX, scY);
        ctx.rotate(-0.15); // slight tilt
        ctx.scale(scale, scale);

        // Solar panels — left wing
        ctx.fillStyle = '#0B2355';
        ctx.strokeStyle = '#2980D9';
        ctx.lineWidth = 1.5;
        // Left panel segment 1
        ctx.fillRect(-160, -15, 55, 30);
        ctx.strokeRect(-160, -15, 55, 30);
        // Left panel segment 2
        ctx.fillRect(-100, -15, 55, 30);
        ctx.strokeRect(-100, -15, 55, 30);
        // Panel grid lines
        ctx.strokeStyle = 'rgba(41, 128, 217, 0.4)';
        ctx.lineWidth = 0.5;
        for (let gx = -155; gx < -45; gx += 12) {
            ctx.beginPath(); ctx.moveTo(gx, -15); ctx.lineTo(gx, 15); ctx.stroke();
        }
        for (let gy = -10; gy <= 10; gy += 10) {
            ctx.beginPath(); ctx.moveTo(-160, gy); ctx.lineTo(-45, gy); ctx.stroke();
        }

        // Solar panels — right wing
        ctx.fillStyle = '#0B2355';
        ctx.strokeStyle = '#2980D9';
        ctx.lineWidth = 1.5;
        ctx.fillRect(45, -15, 55, 30);
        ctx.strokeRect(45, -15, 55, 30);
        ctx.fillRect(105, -15, 55, 30);
        ctx.strokeRect(105, -15, 55, 30);
        ctx.strokeStyle = 'rgba(41, 128, 217, 0.4)';
        ctx.lineWidth = 0.5;
        for (let gx = 50; gx < 160; gx += 12) {
            ctx.beginPath(); ctx.moveTo(gx, -15); ctx.lineTo(gx, 15); ctx.stroke();
        }
        for (let gy = -10; gy <= 10; gy += 10) {
            ctx.beginPath(); ctx.moveTo(45, gy); ctx.lineTo(160, gy); ctx.stroke();
        }

        // Main spacecraft bus body
        ctx.fillStyle = '#1A2540';
        ctx.strokeStyle = '#AAB8D0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-40, -28, 80, 56, 4);
        ctx.fill();
        ctx.stroke();

        // Golden thermal blanket accent
        ctx.fillStyle = '#C8A230';
        ctx.fillRect(-36, -24, 72, 10);
        ctx.fillStyle = '#A88520';
        ctx.fillRect(-36, -14, 72, 5);

        // Science instruments pod
        ctx.fillStyle = '#0E1B30';
        ctx.strokeStyle = '#5BA3E0';
        ctx.lineWidth = 1;
        ctx.fillRect(-25, 8, 50, 16);
        ctx.strokeRect(-25, 8, 50, 16);

        // HGA dish — high-gain antenna (on top)
        ctx.fillStyle = '#D0D8E8';
        ctx.beginPath();
        ctx.ellipse(0, -38, 22, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#8899B5';
        ctx.lineWidth = 1;
        ctx.stroke();
        // Antenna feed
        ctx.strokeStyle = '#AAB8D0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -38);
        ctx.lineTo(0, -52);
        ctx.stroke();
        ctx.fillStyle = '#FF4444';
        ctx.beginPath();
        ctx.arc(0, -54, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Thruster nozzle at bottom
        ctx.fillStyle = '#556070';
        ctx.beginPath();
        ctx.moveTo(-12, 28);
        ctx.lineTo(-16, 40);
        ctx.lineTo(16, 40);
        ctx.lineTo(12, 28);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#8899B5';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Solar reflection glint (animated)
        const glintAlpha = 0.3 + 0.2 * Math.sin(t * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${glintAlpha})`;
        ctx.beginPath();
        ctx.arc(-120, -5, 3, 0, Math.PI * 2);
        ctx.fill();

        // Blinking status light
        if (Math.floor(t * 1.5) % 2 === 0) {
            ctx.fillStyle = '#00E676';
            ctx.beginPath();
            ctx.arc(30, -20, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        // Lens flare effect near spacecraft
        const flareX = scX + 60 * scale;
        const flareY = scY - 40 * scale;
        const flareGrad = ctx.createRadialGradient(flareX, flareY, 0, flareX, flareY, 60);
        flareGrad.addColorStop(0, 'rgba(200, 220, 255, 0.12)');
        flareGrad.addColorStop(0.5, 'rgba(100, 160, 255, 0.04)');
        flareGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = flareGrad;
        ctx.fillRect(0, 0, w, h);
    }

    /**
     * Renders a destination preview planet on a canvas — used for mission selection cards.
     */
    renderDestinationPreview(canvasId, destination) {
        const c = document.getElementById(canvasId);
        if (!c) return;
        const ctx = c.getContext('2d');
        const w = c.width = c.clientWidth;
        const h = c.height = c.clientHeight;

        // Dark space background with subtle gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#030610');
        bgGrad.addColorStop(1, '#080E20');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Add a few local stars
        for (let i = 0; i < 30; i++) {
            const sx = Math.random() * w;
            const sy = Math.random() * h;
            ctx.fillStyle = `rgba(200, 220, 255, ${Math.random() * 0.5 + 0.1})`;
            ctx.beginPath();
            ctx.arc(sx, sy, Math.random() * 1 + 0.3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw the planet
        const pR = Math.min(w, h) * 0.38;
        this.drawPlanetOnContext(ctx, w / 2, h * 0.48, pR, destination, this.planetAngle * 0.5);

        // For Europa, also draw Jupiter in background
        if (destination === 'Europa') {
            this.drawPlanetOnContext(ctx, w * 0.8, h * 0.2, pR * 0.6, 'Jupiter_bg', 0);
        }
    }
}

window.SpaceRenderer = SpaceRenderer;

