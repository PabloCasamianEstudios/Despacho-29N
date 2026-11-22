import { rand } from './util';

interface Env {
  a?: number;
  g?: number;
  hold?: boolean;
}

interface NoiseOpts extends Env {
  type?: BiquadFilterType;
  f?: number;
  f2?: number;
  q?: number;
}

interface ToneOpts extends Env {
  type?: OscillatorType;
  f?: number;
  f2?: number;
  lp?: number;
}

export type SoundName =
  | 'stamp' | 'grab' | 'drop' | 'clunk' | 'slide' | 'whoosh' | 'bell'
  | 'buzz' | 'shred' | 'flip' | 'tick' | 'stick' | 'tear' | 'clink';

type AudioCtor = typeof AudioContext;

class Sound {
  private ctx: AudioContext | null = null;
  private out: GainNode | null = null;
  private nb: AudioBuffer | null = null;
  muted = false;

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const C: AudioCtor | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext;
    if (!C) return;
    const ctx = new C();
    this.ctx = ctx;
    this.out = ctx.createGain();
    this.out.gain.value = 0.85;
    const comp = ctx.createDynamicsCompressor();
    this.out.connect(comp);
    comp.connect(ctx.destination);
    const len = ctx.sampleRate * 2;
    this.nb = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.nb.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }

  play(name: SoundName) {
    if (!this.ctx || this.muted) return;
    this.sfx[name](this.ctx.currentTime + 0.01);
  }

  private env(g: GainNode, t0: number, dur: number, o: Env) {
    const a = o.a || 0.003;
    const peak = o.g || 0.3;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + a);
    if (o.hold) g.gain.setValueAtTime(peak, t0 + Math.max(a, dur - 0.12));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  }

  private noise(t0: number, dur: number, o: NoiseOpts = {}) {
    const c = this.ctx!;
    const s = c.createBufferSource();
    const f = c.createBiquadFilter();
    const g = c.createGain();
    s.buffer = this.nb;
    f.type = o.type || 'bandpass';
    f.frequency.setValueAtTime(o.f || 1000, t0);
    if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t0 + dur);
    f.Q.value = o.q ?? 1;
    this.env(g, t0, dur, o);
    s.connect(f);
    f.connect(g);
    g.connect(this.out!);
    s.start(t0, Math.random() * 1.5);
    s.stop(t0 + dur + 0.05);
  }

  private tone(t0: number, dur: number, o: ToneOpts = {}) {
    const c = this.ctx!;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f || 440, t0);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t0 + dur);
    let node: AudioNode = osc;
    if (o.lp) {
      const f = c.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = o.lp;
      osc.connect(f);
      node = f;
    }
    this.env(g, t0, dur, o);
    node.connect(g);
    g.connect(this.out!);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  private sfx: Record<SoundName, (t: number) => void> = {
    stamp: (t) => {
      this.tone(t, 0.17, { f: 150, f2: 42, g: 0.9 });
      this.noise(t, 0.09, { type: 'lowpass', f: 900, q: 0.7, g: 0.9 });
      this.noise(t, 0.025, { type: 'highpass', f: 2500, g: 0.25 });
      this.noise(t + 0.05, 0.06, { f: 420, q: 2, g: 0.14 });
    },
    grab: (t) => {
      this.noise(t, 0.07, { f: 2600, q: 0.7, g: 0.16 });
      this.noise(t + 0.03, 0.06, { f: 4200, q: 0.9, g: 0.08 });
    },
    drop: (t) => {
      this.noise(t, 0.12, { f: 1300, q: 0.6, g: 0.2 });
      this.tone(t, 0.07, { f: 110, f2: 70, g: 0.1 });
    },
    clunk: (t) => {
      this.tone(t, 0.1, { f: 220, f2: 90, g: 0.25 });
      this.noise(t, 0.05, { type: 'lowpass', f: 1200, g: 0.3 });
    },
    slide: (t) => {
      this.noise(t, 0.4, { f: 500, f2: 2600, q: 0.8, g: 0.26, a: 0.12 });
      this.tone(t + 0.36, 0.06, { f: 140, f2: 80, g: 0.08 });
    },
    whoosh: (t) => {
      this.noise(t, 0.32, { f: 2400, f2: 500, q: 0.8, g: 0.3, a: 0.05 });
      this.tone(t + 0.3, 0.09, { f: 170, f2: 80, g: 0.16 });
      this.noise(t + 0.3, 0.08, { f: 1500, q: 0.6, g: 0.12 });
    },
    bell: (t) => {
      this.noise(t, 0.02, { type: 'highpass', f: 5000, g: 0.18 });
      this.tone(t, 1.6, { f: 1568, g: 0.2 });
      this.tone(t, 1.4, { f: 1574, g: 0.1 });
      this.tone(t, 0.9, { f: 2510, g: 0.07 });
      this.tone(t, 0.5, { f: 4180, g: 0.04 });
    },
    buzz: (t) => {
      this.tone(t, 0.3, { type: 'square', f: 98, g: 0.09, a: 0.01, hold: true, lp: 900 });
      this.tone(t, 0.3, { type: 'square', f: 104, g: 0.08, a: 0.01, hold: true, lp: 900 });
    },
    shred: (t) => {
      const d = 1.35;
      this.tone(t, d, { type: 'sawtooth', f: 58, g: 0.16, a: 0.06, hold: true, lp: 650 });
      this.tone(t, d, { type: 'sawtooth', f: 87, g: 0.1, a: 0.06, hold: true, lp: 500 });
      this.noise(t, d, { f: 2200, q: 0.4, g: 0.05, a: 0.05, hold: true });
      for (let i = 0; i < 34; i++) {
        const tt = t + 0.12 + i * 0.033 + Math.random() * 0.02;
        this.noise(tt, rand(0.025, 0.06), { f: rand(1400, 3800), q: rand(0.8, 2), g: rand(0.1, 0.24) });
      }
      this.tone(t + d - 0.05, 0.12, { f: 90, f2: 50, g: 0.2 });
    },
    flip: (t) => {
      [0, 0.08, 0.17].forEach((o) => this.noise(t + o, 0.1, { f: 3600, f2: 1400, q: 0.6, g: 0.22 }));
    },
    tick: (t) => {
      this.noise(t, 0.015, { type: 'highpass', f: 3000, g: 0.12 });
      this.tone(t, 0.02, { f: 1900, g: 0.03 });
    },
    stick: (t) => {
      this.noise(t, 0.12, { f: 2400, f2: 900, q: 0.7, g: 0.22 });
      this.tone(t + 0.05, 0.12, { f: 880, f2: 1320, g: 0.05 });
    },
    tear: (t) => {
      for (let i = 0; i < 9; i++) this.noise(t + i * 0.028, 0.045, { f: rand(2600, 5200), q: 0.8, g: rand(0.12, 0.22) });
      this.noise(t, 0.3, { f: 1800, f2: 4000, q: 0.5, g: 0.08, a: 0.05 });
    },
    clink: (t) => {
      this.tone(t, 0.5, { f: 2350, g: 0.08 });
      this.tone(t, 0.35, { f: 3520, g: 0.05 });
      this.noise(t, 0.015, { type: 'highpass', f: 5000, g: 0.1 });
    },
  };
}

export const sound = new Sound();
