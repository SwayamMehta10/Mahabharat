/**
 * Sound engine. Real recorded layers (conch, tanpura, nagada) arrive in the
 * polish phase via Howler; until then the conch is synthesized with Web Audio
 * so the entry moment works with zero assets.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/**
 * A conch (shankha) is close to a pure sine with slow attack, a slight
 * upward pitch bend, and a breathy partial an octave up.
 */
export function playConch(durationSec = 4.5): void {
  const ac = getCtx();
  if (!ac) return;

  const now = ac.currentTime;
  const master = ac.createGain();
  master.gain.value = 0;
  master.connect(ac.destination);

  const lowpass = ac.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 900;
  lowpass.connect(master);

  const fundamental = ac.createOscillator();
  fundamental.type = "sine";
  fundamental.frequency.setValueAtTime(196, now); // G3
  fundamental.frequency.linearRampToValueAtTime(208, now + durationSec * 0.6);

  const partial = ac.createOscillator();
  partial.type = "sine";
  partial.frequency.setValueAtTime(392.8, now); // slightly detuned octave
  const partialGain = ac.createGain();
  partialGain.gain.value = 0.25;

  const shimmer = ac.createOscillator();
  shimmer.type = "triangle";
  shimmer.frequency.setValueAtTime(588, now);
  const shimmerGain = ac.createGain();
  shimmerGain.gain.value = 0.06;

  fundamental.connect(lowpass);
  partial.connect(partialGain).connect(lowpass);
  shimmer.connect(shimmerGain).connect(lowpass);

  // swell in, hold, long release - like a breath
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(0.35, now + 1.4);
  master.gain.setValueAtTime(0.35, now + durationSec * 0.55);
  master.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

  // subtle vibrato that grows over the note
  const vibrato = ac.createOscillator();
  vibrato.frequency.value = 5.2;
  const vibratoGain = ac.createGain();
  vibratoGain.gain.setValueAtTime(0, now);
  vibratoGain.gain.linearRampToValueAtTime(3.5, now + durationSec * 0.7);
  vibrato.connect(vibratoGain).connect(fundamental.frequency);

  for (const osc of [fundamental, partial, shimmer, vibrato]) {
    osc.start(now);
    osc.stop(now + durationSec + 0.1);
  }
}
