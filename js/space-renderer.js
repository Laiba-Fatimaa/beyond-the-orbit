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
 * - Phase-aware asteroid field using real sprite assets
 */

// ── roundRect polyfill for older Chrome / Firefox versions ───────────────────
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y,     x + w, y + h, r);
        this.arcTo(x + w, y + h, x,     y + h, r);
        this.arcTo(x,     y + h, x,     y,     r);
        this.arcTo(x,     y,     x + w, y,     r);
        this.closePath();
        return this;
    };
}

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

        // Preloaded image assets
        this._imgs = {};
        this._preloadImages();

        // Asteroid field sprites state
        this._asteroids = this._buildAsteroidField();

        this.init();
    }

    _preloadImages() {
        const assets = {
            asteroid_bennu: 'assets/asteroid_bennu.png',
            asteroid_vesta: 'assets/asteroid_vesta.png',
            asteroid_ryugu: 'assets/asteroid_ryugu.png',
            asteroid_eros:  'assets/asteroid_eros.png',
            moon_env:       'assets/moon_mission_env.jpg',
            mars_env:       'assets/mars_mission_env.jpg',
            europa_env:     'assets/europa_mission_env.jpg',
            mars_panorama:  'assets/mars_panorama.jpg',
            moon_card:      'assets/dest_card_moon.jpg',
            europa_disk:    'assets/europa_disk.jpg',
            hangar_wide:    'assets/hangar_wide.jpg',
            spacecraft_pedestal: 'assets/spacecraft_pedestal.png',
            artemis_orion_earth: 'assets/artemis_orion_earth.png',
            spacecraft_cleanroom_nasa: 'assets/spacecraft_cleanroom_nasa.png',
        };
        for (const [key, src] of Object.entries(assets)) {
            const img = new Image();
            img.src = src;
            this._imgs[key] = img;
        }
    }

    _buildAsteroidField() {
        const count = 18;
        const field = [];
        const types = ['asteroid_bennu', 'asteroid_vesta', 'asteroid_ryugu', 'asteroid_eros'];
        for (let i = 0; i < count; i++) {
            field.push({
                x: Math.random(),       // 0–1 fractional screen position
                y: 0.05 + Math.random() * 0.9,
                size: 18 + Math.random() * 56,
                speed: 0.00015 + Math.random() * 0.0004,
                rotSpeed: (Math.random() - 0.5) * 0.025,
                rot: Math.random() * Math.PI * 2,
                type: types[i % types.length],
                depth: 0.3 + Math.random() * 0.7  // 0.3 = far back, 1.0 = close
            });
        }
        return field;
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
     * - Phase-aware rendering: asteroid field (phase 2), approach zoom (phase 3), orbit recon (phase 4)
     */
    _drawAsteroidField(ctx, w, h, t) {
        const imgs = this._imgs || {};
        const field = this._asteroids || [];
        for (let i = 0; i < field.length; i++) {
            const ast = field[i];
            ast.x -= ast.speed;
            if (ast.x < -0.15) ast.x = 1.15;
            ast.rot += ast.rotSpeed;

            const ax = ast.x * w;
            const ay = ast.y * h;
            const sz = ast.size * ast.depth;

            ctx.save();
            ctx.translate(ax, ay);
            ctx.rotate(ast.rot);
            ctx.globalAlpha = 0.55 + ast.depth * 0.4;

            const img = imgs[ast.type];
            if (img && img.complete && img.naturalWidth > 0) {
                ctx.drawImage(img, -sz / 2, -sz / 2, sz, sz);
            } else {
                // Fallback: procedural asteroid rock
                ctx.fillStyle = `rgba(60,55,50,${0.6 + ast.depth * 0.3})`;
                ctx.beginPath();
                ctx.arc(0, 0, sz / 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    }

    drawFlightDeckRadar(canvasId, destination, orbitPhase, altitudeKm, isDaylight, isGroundContact, activeTarget = null, flightPhase = 4) {
        const c = document.getElementById(canvasId);
        if (!c) return;
        const ctx = c.getContext('2d');
        const w = c.width = c.clientWidth;
        const h = c.height = c.clientHeight;
        const t = Date.now() * 0.001;

        // ── PHASE 1 & 2: Deep space with asteroid belt ──────────────────────
        if (flightPhase <= 2) {
            // Clear canvas to reveal moving starfield video underneath
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = 'rgba(3, 6, 14, 0.28)';
            ctx.fillRect(0, 0, w, h);

            // Subtle nebula glow
            const nGrad = ctx.createRadialGradient(w * 0.7, h * 0.3, 20, w * 0.7, h * 0.3, w * 0.6);
            nGrad.addColorStop(0, 'rgba(30,60,130,0.18)');
            nGrad.addColorStop(1, 'rgba(3,6,14,0)');
            ctx.fillStyle = nGrad;
            ctx.fillRect(0, 0, w, h);

            // Static starfield
            for (let i = 0; i < 60; i++) {
                const sx = (i * 173.5 + 30) % w;
                const sy = (i * 97.3 + 50) % h;
                const br = 0.15 + (i % 7) * 0.12;
                ctx.fillStyle = `rgba(200,225,255,${br})`;
                ctx.beginPath();
                ctx.arc(sx, sy, i % 4 === 0 ? 1.4 : 0.7, 0, Math.PI * 2);
                ctx.fill();
            }

            // Phase 2 asteroid field
            if (flightPhase === 2) {
                this._drawAsteroidField(ctx, w, h, t);

                // Phase label
                ctx.fillStyle = 'rgba(139,199,213,0.6)';
                ctx.font = '700 11px "Rajdhani", sans-serif';
                ctx.fillText('⚠ ASTEROID BELT CORRIDOR — DEBRIS FIELD DETECTED', w * 0.5 - 160, 24);
            }

            // Receding Earth & Deep Space Horizon in Phase 1 (Authentic Artemis II art002e000192 reference)
            if (flightPhase === 1) {
                const earthImg = this._imgs ? this._imgs.artemis_orion_earth : null;
                if (earthImg && earthImg.complete && earthImg.naturalWidth > 0) {
                    ctx.save();
                    // Draw authentic Earth limb with auroras and deep space background (NASA art002e000192)
                    const ew = Math.min(w * 0.45, 340);
                    const eh = (ew / earthImg.naturalWidth) * earthImg.naturalHeight;
                    ctx.globalAlpha = 0.85;
                    ctx.drawImage(earthImg, w * 0.04, h * 0.06, ew, eh);

                    // Subtle cyan coordinate overlay border
                    ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(w * 0.04, h * 0.06, ew, eh);

                    ctx.fillStyle = 'rgba(169, 220, 232, 0.9)';
                    ctx.font = '700 10.5px "Rajdhani", sans-serif';
                    ctx.fillText('EARTH RECEDING · TRANSLUNAR INJECTION [NASA ARTEMIS II art002e000192]', w * 0.04 + 6, h * 0.06 + eh + 14);
                    ctx.restore();
                } else {
                    const eR = 28;
                    const eGrad = ctx.createRadialGradient(w*0.12 - 8, h*0.18 - 8, eR*0.1, w*0.12, h*0.18, eR);
                    eGrad.addColorStop(0, '#4A7CB8');
                    eGrad.addColorStop(0.6, '#1A3A6A');
                    eGrad.addColorStop(1, '#040E22');
                    ctx.fillStyle = eGrad;
                    ctx.beginPath();
                    ctx.arc(w * 0.12, h * 0.18, eR, 0, Math.PI * 2);
                    ctx.fill();
                    // Atmospheric limb
                    const eAtmo = ctx.createRadialGradient(w*0.12, h*0.18, eR*0.9, w*0.12, h*0.18, eR*1.15);
                    eAtmo.addColorStop(0, 'rgba(80,160,255,0.4)');
                    eAtmo.addColorStop(1, 'rgba(0,0,0,0)');
                    ctx.fillStyle = eAtmo;
                    ctx.beginPath();
                    ctx.arc(w * 0.12, h * 0.18, eR * 1.15, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = 'rgba(139,199,213,0.5)';
                    ctx.font = '600 10px "Rajdhani", sans-serif';
                    ctx.fillText('EARTH RECEDING', w * 0.065, h * 0.18 + eR + 14);
                }
            }

            // Realistic High-Fidelity Spacecraft Probe
            const scX = w * 0.5 + Math.sin(t * 0.7) * 4;
            const scY = h * 0.5 + Math.cos(t * 0.5) * 3;
            ctx.save();
            ctx.translate(scX, scY);
            ctx.rotate(-0.08);

            const craftImg = this._imgs ? this._imgs.spacecraft_pedestal : null;
            if (craftImg && craftImg.complete && craftImg.naturalWidth > 0) {
                // High-resolution authentic MRO spacecraft model
                const cw = 110;
                const ch = (cw / craftImg.naturalWidth) * craftImg.naturalHeight;
                
                // Thruster plume behind probe
                if (this.thrusterActive) {
                    const thrGrad = ctx.createLinearGradient(-cw * 0.45, 0, -cw * 0.9, 0);
                    thrGrad.addColorStop(0, '#FFFFFF');
                    thrGrad.addColorStop(0.3, '#FFE082');
                    thrGrad.addColorStop(0.7, '#FF7043');
                    thrGrad.addColorStop(1, 'rgba(255, 70, 17, 0)');
                    ctx.fillStyle = thrGrad;
                    ctx.beginPath();
                    ctx.moveTo(-cw * 0.35, -7);
                    ctx.lineTo(-cw * 0.95 - Math.random() * 15, 0);
                    ctx.lineTo(-cw * 0.35, 7);
                    ctx.closePath();
                    ctx.fill();
                } else {
                    // Ion drive idle glow
                    const ionGrad = ctx.createRadialGradient(-cw * 0.35, 0, 1, -cw * 0.5, 0, 14);
                    ionGrad.addColorStop(0, 'rgba(0, 212, 255, 0.95)');
                    ionGrad.addColorStop(0.6, 'rgba(0, 150, 255, 0.4)');
                    ionGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    ctx.fillStyle = ionGrad;
                    ctx.beginPath();
                    ctx.arc(-cw * 0.35, 0, 14, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.drawImage(craftImg, -cw * 0.5, -ch * 0.5, cw, ch);
            } else {
                // Fallback realistic vector probe
                const sScale = 0.6;
                // High-gain dish
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.arc(24 * sScale, 0, 12 * sScale, -Math.PI * 0.45, Math.PI * 0.45);
                ctx.stroke();
                // Golden multi-layer insulation (MLI) body
                const mliGrad = ctx.createLinearGradient(-18 * sScale, -14 * sScale, 18 * sScale, 14 * sScale);
                mliGrad.addColorStop(0, '#D4AF37');
                mliGrad.addColorStop(0.5, '#F5D77F');
                mliGrad.addColorStop(1, '#997316');
                ctx.fillStyle = mliGrad;
                ctx.strokeStyle = '#E8EDF2';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.roundRect(-20 * sScale, -14 * sScale, 40 * sScale, 28 * sScale, 2);
                ctx.fill();
                ctx.stroke();
                // Solar array wings
                ctx.fillStyle = '#0F2C59';
                ctx.strokeStyle = '#38BDF8';
                ctx.lineWidth = 1;
                ctx.fillRect((-20 - 65) * sScale, -8 * sScale, 60 * sScale, 16 * sScale);
                ctx.strokeRect((-20 - 65) * sScale, -8 * sScale, 60 * sScale, 16 * sScale);
                ctx.fillRect(20 * sScale, -8 * sScale, 60 * sScale, 16 * sScale);
                ctx.strokeRect(20 * sScale, -8 * sScale, 60 * sScale, 16 * sScale);
                // Thruster
                const thrGrad = ctx.createRadialGradient(-20 * sScale, 0, 0, -35 * sScale, 0, 25 * sScale);
                thrGrad.addColorStop(0, 'rgba(0, 212, 255, 0.9)');
                thrGrad.addColorStop(1, 'rgba(0, 50, 200, 0)');
                ctx.fillStyle = thrGrad;
                ctx.fillRect(-55 * sScale, -10 * sScale, 35 * sScale, 20 * sScale);
            }
            ctx.restore();

            return; // Don't draw planet/orbit view for phases 1 & 2
        }

        // ── PHASE 3: Destination approach — planet fills viewport ───────────────
        if (flightPhase === 3) {
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = 'rgba(3, 6, 14, 0.25)';
            ctx.fillRect(0, 0, w, h);

            // Stars background
            for (let i = 0; i < 50; i++) {
                const sx = (i * 157.3) % w;
                const sy = (i * 93.7) % h;
                ctx.fillStyle = `rgba(200,225,255,${0.1 + (i % 6) * 0.08})`;
                ctx.beginPath();
                ctx.arc(sx, sy, 0.6 + (i % 3) * 0.4, 0, Math.PI * 2);
                ctx.fill();
            }

            // Large planet centered, filling most of screen (approach)
            const appR = Math.min(w, h) * 0.38 + Math.sin(t * 0.3) * 4;
            this.drawPlanetOnContext(ctx, w * 0.5, h * 0.58, appR, destination, this.planetAngle);

            // Approach label
            ctx.fillStyle = 'rgba(216,164,91,0.9)';
            ctx.font = '700 12px "Rajdhani", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`APPROACHING ${destination.toUpperCase()} — ORBITAL INSERTION BURN REQUIRED`, w * 0.5, h * 0.08);
            ctx.textAlign = 'left';

            // Atmosphere glow overlay
            const atmoRad = appR * 1.08;
            const atmoGrad = ctx.createRadialGradient(w*0.5, h*0.58, appR, w*0.5, h*0.58, atmoRad);
            if (destination === "Mars") {
                atmoGrad.addColorStop(0, 'rgba(255,100,50,0.2)');
                atmoGrad.addColorStop(1, 'rgba(0,0,0,0)');
            } else if (destination === "Moon") {
                atmoGrad.addColorStop(0, 'rgba(200,210,230,0.1)');
                atmoGrad.addColorStop(1, 'rgba(0,0,0,0)');
            } else {
                atmoGrad.addColorStop(0, 'rgba(50,130,220,0.2)');
                atmoGrad.addColorStop(1, 'rgba(0,0,0,0)');
            }
            ctx.fillStyle = atmoGrad;
            ctx.beginPath();
            ctx.arc(w * 0.5, h * 0.58, atmoRad, 0, Math.PI * 2);
            ctx.fill();

            // Spacecraft in foreground during approach & retrograde insertion burn
            const scX = w * 0.38 + Math.sin(t * 0.8) * 6;
            const scY = h * 0.54 + Math.cos(t * 0.6) * 5;
            ctx.save();
            ctx.translate(scX, scY);
            // Angled retrograde relative to planetary trajectory
            ctx.rotate(-0.25);

            // Retrograde insertion burn thruster plasma flare
            if (this.thrusterActive) {
                // High-energy engine exhaust plume (authentic space probe insertion flare)
                const burnGrad = ctx.createLinearGradient(0, 0, -85, 0);
                burnGrad.addColorStop(0, '#FFFFFF');
                burnGrad.addColorStop(0.2, '#FFE57F');
                burnGrad.addColorStop(0.55, '#FF5722');
                burnGrad.addColorStop(0.85, '#D50000');
                burnGrad.addColorStop(1, 'rgba(213, 0, 0, 0)');

                ctx.fillStyle = burnGrad;
                ctx.beginPath();
                ctx.moveTo(-18, -10);
                ctx.lineTo(-85 - Math.random() * 20, 0);
                ctx.lineTo(-18, 10);
                ctx.closePath();
                ctx.fill();

                // Core plasma flare glow
                const flareGrad = ctx.createRadialGradient(-18, 0, 2, -18, 0, 32);
                flareGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
                flareGrad.addColorStop(0.4, 'rgba(255, 171, 0, 0.7)');
                flareGrad.addColorStop(1, 'rgba(255, 87, 34, 0)');
                ctx.fillStyle = flareGrad;
                ctx.beginPath();
                ctx.arc(-18, 0, 32, 0, Math.PI * 2);
                ctx.fill();

                // HUD status burn lock
                ctx.fillStyle = '#FFD54F';
                ctx.font = '700 11px "Rajdhani", sans-serif';
                ctx.fillText('🔥 RETROGRADE ΔV INSERTION BURN ACTIVE', -120, -28);
            } else {
                // Idle attitude thruster glow
                ctx.fillStyle = 'rgba(0, 212, 255, 0.6)';
                ctx.beginPath();
                ctx.moveTo(-16, -3);
                ctx.lineTo(-24, 0);
                ctx.lineTo(-16, 3);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
                ctx.font = '600 10px "Rajdhani", sans-serif';
                ctx.fillText('ALIGNING RETROGRADE VECTOR', -85, -20);
            }

            // Spacecraft representation: Real photographic MRO craft or detailed CAD structure
            const craftImg = this._imgs ? this._imgs.spacecraft_pedestal : null;
            if (craftImg && craftImg.complete && craftImg.naturalWidth > 0) {
                const cw = 140;
                const ch = (cw / craftImg.naturalWidth) * craftImg.naturalHeight;
                ctx.drawImage(craftImg, -cw * 0.45, -ch * 0.5, cw, ch);
            } else {
                // Spacecraft body
                ctx.fillStyle = '#101C33';
                ctx.strokeStyle = '#CAD5E8';
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.roundRect(-16, -12, 32, 24, 3);
                ctx.fill();
                ctx.stroke();

                // Gold thermal MLI blanket
                ctx.fillStyle = '#C8A230';
                ctx.fillRect(-12, -8, 24, 6);

                // Extended Solar Panels (Top & Bottom)
                ctx.fillStyle = '#0B2355';
                ctx.strokeStyle = '#2980D9';
                ctx.lineWidth = 1.2;
                // Top wing
                ctx.fillRect(-6, -42, 12, 30);
                ctx.strokeRect(-6, -42, 12, 30);
                // Bottom wing
                ctx.fillRect(-6, 12, 12, 30);
                ctx.strokeRect(-6, 12, 12, 30);

                // High-Gain Antenna Dish
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(16, 0, 10, -Math.PI * 0.45, Math.PI * 0.45);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(16, 0);
                ctx.lineTo(24, 0);
                ctx.stroke();
            }

            ctx.restore();

            return;
        }

        // ── PHASE 4+: Low-orbit reconnaissance (original full view) ──────────
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(3, 6, 18, 0.25)';
        ctx.fillRect(0, 0, w, h);

        // Destination atmospheric environment backdrop subtle texture
        const envImgs = this._imgs || {};
        let envImg = null;
        if (destination === "Mars") envImg = envImgs.mars_env;
        else if (destination === "Moon") envImg = envImgs.moon_env;
        else envImg = envImgs.europa_env;

        if (envImg && envImg.complete && envImg.naturalWidth > 0) {
            ctx.save();
            ctx.globalAlpha = 0.22;
            ctx.drawImage(envImg, 0, 0, w, h);
            ctx.restore();
        }

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
        // A high-tech square HUD targeting box displaying authentic photographic terrain
        const vfSize = Math.min(w, h) * 0.28;
        const vfX = cx + planetR * 0.16;
        const vfY = cy - planetR * 0.34;

        ctx.save();
        // Viewfinder background
        ctx.fillStyle = 'rgba(7, 14, 30, 0.95)';
        ctx.fillRect(vfX, vfY, vfSize, vfSize);

        // Magnified surface terrain inside box — USING REAL PHOTOGRAPHIC TERRAIN ASSETS
        ctx.save();
        ctx.beginPath();
        ctx.rect(vfX, vfY, vfSize, vfSize);
        ctx.clip();
        
        const imgs = this._imgs || {};
        let terrainImg = null;
        if (destination === "Mars") {
            terrainImg = imgs.mars_panorama;
        } else if (destination === "Moon") {
            terrainImg = imgs.moon_card;
        } else {
            terrainImg = imgs.europa_disk;
        }

        if (terrainImg && terrainImg.complete && terrainImg.naturalWidth > 0) {
            // Draw authentic photographic geological terrain with subtle orbital drift
            const panOffset = (Date.now() * 0.003) % (vfSize * 0.25);
            ctx.drawImage(terrainImg, vfX - panOffset, vfY, vfSize * 1.35, vfSize);
            // High-contrast color grade overlay
            ctx.fillStyle = destination === "Mars" 
                ? 'rgba(168, 68, 34, 0.2)' 
                : (destination === "Moon" ? 'rgba(74, 110, 133, 0.15)' : 'rgba(139, 199, 213, 0.2)');
            ctx.fillRect(vfX, vfY, vfSize, vfSize);
        } else {
            // High-contrast fallback terrain
            ctx.fillStyle = destination === "Mars" ? '#A84422' : (destination === "Moon" ? '#4A5568' : '#D2DFEE');
            ctx.fillRect(vfX, vfY, vfSize, vfSize);
        }

        // Active sensor sweep scanline (sweeps down during active scanning)
        const sweepY = (Date.now() * (this.scanningActive ? 0.35 : 0.08)) % vfSize;
        ctx.fillStyle = this.scanningActive ? 'rgba(0, 255, 136, 0.45)' : 'rgba(0, 212, 255, 0.2)';
        ctx.fillRect(vfX, vfY + sweepY, vfSize, 3);
        ctx.fillStyle = 'rgba(0, 212, 255, 0.08)';
        ctx.fillRect(vfX, vfY + sweepY - 12, vfSize, 12);

        // Subtle CRT scanlines inside viewfinder
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        for (let s = 0; s < vfSize; s += 4) {
            ctx.fillRect(vfX, vfY + s, vfSize, 1.2);
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

        // Spacecraft bus core body: High-resolution probe render
        const craftImg = this._imgs ? this._imgs.spacecraft_pedestal : null;
        if (craftImg && craftImg.complete && craftImg.naturalWidth > 0) {
            const cw = 54;
            const ch = (cw / craftImg.naturalWidth) * craftImg.naturalHeight;
            ctx.save();
            ctx.rotate(-Math.PI / 2); // align with orbital vector
            ctx.drawImage(craftImg, -cw * 0.5, -ch * 0.5, cw, ch);
            ctx.restore();
        } else {
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
        }

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
     * Renders the cinematic landing page atmospheric effects overlay.
     * Integrates directly over the full-viewport Earth photograph without
     * any artificial solid shapes or horizontal dividing arcs.
     */
    renderLandingPlanet(canvasId) {
        const c = document.getElementById(canvasId);
        if (!c) return;
        const ctx = c.getContext('2d');
        const w = c.width = c.clientWidth || window.innerWidth;
        const h = c.height = c.clientHeight || window.innerHeight;

        ctx.clearRect(0, 0, w, h);

        const t = Date.now() * 0.001;
        // Subtle optical atmospheric shimmer that breathes with the solar horizon
        const pulse = 0.12 + 0.04 * Math.sin(t * 0.8);
        const atmoGlow = ctx.createRadialGradient(
            w * 0.5 + this.mouseX * 30, h * 0.82 + this.mouseY * 20, w * 0.2,
            w * 0.5 + this.mouseX * 30, h * 0.82 + this.mouseY * 20, w * 0.85
        );
        atmoGlow.addColorStop(0, `rgba(139, 199, 213, ${pulse})`);
        atmoGlow.addColorStop(0.35, `rgba(74, 110, 133, ${pulse * 0.6})`);
        atmoGlow.addColorStop(0.7, 'rgba(5, 7, 11, 0)');
        ctx.fillStyle = atmoGlow;
        ctx.fillRect(0, 0, w, h);

        // Distant twinkling stars across the upper deep-space quadrant
        for (let i = 0; i < 28; i++) {
            const sx = (i * 187.3 + 45) % w;
            const sy = (i * 73.1 + 25) % (h * 0.45);
            const alpha = 0.2 + 0.35 * Math.sin(t * 1.5 + i);
            ctx.fillStyle = `rgba(234, 244, 247, ${Math.max(0, alpha)})`;
            ctx.beginPath();
            ctx.arc(sx, sy, i % 3 === 0 ? 1.4 : 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
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

