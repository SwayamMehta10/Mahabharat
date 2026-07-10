"use client";

import { useEffect } from "react";
import { useEpicStore } from "@/lib/store";

/** Rehydrates the persisted spoiler/audio state strictly after mount. */
export default function StoreHydrator() {
  useEffect(() => {
    void useEpicStore.persist.rehydrate();
  }, []);
  return null;
}
