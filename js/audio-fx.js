/**
 * BEYOND THE ORBIT - Space Mission Design Game
 * Audio Effects Engine (Web Audio API + Audio File Fallback)
 * Authentic aerospace audio with mute controls and browser autoplay compliance.
 */
class AudioFX {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.isMuted = false;
        this.volume = 0.7;
        this.ambientToneNodes = [];
        this.ambientAudio = null;
        this.thrustOsc = null;
        this.thrustGain = null;
        this.thrustFilter = null;
        this.hasUserInteracted = false;
        this.currentAmbienceMode = null; // 'landing', 'flight', null
        this.lastHoverTime = 0;
        this._audioFiles = {};

        this._setupAutoplayHandler();
        this._preloadAudioFiles();
    }

    _setupAutoplayHandler() {
        const unlock = () => {
            if (this.hasUserInteracted) return;
            this.hasUserInteracted = true;
            this.ensureContext();
            if (this.currentAmbienceMode) {
                this._playAmbienceLoop();
            }
            window.removeEventListener('pointerdown', unlock);
            window.removeEventListener('keydown', unlock);
            window.removeEventListener('click', unlock);
        };
        window.addEventListener('pointerdown', unlock, { once: false });
        window.addEventListener('keydown', unlock, { once: false });
        window.addEventListener('click', unlock, { once: false });
    }

    _preloadAudioFiles() {
        if (typeof Audio === 'undefined') return;
        const soundMap = {
            ambience: 'assets/audio/spacecraft_ambience.wav',
            startup: 'assets/audio/startup.wav',
            click: 'assets/audio/click.wav',
            launch: 'assets/audio/launch.wav',
            flight: 'assets/audio/flight.wav',
            alarm: 'assets/audio/alarm.wav',
            scan: 'assets/audio/scan.wav',
            downlink: 'assets/audio/downlink.wav',
            success: 'assets/audio/success.wav',
            failure: 'assets/audio/failure.wav'
        };

        for (const [key, src] of Object.entries(soundMap)) {
            try {
                const aud = new Audio(src);
                aud.preload = 'auto';
                this._audioFiles[key] = aud;
            } catch (err) {
                // Ignore missing file errors; procedural synthesis will be used
            }
        }
    }

    init() {
        if (this.ctx) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            this.ctx = new AudioCtx();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0001 : this.volume, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
        } catch (e) {
            console.warn('AudioContext initialization deferred:', e);
        }
    }

    ensureContext() {
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    }

    setMute(mute) {
        this.isMuted = !!mute;
        if (this.masterGain && this.ctx) {
            const now = this.ctx.currentTime;
            this.masterGain.gain.cancelScheduledValues(now);
            this.masterGain.gain.setTargetAtTime(this.isMuted ? 0.0001 : this.volume, now, 0.05);
        }
        if (this.ambientAudio) {
            this.ambientAudio.muted = this.isMuted;
        }
        return this.isMuted;
    }

    toggleMute() {
        return this.setMute(!this.isMuted);
    }

    _playFile(key, volScale = 1.0) {
        if (this.isMuted) return false;
        const file = this._audioFiles[key];
        if (file) {
            try {
                file.currentTime = 0;
                file.volume = Math.max(0, Math.min(1.0, this.volume * volScale));
                const p = file.play();
                if (p && typeof p.catch === 'function') {
                    p.catch(() => {});
                }
                return true;
            } catch (e) {
                return false;
            }
        }
        return false;
    }

    // -------------------------------------------------------------
    // AMBIENCE SYSTEMS
    // -------------------------------------------------------------
    startLandingAmbience() {
        this.currentAmbienceMode = 'landing';
        if (this.hasUserInteracted) {
            this._playAmbienceLoop();
        }
    }

    startFlightAmbience() {
        this.currentAmbienceMode = 'flight';
        if (this.hasUserInteracted) {
            this._playAmbienceLoop();
        }
    }

    _playAmbienceLoop() {
        this.ensureContext();
        if (!this.ctx || !this.masterGain) return;
        this.stopAmbience();

        // 1. Try audio file loop if available
        if (this._audioFiles.ambience && !this.ambientAudio) {
            try {
                this.ambientAudio = this._audioFiles.ambience;
                this.ambientAudio.loop = true;
                this.ambientAudio.volume = this.isMuted ? 0 : this.volume * 0.35;
                const p = this.ambientAudio.play();
                if (p && typeof p.catch === 'function') p.catch(() => {});
            } catch (e) {}
        }

        // 2. Procedural space habitat / flight drone
        const now = this.ctx.currentTime;
        const drone = this.ctx.createOscillator();
        const droneGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        drone.type = 'sawtooth';
        drone.frequency.setValueAtTime(this.currentAmbienceMode === 'flight' ? 56 : 48, now);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(this.currentAmbienceMode === 'flight' ? 140 : 110, now);
        droneGain.gain.setValueAtTime(0.015, now);

        drone.connect(filter);
        filter.connect(droneGain);
        droneGain.connect(this.masterGain);
        drone.start(now);

        // Sub harmonic pulse
        const subPulse = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subPulse.type = 'sine';
        subPulse.frequency.setValueAtTime(0.18, now);
        subGain.gain.setValueAtTime(0.008, now);
        subPulse.connect(subGain);
        subGain.connect(this.masterGain);
        subPulse.start(now);

        this.ambientToneNodes = [drone, droneGain, filter, subPulse, subGain];
    }

    stopAmbience() {
        if (this.ambientAudio) {
            try {
                this.ambientAudio.pause();
                this.ambientAudio.currentTime = 0;
            } catch (e) {}
            this.ambientAudio = null;
        }
        if (this.ambientToneNodes && this.ambientToneNodes.length) {
            this.ambientToneNodes.forEach(node => {
                try {
                    if (node.stop) node.stop();
                    if (node.disconnect) node.disconnect();
                } catch (e) {}
            });
            this.ambientToneNodes = [];
        }
    }

    // -------------------------------------------------------------
    // INTERACTION SOUND EFFECTS
    // -------------------------------------------------------------
    playHover() {
        const now = Date.now();
        if (now - this.lastHoverTime < 120) return;
        this.lastHoverTime = now;
        if (this.isMuted) return;
        this.ensureContext();
        if (!this.ctx || !this.masterGain) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(680, t);
        osc.frequency.exponentialRampToValueAtTime(840, t + 0.04);
        gain.gain.setValueAtTime(0.02 * this.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.045);
    }

    playClick() {
        this.ensureContext();
        if (this._playFile('click', 0.6)) return;
        if (this.isMuted || !this.ctx || !this.masterGain) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(780, t);
        osc.frequency.exponentialRampToValueAtTime(1100, t + 0.04);
        gain.gain.setValueAtTime(0.06 * this.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.045);
    }

    playSelect() {
        this.ensureContext();
        if (this.isMuted || !this.ctx || !this.masterGain) return;

        const t = this.ctx.currentTime;
        // Two-tone rising harmonic
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(480, t);
        osc1.frequency.exponentialRampToValueAtTime(720, t + 0.08);
        gain1.gain.setValueAtTime(0.08 * this.volume, t);
        gain1.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
        osc1.connect(gain1);
        gain1.connect(this.masterGain);
        osc1.start(t);
        osc1.stop(t + 0.095);

        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(960, t + 0.05);
        osc2.frequency.exponentialRampToValueAtTime(1200, t + 0.12);
        gain2.gain.setValueAtTime(0.05 * this.volume, t + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
        osc2.connect(gain2);
        gain2.connect(this.masterGain);
        osc2.start(t + 0.05);
        osc2.stop(t + 0.135);
    }

    playConfirmDestination() {
        this.ensureContext();
        if (this._playFile('startup', 0.75)) return;
        if (this.isMuted || !this.ctx || !this.masterGain) return;

        const t = this.ctx.currentTime;
        // Resonant chord confirmation
        [330, 495, 660].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t + idx * 0.04);
            gain.gain.setValueAtTime(0.06 * this.volume, t + idx * 0.04);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.04 + 0.35);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(t + idx * 0.04);
            osc.stop(t + idx * 0.04 + 0.36);
        });
    }

    playCraftSelect() {
        this.ensureContext();
        if (this.isMuted || !this.ctx || !this.masterGain) return;

        const t = this.ctx.currentTime;
        // Mechanical servo / pneumatic clamp sound
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.exponentialRampToValueAtTime(320, t + 0.06);
        osc.frequency.exponentialRampToValueAtTime(120, t + 0.12);
        gain.gain.setValueAtTime(0.07 * this.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.135);
    }

    playSliderTick() {
        this.ensureContext();
        if (this.isMuted || !this.ctx || !this.masterGain) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(420, t);
        gain.gain.setValueAtTime(0.02 * this.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.04);
    }

    // -------------------------------------------------------------
    // LAUNCH & FLIGHT PROPULSION
    // -------------------------------------------------------------
    playCountdownTick() {
        this.ensureContext();
        if (this.isMuted || !this.ctx || !this.masterGain) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, t);
        gain.gain.setValueAtTime(0.12 * this.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.085);
    }

    playIgnition() {
        this.ensureContext();
        if (this._playFile('launch', 0.95)) return;
        if (this.isMuted || !this.ctx || !this.masterGain) return;

        const t = this.ctx.currentTime;
        // Deep synthesized rocket roar
        const bufferSize = this.ctx.sampleRate * 2.5;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(100, t);
        filter.frequency.exponentialRampToValueAtTime(650, t + 1.2);
        filter.frequency.exponentialRampToValueAtTime(80, t + 2.5);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, t);
        gain.gain.linearRampToValueAtTime(0.22 * this.volume, t + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start(t);
        noise.stop(t + 2.5);
    }

    playThrust(engaged) {
        this.ensureContext();
        if (!this.ctx || !this.masterGain) return;

        const t = this.ctx.currentTime;
        if (engaged && !this.thrustOsc) {
            this.thrustOsc = this.ctx.createOscillator();
            this.thrustGain = this.ctx.createGain();
            this.thrustFilter = this.ctx.createBiquadFilter();

            this.thrustOsc.type = 'sawtooth';
            this.thrustOsc.frequency.setValueAtTime(68, t);
            this.thrustFilter.type = 'lowpass';
            this.thrustFilter.frequency.setValueAtTime(160, t);

            this.thrustGain.gain.setValueAtTime(0.001, t);
            this.thrustGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.08 * this.volume, t, 0.08);

            this.thrustOsc.connect(this.thrustFilter);
            this.thrustFilter.connect(this.thrustGain);
            this.thrustGain.connect(this.masterGain);
            this.thrustOsc.start(t);
        } else if (!engaged && this.thrustOsc) {
            try {
                this.thrustGain.gain.setTargetAtTime(0.0001, t, 0.08);
                const oldOsc = this.thrustOsc;
                setTimeout(() => {
                    try { oldOsc.stop(); oldOsc.disconnect(); } catch (e) {}
                }, 100);
            } catch (e) {}
            this.thrustOsc = null;
            this.thrustGain = null;
            this.thrustFilter = null;
        }
    }

    // -------------------------------------------------------------
    // OPERATIONAL NOTIFICATIONS & HAZARDS
    // -------------------------------------------------------------
    playWarning() {
        this.ensureContext();
        if (this._playFile('alarm', 0.85)) return;
        if (this.isMuted || !this.ctx || !this.masterGain) return;

        const t = this.ctx.currentTime;
        // Master caution klaxon (alternating dual burst)
        [0, 0.15].forEach(delay => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(440, t + delay);
            osc.frequency.setValueAtTime(320, t + delay + 0.06);
            gain.gain.setValueAtTime(0.12 * this.volume, t + delay);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.12);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(t + delay);
            osc.stop(t + delay + 0.125);
        });
    }

    playCollision() {
        this.ensureContext();
        if (this.isMuted || !this.ctx || !this.masterGain) return;

        const t = this.ctx.currentTime;
        // Impact thud
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.22);
        gain.gain.setValueAtTime(0.18 * this.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.225);

        this.playWarning();
    }

    playScan() {
        this.ensureContext();
        if (this._playFile('scan', 0.9)) return;
        if (this.isMuted || !this.ctx || !this.masterGain) return;

        const t = this.ctx.currentTime;
        // High-frequency phased chirps
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, t);
        osc.frequency.exponentialRampToValueAtTime(2800, t + 0.18);
        gain.gain.setValueAtTime(0.09 * this.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.19);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.20);
    }

    playEventAlert() {
        this.ensureContext();
        if (this._playFile('alarm', 0.7)) return;
        if (this.isMuted || !this.ctx || !this.masterGain) return;

        const t = this.ctx.currentTime;
        // Priority incoming transmission chime (tri-tone)
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t + idx * 0.08);
            gain.gain.setValueAtTime(0.08 * this.volume, t + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.08 + 0.25);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(t + idx * 0.08);
            osc.stop(t + idx * 0.08 + 0.26);
        });
    }

    playSuccess() {
        this.ensureContext();
        if (this._playFile('success', 0.95)) return;
        if (this.isMuted || !this.ctx || !this.masterGain) return;

        const t = this.ctx.currentTime;
        // Uplifting harmonic major resolution
        const freqs = [523.25, 659.25, 783.99, 1046.50];
        freqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t + idx * 0.09);
            gain.gain.setValueAtTime(0.09 * this.volume, t + idx * 0.09);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.09 + 0.65);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(t + idx * 0.09);
            osc.stop(t + idx * 0.09 + 0.66);
        });
    }

    playFailure() {
        this.ensureContext();
        if (this._playFile('failure', 0.95)) return;
        if (this.isMuted || !this.ctx || !this.masterGain) return;

        const t = this.ctx.currentTime;
        // Somber descending alert
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(65, t + 0.85);
        gain.gain.setValueAtTime(0.16 * this.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.86);
    }
}

window.AudioFX = new AudioFX();
