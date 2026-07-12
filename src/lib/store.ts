import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ExperienceMode = "guided" | "open" | null;

/**
 * Narrative depth for the two ways through the atlas. Guided visitors reveal
 * the telling parva by parva; open visitors can move through the whole epic.
 * The server still starts at mode null/parva 0 so first paint is fail-closed.
 */
export interface EpicState {
  entered: boolean;
  soundOn: boolean;
  experienceMode: ExperienceMode;
  knownParva: number; // 0..18
  setEntered: (v: boolean) => void;
  setSoundOn: (v: boolean) => void;
  setExperienceMode: (mode: Exclude<ExperienceMode, null>) => void;
  setKnownParva: (v: number) => void;
}

/** The effective depth used by every guard, index, and search surface. */
export function selectAccessibleParva(state: EpicState): number {
  return state.experienceMode === "open" ? 18 : state.knownParva;
}

export const useEpicStore = create<EpicState>()(
  persist(
    (set) => ({
      entered: false,
      soundOn: true,
      experienceMode: null,
      knownParva: 0,
      setEntered: (entered) => set({ entered }),
      setSoundOn: (soundOn) => set({ soundOn }),
      setExperienceMode: (experienceMode) =>
        set((state) => ({
          experienceMode,
          knownParva:
            experienceMode === "open" ? 18 : Math.max(1, Math.min(18, state.knownParva)),
        })),
      setKnownParva: (knownParva) =>
        set((state) => ({
          knownParva:
            state.experienceMode === "open" ? 18 : Math.max(0, Math.min(18, knownParva)),
        })),
    }),
    {
      name: "mahabharat-progress",
      version: 2,
      migrate: (persisted, version) => {
        const old = (persisted ?? {}) as Partial<EpicState>;
        if (version < 2 && old.experienceMode == null) {
          return {
            ...old,
            experienceMode: old.knownParva === 18 ? "open" : "guided",
          } as EpicState;
        }
        return old as EpicState;
      },
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<EpicState>;
        const mode =
          saved.experienceMode === "guided" || saved.experienceMode === "open"
            ? saved.experienceMode
            : null;
        const known = Number.isFinite(saved.knownParva)
          ? Math.max(0, Math.min(18, Number(saved.knownParva)))
          : 0;
        return {
          ...current,
          ...saved,
          soundOn: typeof saved.soundOn === "boolean" ? saved.soundOn : current.soundOn,
          experienceMode: mode,
          knownParva: mode === "open" ? 18 : mode === "guided" ? known : 0,
        };
      },
      partialize: (s) => ({
        soundOn: s.soundOn,
        experienceMode: s.experienceMode,
        knownParva: s.knownParva,
      }),
      // rehydrate manually after mount (StoreHydrator) so server HTML and
      // client first paint always agree - no hydration mismatch or depth leak
      skipHydration: true,
    }
  )
);
