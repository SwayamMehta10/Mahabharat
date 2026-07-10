import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Spoiler progress mirrors dark.netflix.io's season/episode gate:
 * the visitor declares how far into the story they are, and the site
 * only reveals up to that point. 0 = knows nothing, 18 = knows all parvas.
 *
 * knownParva defaults to 0 (total silence) so SSR and first paint can never
 * leak a spoiler; the persisted value arrives via StoreHydrator after mount.
 */
interface EpicState {
  entered: boolean;
  soundOn: boolean;
  knownParva: number; // 0..18
  setEntered: (v: boolean) => void;
  setSoundOn: (v: boolean) => void;
  setKnownParva: (v: number) => void;
}

export const useEpicStore = create<EpicState>()(
  persist(
    (set) => ({
      entered: false,
      soundOn: true,
      knownParva: 0,
      setEntered: (entered) => set({ entered }),
      setSoundOn: (soundOn) => set({ soundOn }),
      setKnownParva: (knownParva) => set({ knownParva }),
    }),
    {
      name: "mahabharat-progress",
      partialize: (s) => ({ soundOn: s.soundOn, knownParva: s.knownParva }),
      // rehydrate manually after mount (StoreHydrator) so server HTML and
      // client first paint always agree — no hydration mismatches, no
      // flash of spoilers
      skipHydration: true,
    }
  )
);
