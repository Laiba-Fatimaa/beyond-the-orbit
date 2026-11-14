/**
 * BEYOND THE ORBIT — HIGH-FIDELITY CINEMATIC SPACE & PLANETARY ENGINE
 * ==================================================================
 * Team Orbitera | NASA Space Apps Challenge 2026
 * 
 * Renders rich, detailed planetary environments:
 * - High-resolution photorealistic canvas planets with terminator shadows & atmospheric limb scattering
 * - Jupiter giant backdrop with banded cloud belts and Great Red Spot for Europa
 * - Mars with Valles Marineris rift, Olympus Mons, and dust haze
 * - Moon with realistic basaltic maria, rayed impact craters, and South Pole PSR
 * - Dynamic spacecraft probe flight visualizer with solar reflections and thruster burns
 */

class SpaceEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.stars = [];
        this.rotAngle = 0;
        this.orbitProgress = 0; // 0.0 to 1.0 along mission timeline
        this.isWarping = false;
        this.warpVelocity = 0;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.generateStarfield();
        this.animate();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    generateStarfield() {
        this.stars = [];
        for (let i = 0; i < 350; i++) {
            this.stars.push({
                x: Math.random() * this.width - this.width / 2,
                y: Math.random() * this.height - this.height / 2,
                z: Math.random() * this.width,
                radius: Math.random() * 1.5 + 0.3,
                twinkle: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.03 + 0.01,
                spectral: this.getSpectralColor()
            });
        }
    }

    getSpectralColor() {
        const types = [
            'rgba(240, 244, 255, ',  // White
            'rgba(180, 215, 255, ',  // Blue-white
            'rgba(255, 235, 180, ',  // Warm solar
            'rgba(255, 170, 120, '   // Orange giant
        ];
        return types[Math.floor(Math.random() * types.length)];
    }

    setWarp(warp) {
        this.isWarping = warp;
    }

    animate() {
        this.ctx.fillStyle = '#030712';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Cosmic volumetric nebulae
        this.renderDeepSpaceNebulae();

        // Starfield
        this.renderStars();

        this.rotAngle += 0.0025;

        requestAnimationFrame(() => this.animate());
    }

    renderDeepSpaceNebulae() {
        // Deep indigo nebula
        const g1 = this.ctx.createRadialGradient(this.width * 0.85, this.height * 0.2, 50, this.width * 0.85, this.height * 0.2, this.width * 0.55);
        g1.addColorStop(0, 'rgba(25, 45, 95, 0.15)');
        g1.addColorStop(0.5, 'rgba(0, 240, 255, 0.03)');
        g1.addColorStop(1, 'rgba(3, 7, 18, 0)');
        this.ctx.fillStyle = g1;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Subtle amber gas cloud
        const g2 = this.ctx.createRadialGradient(this.width * 0.1, this.height * 0.8, 40, this.width * 0.1, this.height * 0.8, this.width * 0.45);
        g2.addColorStop(0, 'rgba(255, 120, 40, 0.06)');
        g2.addColorStop(1, 'rgba(3, 7, 18, 0)');
        this.ctx.fillStyle = g2;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    renderStars() {
        const targetVel = this.isWarping ? 36 : 0.5;
        this.warpVelocity += (targetVel - this.warpVelocity) * 0.06;

        const cx = this.width / 2;
        const cy = this.height / 2;

        for (let i = 0; i < this.stars.length; i++) {
            const s = this.stars[i];
            s.z -= this.warpVelocity;
            if (s.z <= 0) {
                s.z = this.width;
                s.x = Math.random() * this.width - this.width / 2;
                s.y = Math.random() * this.height - this.height / 2;
            }

            const k = 270 / s.z;
            const px = s.x * k + cx;
            const py = s.y * k + cy;

            if (px >= 0 && px <= this.width && py >= 0 && py <= this.height) {
                s.twinkle += s.speed;
                const alpha = (Math.min(1.0, (1 - s.z / this.width) * 1.3) * (0.65 + 0.35 * Math.sin(s.twinkle))).toFixed(2);

                if (this.warpVelocity > 6) {
                    const prevK = 270 / (s.z + this.warpVelocity * 2.4);
                    const prevX = s.x * prevK + cx;
                    const prevY = s.y * prevK + cy;

                    this.ctx.beginPath();
                    this.ctx.moveTo(prevX, prevY);
                    this.ctx.lineTo(px, py);
                    this.ctx.strokeStyle = `${s.spectral}${alpha})`;
                    this.ctx.lineWidth = s.radius * k * 0.9;
                    this.ctx.stroke();
                } else {
                    this.ctx.beginPath();
                    this.ctx.arc(px, py, Math.max(0.65, s.radius * k), 0, Math.PI * 2);
                    this.ctx.fillStyle = `${s.spectral}${alpha})`;
                    this.ctx.fill();
                }
            }
        }
    }

    /**
     * Renders an authentic, highly detailed planetary environment on any canvas element.
     */
    renderCinematicPlanet(canvasId, destination, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width = canvas.clientWidth;
        const h = canvas.height = canvas.clientHeight;

        ctx.fillStyle = '#040814';
        ctx.fillRect(0, 0, w, h);

        const cx = options.cx !== undefined ? options.cx : w * 0.5;
        const cy = options.cy !== undefined ? options.cy : h * 0.5;
        const radius = options.radius !== undefined ? options.radius : Math.min(w, h) * 0.38;

        ctx.save();
        ctx.translate(cx, cy);

        if (destination === "Moon") {
            this.drawMoonDetailed(ctx, radius);
        } else if (destination === "Mars") {
            this.drawMarsDetailed(ctx, radius);
        } else {
            this.drawEuropaWithJupiter(ctx, radius);
        }

        ctx.restore();
    }

    drawMoonDetailed(ctx, radius) {
        // Core lunar body sphere gradient
        const baseGrad = ctx.createRadialGradient(-radius * 0.38, -radius * 0.38, radius * 0.05, 0, 0, radius);
        baseGrad.addColorStop(0, '#E6ECF5');
        baseGrad.addColorStop(0.35, '#B4BDCB');
        baseGrad.addColorStop(0.7, '#6E7888');
        baseGrad.addColorStop(0.95, '#353D49');
        baseGrad.addColorStop(1, '#11151C');

        ctx.fillStyle = baseGrad;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        // Surface Maria & Basalt Basins
        ctx.save();
        ctx.clip();

        // Mare Imbrium (Sea of Rains)
        ctx.fillStyle = 'rgba(40, 48, 60, 0.55)';
        ctx.beginPath();
        ctx.ellipse(-radius * 0.22, -radius * 0.25, radius * 0.32, radius * 0.28, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Oceanus Procellarum
        ctx.beginPath();
        ctx.ellipse(-radius * 0.42, 0, radius * 0.35, radius * 0.45, -0.15, 0, Math.PI * 2);
        ctx.fill();

        // Mare Serenitatis & Tranquillitatis
        ctx.beginPath();
        ctx.ellipse(radius * 0.22, -radius * 0.18, radius * 0.24, radius * 0.2, 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(radius * 0.28, radius * 0.08, radius * 0.22, radius * 0.18, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Tycho Crater & Bright Ejecta Rays
        ctx.strokeStyle = 'rgba(240, 248, 255, 0.3)';
        ctx.lineWidth = 1;
        const tychoX = -radius * 0.08;
        const tychoY = radius * 0.52;

        for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
            ctx.beginPath();
            ctx.moveTo(tychoX, tychoY);
            ctx.lineTo(tychoX + Math.cos(a) * radius * 0.55, tychoY + Math.sin(a) * radius * 0.55);
            ctx.stroke();
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(tychoX, tychoY, radius * 0.035, 0, Math.PI * 2);
        ctx.fill();

        // South Pole Permanently Shadowed Region (Shackleton)
        ctx.fillStyle = '#06080E';
        ctx.beginPath();
        ctx.ellipse(0, radius * 0.92, radius * 0.28, radius * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Realistic Night Terminator Shadow (Half Moon curve)
        const shadowGrad = ctx.createRadialGradient(radius * 0.5, radius * 0.25, radius * 0.2, 0, 0, radius);
        shadowGrad.addColorStop(0, 'rgba(4, 7, 16, 0)');
        shadowGrad.addColorStop(0.7, 'rgba(4, 7, 16, 0.7)');
        shadowGrad.addColorStop(1, 'rgba(4, 7, 16, 0.98)');

        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        // Thin sunlight edge rim
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, radius, -Math.PI * 0.75, Math.PI * 0.2);
        ctx.stroke();
    }

    drawMarsDetailed(ctx, radius) {
        // Red planet base gradient
        const baseGrad = ctx.createRadialGradient(-radius * 0.38, -radius * 0.38, radius * 0.05, 0, 0, radius);
        baseGrad.addColorStop(0, '#FF7A4D');
        baseGrad.addColorStop(0.4, '#D64820');
        baseGrad.addColorStop(0.75, '#992B0E');
        baseGrad.addColorStop(1, '#2E0903');

        ctx.fillStyle = baseGrad;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.clip();

        // Syrtis Major Planum (Dark iron-magnesium basaltic shield)
        ctx.fillStyle = 'rgba(65, 20, 10, 0.65)';
        ctx.beginPath();
        ctx.moveTo(-radius * 0.1, -radius * 0.35);
        ctx.quadraticCurveTo(radius * 0.35, -radius * 0.1, radius * 0.2, radius * 0.28);
        ctx.quadraticCurveTo(-radius * 0.2, radius * 0.2, -radius * 0.1, -radius * 0.35);
        ctx.fill();

        // Valles Marineris (Vast canyon rift system: 4,000 km long)
        ctx.strokeStyle = '#240602';
        ctx.lineWidth = Math.max(2.5, radius * 0.045);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-radius * 0.5, radius * 0.05);
        ctx.quadraticCurveTo(-radius * 0.1, radius * 0.18, radius * 0.38, radius * 0.1);
        ctx.stroke();

        // Tributary canyon branches
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-radius * 0.3, radius * 0.08);
        ctx.lineTo(-radius * 0.35, radius * 0.22);
        ctx.moveTo(radius * 0.1, radius * 0.14);
        ctx.lineTo(radius * 0.15, radius * 0.26);
        ctx.stroke();

        // Olympus Mons Caldera & Tharsis volcanoes
        ctx.fillStyle = '#6E1F09';
        ctx.beginPath();
        ctx.arc(-radius * 0.58, -radius * 0.15, radius * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2E0903';
        ctx.beginPath();
        ctx.arc(-radius * 0.58, -radius * 0.15, radius * 0.04, 0, Math.PI * 2);
        ctx.fill();

        // North Polar Ice Cap (Perennial Water & Carbon Dioxide Ice)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(0, -radius * 0.88, radius * 0.36, radius * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Mars Atmospheric Limb Glow (Thin CO2 Rayleigh scattering)
        const atmoGrad = ctx.createRadialGradient(0, 0, radius * 0.96, 0, 0, radius * 1.08);
        atmoGrad.addColorStop(0, 'rgba(120, 190, 255, 0.45)');
        atmoGrad.addColorStop(0.5, 'rgba(120, 190, 255, 0.15)');
        atmoGrad.addColorStop(1, 'rgba(120, 190, 255, 0)');

        ctx.fillStyle = atmoGrad;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.08, 0, Math.PI * 2);
        ctx.fill();

        // Night terminator shadow
        const shadowGrad = ctx.createRadialGradient(radius * 0.55, radius * 0.3, radius * 0.25, 0, 0, radius);
        shadowGrad.addColorStop(0, 'rgba(4, 7, 16, 0)');
        shadowGrad.addColorStop(0.75, 'rgba(4, 7, 16, 0.7)');
        shadowGrad.addColorStop(1, 'rgba(4, 7, 16, 0.98)');

        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    drawEuropaWithJupiter(ctx, radius) {
        // In the background: Majestic Jupiter gas giant
        const jupRadius = radius * 1.6;
        const jupX = -radius * 1.35;
        const jupY = -radius * 0.3;

        ctx.save();
        const jupGrad = ctx.createRadialGradient(jupX - jupRadius * 0.3, jupY - jupRadius * 0.3, jupRadius * 0.1, jupX, jupY, jupRadius);
        jupGrad.addColorStop(0, '#E8C39E');
        jupGrad.addColorStop(0.4, '#C28854');
        jupGrad.addColorStop(0.8, '#854D27');
        jupGrad.addColorStop(1, '#3B1F0D');

        ctx.fillStyle = jupGrad;
        ctx.beginPath();
        ctx.arc(jupX, jupY, jupRadius, 0, Math.PI * 2);
        ctx.fill();

        // Jupiter atmospheric belts
        ctx.clip();
        ctx.fillStyle = 'rgba(95, 45, 18, 0.55)';
        for (let y = -jupRadius; y < jupRadius; y += jupRadius * 0.22) {
            ctx.fillRect(jupX - jupRadius, jupY + y, jupRadius * 2, jupRadius * 0.11);
        }

        // Great Red Spot
        ctx.fillStyle = '#9E381A';
        ctx.beginPath();
        ctx.ellipse(jupX + jupRadius * 0.35, jupY + jupRadius * 0.2, jupRadius * 0.18, jupRadius * 0.11, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Radiation belts hazard haze
        ctx.strokeStyle = 'rgba(255, 42, 85, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.arc(jupX, jupY, jupRadius * 1.25, -Math.PI * 0.4, Math.PI * 0.4);
        ctx.stroke();
        ctx.setLineDash([]);

        // Foreground: Europa icy moon
        const euroGrad = ctx.createRadialGradient(-radius * 0.35, -radius * 0.35, radius * 0.05, 0, 0, radius);
        euroGrad.addColorStop(0, '#FFFFFF');
        euroGrad.addColorStop(0.4, '#E2EAF4');
        euroGrad.addColorStop(0.75, '#A5B5C8');
        euroGrad.addColorStop(1, '#2F3C4C');

        ctx.fillStyle = euroGrad;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.clip();

        // Lineae: Fractured red-brown chaos ice cracks (Thrace & Conamara)
        ctx.strokeStyle = 'rgba(168, 68, 38, 0.75)';
        ctx.lineWidth = Math.max(1.5, radius * 0.022);
        ctx.lineCap = 'round';

        // Major arc cracks
        ctx.beginPath();
        ctx.moveTo(-radius * 0.7, -radius * 0.3);
        ctx.quadraticCurveTo(-radius * 0.1, -radius * 0.05, radius * 0.65, -radius * 0.4);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-radius * 0.6, radius * 0.2);
        ctx.quadraticCurveTo(0, radius * 0.05, radius * 0.55, radius * 0.4);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-radius * 0.2, -radius * 0.7);
        ctx.quadraticCurveTo(radius * 0.1, 0, radius * 0.15, radius * 0.7);
        ctx.stroke();

        // Conamara Chaos fractured rafted ice blocks
        ctx.fillStyle = 'rgba(168, 68, 38, 0.35)';
        ctx.beginPath();
        ctx.arc(radius * 0.25, radius * 0.12, radius * 0.22, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Active Cryovolcanic Plume Venting (Thrace Macula)
        const plumeX = radius * 0.75;
        const plumeY = -radius * 0.45;
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.9)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(plumeX, plumeY);
        ctx.quadraticCurveTo(plumeX + radius * 0.3, plumeY - radius * 0.25, plumeX + radius * 0.45, plumeY - radius * 0.5);
        ctx.stroke();

        const plumeHaze = ctx.createRadialGradient(plumeX + radius * 0.45, plumeY - radius * 0.5, 2, plumeX + radius * 0.45, plumeY - radius * 0.5, radius * 0.25);
        plumeHaze.addColorStop(0, 'rgba(0, 240, 255, 0.6)');
        plumeHaze.addColorStop(1, 'rgba(0, 240, 255, 0)');
        ctx.fillStyle = plumeHaze;
        ctx.beginPath();
        ctx.arc(plumeX + radius * 0.45, plumeY - radius * 0.5, radius * 0.25, 0, Math.PI * 2);
        ctx.fill();

        // Night terminator shadow
        const shadowGrad = ctx.createRadialGradient(radius * 0.5, radius * 0.25, radius * 0.2, 0, 0, radius);
        shadowGrad.addColorStop(0, 'rgba(4, 7, 16, 0)');
        shadowGrad.addColorStop(0.7, 'rgba(4, 7, 16, 0.75)');
        shadowGrad.addColorStop(1, 'rgba(4, 7, 16, 0.98)');

        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

window.SpaceEngine = SpaceEngine;

