"use client";

import dynamic from "next/dynamic";

/**
 * three.js is ~240kB gzipped — the single biggest thing we ship. Loading it
 * as an async chunk after hydration lets every page paint its text without
 * waiting for the GL stack to parse. The smoke already fades in from black
 * (uIntensity ramps from 0), so its slightly later arrival reads as intended
 * cinematography, not jank.
 */
const CanvasRoot = dynamic(() => import("./CanvasRoot"), { ssr: false });

export default function CanvasRootLazy() {
  return <CanvasRoot />;
}
