/**
 * SPACE CANVAS ENGINE — 60 FPS PARALLAX STARFIELD & ORBITALS
 * ============================================================
 * BEYOND THE ORBIT - Space Mission Design Game
 * Team Orbitera | NASA Space Apps Challenge 2026
 * 
 * Renders high-performance interactive space backgrounds:
 * - 3-layer parallax starfield with variable twinkling
 * - Dynamic nebula clouds and dust lanes
 * - Warp-speed relativistic streaking effect during launch
 * - Orbital trajectory lines with animated particle photons
 */

class SpaceCanvas {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.warpMode = false;
        this.warpSpeed = 0;
        this.numStars = 220;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.animationFrameId = null;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.createStars();
        this.animate();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    createStars() {
        this.stars = [];
        for (let i = 0; i < this.numStars; i++) {
            this.stars.push({
                x: Math.random() * this.width - this.width / 2,
                y: Math.random() * this.height - this.height / 2,
                z: Math.random() * this.width,
                baseRadius: Math.random() * 1.5 + 0.5,
                twinkleSpeed: Math.random() * 0.05 + 0.01,
                twinklePhase: Math.random() * Math.PI * 2,
                color: this.getRandomColor()
            });
        }
    }

    getRandomColor() {
        const colors = [
            'rgba(244, 247, 255, ',  // Crisp white
            'rgba(67, 217, 255, ',   // Cyan accent
            'rgba(61, 123, 255, ',   // Deep blue
            'rgba(255, 181, 71, '    // Warm amber star
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    setWarp(enabled) {
        this.warpMode = enabled;
    }

    animate() {
        this.ctx.fillStyle = '#060B18';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Render subtle cosmic nebula gradients
        this.renderNebula();

        // Target speed
        const targetSpeed = this.warpMode ? 28 : 0.8;
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

            const k = 250 / s.z;
            const px = s.x * k + cx;
            const py = s.y * k + cy;

            if (px >= 0 && px <= this.width && py >= 0 && py <= this.height) {
                const depthAlpha = Math.min(1.0, (1 - s.z / this.width) * 1.2);
                s.twinklePhase += s.twinkleSpeed;
                const twinkleAlpha = 0.6 + 0.4 * Math.sin(s.twinklePhase);
                const finalAlpha = (depthAlpha * twinkleAlpha).toFixed(2);

                if (this.warpSpeed > 5) {
                    // Warp streaks
                    const prevK = 250 / (s.z + this.warpSpeed * 2.5);
                    const prevX = s.x * prevK + cx;
                    const prevY = s.y * prevK + cy;

                    this.ctx.beginPath();
                    this.ctx.moveTo(prevX, prevY);
                    this.ctx.lineTo(px, py);
                    this.ctx.strokeStyle = `${s.color}${finalAlpha})`;
                    this.ctx.lineWidth = s.baseRadius * k * 0.8;
                    this.ctx.stroke();
                } else {
                    // Normal pinpoint stars
                    const size = Math.max(0.6, s.baseRadius * k);
                    this.ctx.beginPath();
                    this.ctx.arc(px, py, size, 0, Math.PI * 2);
                    this.ctx.fillStyle = `${s.color}${finalAlpha})`;
                    this.ctx.fill();
                }
            }
        }

        this.animationFrameId = requestAnimationFrame(() => this.animate());
    }

    renderNebula() {
        const grad = this.ctx.createRadialGradient(
            this.width * 0.75, this.height * 0.3, 50,
            this.width * 0.75, this.height * 0.3, this.width * 0.6
        );
        grad.addColorStop(0, 'rgba(61, 123, 255, 0.07)');
        grad.addColorStop(0.5, 'rgba(67, 217, 255, 0.03)');
        grad.addColorStop(1, 'rgba(6, 11, 24, 0)');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.width, this.height);

        const grad2 = this.ctx.createRadialGradient(
            this.width * 0.2, this.height * 0.8, 40,
            this.width * 0.2, this.height * 0.8, this.width * 0.5
        );
        grad2.addColorStop(0, 'rgba(255, 181, 71, 0.04)');
        grad2.addColorStop(1, 'rgba(6, 11, 24, 0)');
        this.ctx.fillStyle = grad2;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
}

window.SpaceCanvas = SpaceCanvas;

