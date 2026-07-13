"use client";

import { Canvas } from "@react-three/fiber";
import { useSyncExternalStore } from "react";
import SmokeBackground from "./SmokeBackground";
import VishvarupaParticles from "./VishvarupaParticles";
import PortraitPlane from "./PortraitPlane";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * The single persistent WebGL canvas. Lives in the root layout so the GL
 * context - and the smoke - survives every route transition.
 */
export default function CanvasRoot() {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false
  );

  if (reducedMotion) {
    // Static gradient stand-in - no animation, no GL churn
    return (
      <div
        aria-hidden
        className="fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 40%, #101522 0%, #090b12 70%)",
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-0" aria-hidden>
      <Canvas
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: "high-performance",
        }}
        dpr={[1, 1.75]}
        frameloop="always"
      >
        <SmokeBackground />
        <PortraitPlane />
        <VishvarupaParticles />
      </Canvas>
    </div>
  );
}
