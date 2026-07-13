import type { AudioAsset } from "@/data/schema";

/** Decodes optional recorded layers on the soundscape's existing AudioContext. */
export class SampleBank {
  private cache = new Map<string, Promise<AudioBuffer | null>>();

  constructor(private readonly ctx: AudioContext, private readonly assets: AudioAsset[]) {}

  preload(): void {
    for (const asset of this.assets) void this.load(asset);
  }

  attach(kind: AudioAsset["kind"], out: AudioNode): () => void {
    const asset = this.assets.find((candidate) => candidate.kind === kind);
    let source: AudioBufferSourceNode | null = null;
    let cancelled = false;
    if (asset) {
      void this.load(asset).then((buffer) => {
        if (!buffer || cancelled) return;
        const gain = this.ctx.createGain();
        gain.gain.value = asset.gain;
        source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = asset.loop;
        source.connect(gain).connect(out);
        source.start();
      });
    }
    return () => {
      cancelled = true;
      try { source?.stop(); } catch { /* already stopped */ }
      source?.disconnect();
    };
  }

  private load(asset: AudioAsset): Promise<AudioBuffer | null> {
    const existing = this.cache.get(asset.id);
    if (existing) return existing;
    const request = fetch(`/audio/${asset.id}.mp3`)
      .then((response) => {
        if (!response.ok) throw new Error(`audio ${asset.id}: ${response.status}`);
        return response.arrayBuffer();
      })
      .then((bytes) => this.ctx.decodeAudioData(bytes))
      .catch(() => null);
    this.cache.set(asset.id, request);
    return request;
  }
}
