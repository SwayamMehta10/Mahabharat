"use client";

import { selectAccessibleParva, useEpicStore } from "@/lib/store";

interface StoryDepthGuardProps {
  revealAtParva: number;
  children: React.ReactNode;
}

/** Fail-closed narrative-depth guard shared by guided and open modes. */
export default function StoryDepthGuard({ revealAtParva, children }: StoryDepthGuardProps) {
  const accessibleParva = useEpicStore(selectAccessibleParva);

  if (accessibleParva < revealAtParva) {
    return (
      <span className="ui-label !normal-case italic !text-ash/60">
        · waiting deeper in the telling ·
      </span>
    );
  }
  return <>{children}</>;
}
