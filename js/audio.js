/**
 * Web Audio API synthesizer for electrical clicks, switches, and cliff alert chimes.
 * Fully synthesized in-browser with zero external audio assets.
 */

class SoundEffects {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound(forceState) {
    this.enabled = forceState !== undefined ? forceState : !this.enabled;
    return this.enabled;
  }

  playClick() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.04);
      
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {
      // Audio autoplay policy catch
    }
  }

  playSwitch() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.setValueAtTime(440, now + 0.02);
      
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {
      // Audio catch
    }
  }

  playWarningChime() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      // Warning double chime
      [
        { freq: 440, time: now },
        { freq: 660, time: now + 0.12 }
      ].forEach(chime => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(chime.freq, chime.time);
        
        gain.gain.setValueAtTime(0.15, chime.time);
        gain.gain.exponentialRampToValueAtTime(0.001, chime.time + 0.25);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(chime.time);
        osc.stop(chime.time + 0.25);
      });
    } catch (e) {
      // Audio catch
    }
  }
}

export const audioFX = new SoundEffects();
