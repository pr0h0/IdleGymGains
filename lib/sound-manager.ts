export class SoundManager {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = true;
  private initialized: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.context = new AudioContextClass();
          this.masterGain = this.context.createGain();
          this.masterGain.connect(this.context.destination);
          this.masterGain.gain.value = 0.3; // Default volume
        }
      } catch (e) {
        console.error("Web Audio API not supported", e);
      }
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public async init() {
    if (this.initialized || !this.context) return;

    // Resume context if suspended (browser autoplay policy)
    if (this.context.state === "suspended") {
      await this.context.resume();
    }

    this.initialized = true;
  }

  private playTone(
    freq: number,
    type: OscillatorType,
    duration: number,
    release: number = 0.1,
    volume: number = 1,
  ) {
    if (!this.enabled || !this.context || !this.masterGain) return;

    // Auto-init on first user interaction if needed
    if (this.context.state === "suspended") {
      this.context.resume().catch(() => {});
    }

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.context.currentTime);

    gain.gain.setValueAtTime(volume * 0.5, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      this.context.currentTime + duration + release,
    );

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.context.currentTime + duration + release);
  }

  public playLift() {
    // Heavy thud
    this.playTone(100, "triangle", 0.05, 0.1, 0.8);
    // Low sine sub
    this.playTone(50, "sine", 0.1, 0.1, 0.8);
  }

  public playCrit() {
    // Sharp high ping
    this.playTone(800, "square", 0.05, 0.1, 0.4);
    this.playTone(1200, "sine", 0.1, 0.2, 0.4);
  }

  public playBuy() {
    // Coin sound (two quick high tones)
    this.playTone(1200, "sine", 0.05, 0.1, 0.3);
    setTimeout(() => {
      if (!this.enabled || !this.context || !this.masterGain) return;
      this.playTone(1600, "sine", 0.1, 0.2, 0.3);
    }, 50);
  }

  public playMilestone() {
    // Major chord arpeggio
    // const now = this.context?.currentTime || 0;
    const notes = [440, 554, 659, 880]; // A Major

    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, "triangle", 0.1, 0.3, 0.4);
      }, i * 80);
    });
  }

  public playLevelUp() {
    // Rising slide
    if (!this.enabled || !this.context || !this.masterGain) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.frequency.setValueAtTime(200, this.context.currentTime);
    osc.frequency.linearRampToValueAtTime(600, this.context.currentTime + 0.3);

    gain.gain.setValueAtTime(0.3, this.context.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.context.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.context.currentTime + 0.3);
  }

  public playError() {
    this.playTone(150, "sawtooth", 0.1, 0.1, 0.5);
  }
}

export const soundManager = new SoundManager();
