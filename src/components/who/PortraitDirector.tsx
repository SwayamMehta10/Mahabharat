"use client";

import { useEffect } from "react";
import { atmosphere } from "@/lib/atmosphere";

interface PortraitDirectorProps {
  url: string;
  /** CSS object-position string from the art manifest, e.g. "40% 25%" */
  position: string;
  /** Presentation-only exposure multiplier from the manifest (default 1) */
  exposure?: number;
}

/**
 * Server-rendered character pages can't talk to the canvas - this tiny
 * client component does it for them: on mount it asks the PortraitPlane to
 * show this painting; on unmount it lets it fade back to nothing.
 */
export default function PortraitDirector({ url, position, exposure }: PortraitDirectorProps) {
  useEffect(() => {
    const [fx, fy] = position
      .split(" ")
      .map((p) => (parseFloat(p) || 50) / 100);
    atmosphere.portrait = { url, focalX: fx ?? 0.5, focalY: fy ?? 0.3, exposure };
    return () => {
      atmosphere.portrait = null;
    };
  }, [url, position, exposure]);

  return null;
}
