"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { soundscape, type SceneName } from "@/lib/soundscape";
import { useEpicStore } from "@/lib/store";

function sceneFor(pathname: string): SceneName {
  if (pathname.startsWith("/war")) return "war";
  if (pathname.startsWith("/gita")) return "gita";
  return "void";
}

/**
 * Routes choose their sound. The engine itself is created on the first
 * user gesture (autoplay policy) — until someone touches the page,
 * the site is silent by law and by design.
 */
export default function SoundscapeProvider() {
  const pathname = usePathname();
  const soundOn = useEpicStore((s) => s.soundOn);

  useEffect(() => {
    const wake = () => soundscape.init();
    window.addEventListener("pointerdown", wake, { once: true });
    window.addEventListener("keydown", wake, { once: true });
    return () => {
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("keydown", wake);
    };
  }, []);

  useEffect(() => {
    soundscape.setScene(sceneFor(pathname));
  }, [pathname]);

  useEffect(() => {
    soundscape.setEnabled(soundOn);
  }, [soundOn]);

  return null;
}
