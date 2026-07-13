/**
 * The soundscape keeps a complete synth bed and optionally layers decoded
 * CC0 recordings through SampleBank when their manifest files are available.
 *
 *   void - a deep breathing drone on Sa (A1) and its fifth, with a whisper
 *          of wind. The night before everything.
 *   war  - the void drone darkened, plus sparse deep drum strikes
 *          (pitch-dropping sines - membrane physics in two lines).
 *   gita - a tanpura-like cycle: plucked Sa–Pa–Sa–Sa through a resonant
 *          bandpass, each pluck ringing into the next.
 *
 * Everything is gain-ramped; nothing clicks. The engine only exists after a
 * user gesture (autoplay policy), and the master gain follows the store's
 * soundOn flag.
 */
import { audioAssets } from "@/lib/kb";
import { SampleBank } from "@/lib/sample-bank";

export type SceneName = "void" | "war" | "gita" | "silence";

const SA = 55; // A1 - the tonic of the whole site
const PA = SA * 1.5;

interface Scene {
  gain: GainNode;
  stop: () => void;
}

class Soundscape {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private current: Scene | null = null;
  private currentName: SceneName = "silence";
  private enabled = true;
  private pendingScene: SceneName = "silence";
  private samples: SampleBank | null = null;

  /** Must be called from a user gesture. Safe to call repeatedly. */
  init(): void {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return;
    }
    const AC =
      typeof window !== "undefined"
        ? (window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext)
        : undefined;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.enabled ? 1 : 0;
    this.master.connect(this.ctx.destination);
    this.samples = new SampleBank(this.ctx, audioAssets);
    this.samples.preload();
    this.setScene(this.pendingScene);
    // debug/demo handle - lets devtools ask what the soundscape is doing
    (window as unknown as { __soundscape?: unknown }).__soundscape = this;
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    if (!this.ctx || !this.master) return;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(on ? 1 : 0, this.ctx.currentTime + 0.8);
  }

  setScene(name: SceneName): void {
    this.pendingScene = name;
    if (!this.ctx || !this.master) return; // will apply on init
    if (name === this.currentName) return;
    this.currentName = name;

    // fade out the old world
    if (this.current) {
      const old = this.current;
      old.gain.gain.cancelScheduledValues(this.ctx.currentTime);
      old.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2);
      setTimeout(() => old.stop(), 2400);
      this.current = null;
    }

    if (name === "silence") return;

    const scene =
      name === "war"
        ? this.buildWar()
        : name === "gita"
          ? this.buildGita()
          : this.buildVoid();
    // fade in the new
    scene.gain.gain.setValueAtTime(0, this.ctx.currentTime);
    scene.gain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + 3);
    this.current = scene;
  }

  // ----- scene builders -----

  private sceneGain(): GainNode {
    const g = this.ctx!.createGain();
    g.connect(this.master!);
    return g;
  }

  /** Two detuned oscillator pairs through a slowly breathing lowpass. */
  private drone(
    out: AudioNode,
    freqs: number[],
    level: number,
    cutoff: number
  ): () => void {
    const ctx = this.ctx!;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = cutoff;
    lp.Q.value = 0.7;

    const breath = ctx.createOscillator(); // LFO on the filter - the drone inhales
    breath.frequency.value = 0.045;
    const breathGain = ctx.createGain();
    breathGain.gain.value = cutoff * 0.4;
    breath.connect(breathGain).connect(lp.frequency);

    const g = ctx.createGain();
    g.gain.value = level;
    lp.connect(g).connect(out);

    const oscs: OscillatorNode[] = [breath];
    for (const f of freqs) {
      for (const detune of [-4, 3]) {
        const o = ctx.createOscillator();
        o.type = "sawtooth";
        o.frequency.value = f;
        o.detune.value = detune;
        const og = ctx.createGain();
        og.gain.value = 1 / (freqs.length * 2);
        o.connect(og).connect(lp);
        o.start();
        oscs.push(o);
      }
    }
    breath.start();
    return () => oscs.forEach((o) => o.stop());
  }

  /** Filtered noise - wind over the field. */
  private wind(out: AudioNode, level: number): () => void {
    const ctx = this.ctx!;
    const len = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 420;
    bp.Q.value = 0.5;

    const sway = ctx.createOscillator();
    sway.frequency.value = 0.07;
    const swayGain = ctx.createGain();
    swayGain.gain.value = 180;
    sway.connect(swayGain).connect(bp.frequency);

    const g = ctx.createGain();
    g.gain.value = level;
    src.connect(bp).connect(g).connect(out);
    src.start();
    sway.start();
    return () => {
      src.stop();
      sway.stop();
    };
  }

  private buildVoid(): Scene {
    const gain = this.sceneGain();
    const stopDrone = this.drone(gain, [SA, PA], 0.045, 240);
    const stopWind = this.wind(gain, 0.006);
    return {
      gain,
      stop: () => {
        stopDrone();
        stopWind();
        gain.disconnect();
      },
    };
  }

  /** A membrane strike: a sine that falls an octave while it dies. */
  private drumHit(out: AudioNode, when: number, freq: number, level: number): void {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(freq, when);
    o.frequency.exponentialRampToValueAtTime(freq * 0.45, when + 0.5);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(level, when + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 1.1);
    o.connect(g).connect(out);
    o.start(when);
    o.stop(when + 1.2);
  }

  private buildWar(): Scene {
    const gain = this.sceneGain();
    const stopDrone = this.drone(gain, [SA * 0.5, SA], 0.05, 170);
    const stopWind = this.wind(gain, 0.011);
    const stopConch = this.samples?.attach("conch", gain) ?? (() => undefined);

    // sparse, irregular war drums - distant, patient
    let alive = true;
    const schedule = () => {
      if (!alive || !this.ctx) return;
      const t = this.ctx.currentTime + 0.05;
      this.drumHit(gain, t, 82, 0.16);
      if (Math.random() < 0.4) this.drumHit(gain, t + 0.22, 66, 0.1);
      setTimeout(schedule, 2800 + Math.random() * 4200);
    };
    setTimeout(schedule, 1500);

    return {
      gain,
      stop: () => {
        alive = false;
        stopDrone();
        stopWind();
        stopConch();
        gain.disconnect();
      },
    };
  }

  /** One tanpura string: a pluck that rings through a resonant bandpass. */
  private pluck(out: AudioNode, when: number, freq: number): void {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = freq;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(freq * 6, when);
    bp.frequency.exponentialRampToValueAtTime(freq * 2, when + 2.5); // the jvari sweep
    bp.Q.value = 6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(0.055, when + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 3.2);
    o.connect(bp).connect(g).connect(out);
    o.start(when);
    o.stop(when + 3.4);
  }

  private buildGita(): Scene {
    const gain = this.sceneGain();
    const stopDrone = this.drone(gain, [SA], 0.03, 200);
    const stopTanpura = this.samples?.attach("tanpura", gain) ?? (() => undefined);

    // the eternal tanpura cycle: Pa · Sa · Sa · Sa(low)
    const cycle = [PA, SA * 2, SA * 2, SA];
    let alive = true;
    let step = 0;
    const strum = () => {
      if (!alive || !this.ctx) return;
      this.pluck(gain, this.ctx.currentTime + 0.05, cycle[step % 4]);
      step++;
      setTimeout(strum, 950);
    };
    setTimeout(strum, 800);

    return {
      gain,
      stop: () => {
        alive = false;
        stopDrone();
        stopTanpura();
        gain.disconnect();
      },
    };
  }
}

export const soundscape = new Soundscape();
