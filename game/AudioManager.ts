import { Settings } from './Settings';

class AudioManager {
  private ctx: AudioContext | null = null;
  private musicGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private musicPlaying = false;
  private musicTimeout: ReturnType<typeof setTimeout> | null = null;

  init() {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.musicGainNode = this.ctx.createGain();
    this.sfxGainNode = this.ctx.createGain();
    this.musicGainNode.connect(this.ctx.destination);
    this.sfxGainNode.connect(this.ctx.destination);
    this.setMusicVolume(Settings.getInstance().musicVolume);
    this.setSfxVolume(Settings.getInstance().sfxVolume);
  }

  private playBeep(freq: number, duration: number, gain: GainNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.connect(g);
    g.connect(gain);
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.3, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playCandyPickup() {
    [523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => this.playBeep(f, 0.2, this.sfxGainNode!), i * 80)
    );
  }

  playHit() { this.playBeep(120, 0.3, this.sfxGainNode!); }

  playDeath() {
    if (!this.ctx || !this.sfxGainNode) return;
    const now = this.ctx.currentTime;
    // Sad trumpet "wah wah wah waaah" — descending sawtooth notes
    const notes = [
      { freq: 392, start: 0,    dur: 0.22 },  // G4
      { freq: 330, start: 0.25, dur: 0.22 },  // E4
      { freq: 261, start: 0.50, dur: 0.22 },  // C4
      { freq: 220, start: 0.75, dur: 0.90 },  // A3 → slides down
    ];
    for (const note of notes) {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.connect(g);
      g.connect(this.sfxGainNode);
      osc.frequency.setValueAtTime(note.freq, now + note.start);
      if (note.start === 0.75) {
        // Final note slides way down for the "waaah" droop
        osc.frequency.linearRampToValueAtTime(80, now + note.start + note.dur);
      }
      g.gain.setValueAtTime(0, now + note.start);
      g.gain.linearRampToValueAtTime(0.38, now + note.start + 0.04);
      g.gain.setValueAtTime(0.32, now + note.start + note.dur * 0.6);
      g.gain.exponentialRampToValueAtTime(0.001, now + note.start + note.dur);
      osc.start(now + note.start);
      osc.stop(now + note.start + note.dur);
    }
  }
  playBossAttack() { this.playBeep(80, 0.4, this.sfxGainNode!); }

  playVictory() {
    [523, 659, 784, 880, 1047].forEach((f, i) =>
      setTimeout(() => this.playBeep(f, 0.3, this.sfxGainNode!), i * 120)
    );
  }

  playButton() { this.playBeep(440, 0.1, this.sfxGainNode!); }

  setMusicVolume(v: number) {
    if (this.musicGainNode) this.musicGainNode.gain.value = v;
  }

  setSfxVolume(v: number) {
    if (this.sfxGainNode) this.sfxGainNode.gain.value = v;
  }

  startMusic() {
    if (!this.ctx || this.musicPlaying) return;
    this.musicPlaying = true;
    this.scheduleMusic();
  }

  private scheduleMusic() {
    if (!this.musicPlaying || !this.ctx) return;
    const notes = [261, 330, 392, 330, 261, 392, 523, 392];
    notes.forEach((f, i) =>
      setTimeout(() => { if (this.musicPlaying) this.playBeep(f, 0.35, this.musicGainNode!); }, i * 350)
    );
    this.musicTimeout = setTimeout(() => this.scheduleMusic(), notes.length * 350);
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimeout) clearTimeout(this.musicTimeout);
  }
}

export const audioManager = new AudioManager();
