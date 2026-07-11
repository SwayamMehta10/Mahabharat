"use client";

import { useEpicStore } from "@/lib/store";

interface SpoilerGuardProps {
  revealAtParva: number;
  children: React.ReactNode;
}

/**
 * Renders its children only if the visitor's Kalachakra setting has reached
 * the given parva. The store defaults to parva 0 and rehydrates after mount
 * (see StoreHydrator), so the server and first paint are always silent;
 * a spoiler can never flash.
 */
export default function SpoilerGuard({ revealAtParva, children }: SpoilerGuardProps) {
  const knownParva = useEpicStore((s) => s.knownParva);

  if (knownParva < revealAtParva) {
    return (
      <span className="ui-label !normal-case italic !text-ash/60">
        · unspoken, until the wheel is turned further ·
      </span>
    );
  }
  return <>{children}</>;
}
