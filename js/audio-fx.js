/**
 * AUDIO FX CONTROLLER & SYNTHESIZER
 * =====================================
 * BEYOND THE ORBIT - Space Mission Design Game
 * Team Orbitera | NASA Space Apps Challenge 2026
 * 
 * Authentic aerospace sound design:
 * - Continuous spacecraft interior background ambience (engine hum, ventilation, avionics)
 * - Systems startup chime and capacitor charge
 * - Mechanical engineering switch clicks
 * - Launch countdown beeps and rocket ignition roar
 * - Navigation beacon signals
 * - Dual-tone master caution anomaly klaxon
 * - High-frequency reconnaissance scanning chirps
 * - Deep Space Network digital carrier downlink handshake
 * - Restrained, uplifting harmonic mission success resolution
 * - Low-pitched descending mission failure alert
 * - Full volume slider and mute controls
 */

class AudioFX {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.volume = 0.75;
        this.ambienceAudio = null;
        this.hasStartedAmbience = false;
        this._audioCache = {};
        this._initAudioFiles();
    }

    _initAudioFiles() {
        if (typeof Audio === 'undefined') return;

        const files = {
            ambience: 'assets/audio/spacecraft_ambience.wav',
            startup:  'assets/audio/startup.wav',
            click:    'assets/audio/click.wav',
            launch:   'assets/audio/launch.wav',
            flight:   'assets/audio/flight.wav',
            alarm:    'assets/audio/alarm.wav',
            scan:     'assets/audio/scan.wav',
            downlink: 'assets/audio/downlink.wav',
            success:  'assets/audio/success.wav',
            failure:  'assets/audio/failure.wav'
        };

        for (const [key, src] of Object.entries(files)) {
            try {
                const a = new Audio(src);
                a.preload = 'auto';
                this._audioCache[key] = a;
            } catch (e) {
                console.warn(`Audio preload error for ${key}:`, e);
            }
        }

        if (this._audioCache.ambience) {
            this.ambienceAudio = this._audioCache.ambience;
            this.ambienceAudio.loop = true;
            this.ambienceAudio.volume = this.isMuted ? 0 : this.volume * 0.40;
        }
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
    }

    ensureContext() {
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setVolume(val) {
        this.volume = Math.max(0, Math.min(1, parseFloat(val)));
        if (this.ambienceAudio) {
            this.ambienceAudio.volume = this.isMuted ? 0 : this.volume * 0.40;
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.ambienceAudio) {
            this.ambienceAudio.volume = this.isMuted ? 0 : this.volume * 0.40;
        }
        return this.isMuted;
    }

    startAmbience() {
        if (this.hasStartedAmbience) return;
        this.hasStartedAmbience = true;
        this.ensureContext();

        if (this.ambienceAudio) {
            this.ambienceAudio.volume = this.isMuted ? 0 : this.volume * 0.40;
            const playPromise = this.ambienceAudio.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.log("Ambience autoplay waiting for user interaction:", err);
                });
            }
        }
    }

    stopAmbience() {
        if (this.ambienceAudio) {
            this.ambienceAudio.pause();
            this.ambienceAudio.currentTime = 0;
            this.hasStartedAmbience = false;
        }
    }

    _playFile(key, volMultiplier = 1.0) {
        if (this.isMuted) return false;
        const audio = this._audioCache[key];
        if (audio) {
            try {
                audio.currentTime = 0;
                audio.volume = Math.min(1.0, this.volume * volMultiplier);
                const p = audio.play();
                if (p !== undefined) {
                    p.catch(() => {});
                }
                return true;
            } catch (e) {
                return false;
            }
        }
        return false;
    }

    playStartup() {
        this.ensureContext();
        if (this._playFile('startup', 0.8)) return;
        this.playSuccess();
    }

    playClick() {
        this.ensureContext();
        if (this._playFile('click', 0.6)) return;

        // Fallback synthetic click
        if (this.isMuted || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, this.ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.08 * this.volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    playAlert() {
        this.ensureContext();
        if (this._playFile('alarm', 0.9)) return;

        // Fallback synthetic alarm
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(330, now + 0.12);
        osc.frequency.setValueAtTime(440, now + 0.24);
        gain.gain.setValueAtTime(0.12 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(now + 0.36);
    }

    playLaunch() {
        this.ensureContext();
        if (this._playFile('launch', 1.0)) return;

        // Fallback synthetic launch
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 2.0;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(120, now);
        filter.frequency.exponentialRampToValueAtTime(650, now + 1.2);
        filter.frequency.exponentialRampToValueAtTime(80, now + 2.0);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.25 * this.volume, now + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);
        noise.stop(now + 2.0);
    }

    playFlight() {
        this.ensureContext();
        this._playFile('flight', 0.7);
    }

    playScan() {
        this.ensureContext();
        if (this._playFile('scan', 0.85)) return;

        // Fallback synthetic scan ping
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.exponentialRampToValueAtTime(3200, now + 0.35);
        gain.gain.setValueAtTime(0.12 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
    }

    playDownlink() {
        this.ensureContext();
        if (this._playFile('downlink', 0.85)) return;

        // Fallback synthetic downlink
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(2200, now);
        osc.frequency.setValueAtTime(2600, now + 0.15);
        osc.frequency.setValueAtTime(2200, now + 0.30);
        gain.gain.setValueAtTime(0.10 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.45);
    }

    playSuccess() {
        this.ensureContext();
        if (this._playFile('success', 0.95)) return;

        // Fallback synthetic chord
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const freqs = [523.25, 659.25, 783.99, 1046.50];
        freqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            gain.gain.setValueAtTime(0.08 * this.volume, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.5);
        });
    }

    playFailure() {
        this.ensureContext();
        if (this._playFile('failure', 0.95)) return;

        // Fallback synthetic failure
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(75, now + 0.8);
        gain.gain.setValueAtTime(0.18 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
    }
}

window.AudioFX = new AudioFX();
