import { reactiveSample, type Features, type Project } from '../core/model';

/** Integrated motion clock. Prefix integration makes a seek independent of playback history. */
export class MusicalDynamics {
  private signature = '';
  private features: Features | null = null;
  private phase = new Float64Array(0);
  private levels = new Float32Array(0);
  private enabled = false;
  private duration = 0;
  private readonly step = .1;
  configure(p: Project, features: Features | null) {
    const signature = JSON.stringify([p.duration, p.dynamicsMode, p.dynamicsAmount, p.dynamicsFloor, p.dynamicsCeiling, p.dynamicsWindow, p.audioGain, p.bassGain, p.rmsGain, p.highGain, p.audioGate]);
    if (signature === this.signature && features === this.features) return;
    this.signature = signature; this.features = features; this.duration = p.duration;
    this.enabled = p.dynamicsMode !== 'off' && p.dynamicsAmount > 0;
    if (!this.enabled) { this.phase = new Float64Array(0); this.levels = new Float32Array(0); return; }
    const count = Math.ceil(p.duration / this.step) + 1;
    this.phase = new Float64Array(count); this.levels = new Float32Array(count);
    const settings = { ...p, audioSmoothing: p.dynamicsMode === 'breathe' ? Math.max(2, p.dynamicsWindow) : p.dynamicsWindow };
    for (let i = 0; i < count; i++) {
      const a = reactiveSample(features, i * this.step, p.audioGain, settings);
      let energy = .55 * a.rms + .3 * a.bass + .15 * a.high;
      if (p.dynamicsMode === 'contrast') { energy = Math.max(0, Math.min(1, (energy - .2) / .6)); energy = energy * energy * (3 - 2 * energy); }
      this.levels[i] = 1 + (p.dynamicsFloor + energy * (p.dynamicsCeiling - p.dynamicsFloor) - 1) * p.dynamicsAmount;
      if (i) this.phase[i] = this.phase[i - 1] + (this.levels[i - 1] + this.levels[i]) * .5 * this.step;
    }
  }
  at(time: number) {
    if (!this.enabled) return { motionTime: time, strength: 1 };
    const t = Math.max(0, Math.min(time, this.duration)), i = Math.min(Math.floor(t / this.step), this.levels.length - 2), dt = t - i * this.step;
    const a = this.levels[i], b = this.levels[i + 1], strength = a + (b - a) * dt / this.step;
    return { motionTime: this.phase[i] + a * dt + (b - a) * dt * dt / (2 * this.step) + Math.max(0, time - this.duration) * strength, strength };
  }
}
