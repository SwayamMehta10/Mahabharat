"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { atmosphere } from "@/lib/atmosphere";

/**
 * The Vishvarupa — the cosmic form as an erupting mandala of ~16k particles.
 * It ignores the frozen smoke-clock on purpose: when time stops for the Gita,
 * this is the only thing in the universe still moving.
 *
 * Additive blending gives the "thousand suns" bloom for free — no
 * postprocessing pass needed.
 */

const COUNT_RINGS = 11000;
const COUNT_DUST = 5000;
const COUNT = COUNT_RINGS + COUNT_DUST;
const MAX_R = 3.4;

const vertexShader = /* glsl */ `
  attribute float aRadius;
  attribute float aAngle;
  attribute float aSize;
  attribute float aSeed;
  attribute float aHeat; // 0 = rim (vermillion) … 1 = core (white-gold)

  uniform float uProgress;   // 0..1 eruption
  uniform float uTime;       // the form's own clock — never freezes
  uniform float uPixelRatio;

  varying float vAlpha;
  varying float vHeat;

  void main() {
    // staggered emergence: inner particles first, each with its own delay
    float t = clamp(uProgress * 1.35 - aSeed * 0.25 - (aRadius / ${MAX_R.toFixed(1)}) * 0.35, 0.0, 1.0);
    float ease = 1.0 - pow(1.0 - t, 4.0); // easeOutQuart

    float radius = aRadius * ease;

    // the wheel turns: inner rings fast, outer rings slow and contrary
    float spin = uTime * (0.22 / (0.35 + aRadius)) * (mod(aSeed * 7.0, 2.0) < 1.0 ? 1.0 : -0.6);
    float angle = aAngle + spin;

    vec3 pos = vec3(cos(angle) * radius, sin(angle) * radius, 0.0);

    // breath: a slow radial shimmer so the form feels alive
    float breath = sin(uTime * 1.4 + aSeed * 6.2831) * 0.03 * ease;
    pos.xy *= 1.0 + breath;
    pos.z = sin(uTime * 0.8 + aSeed * 12.0) * 0.08;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    float spark = 0.85 + 0.3 * sin(uTime * 3.0 + aSeed * 40.0);
    gl_PointSize = aSize * uPixelRatio * spark * (62.0 / -mv.z) * (0.25 + 0.75 * ease);

    vAlpha = ease * (0.22 + 0.3 * aHeat);
    vHeat = aHeat;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  varying float vAlpha;
  varying float vHeat;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float falloff = smoothstep(0.5, 0.0, d);
    float core = pow(falloff, 3.0);

    vec3 rim   = vec3(0.55, 0.16, 0.05);  // deep vermillion
    vec3 gold  = vec3(0.82, 0.64, 0.22);  // burnished gold
    vec3 white = vec3(1.0, 0.96, 0.86);   // sun-core

    vec3 col = mix(rim, gold, vHeat);
    col = mix(col, white, core * vHeat);

    gl_FragColor = vec4(col, falloff * vAlpha);
  }
`;

export default function VishvarupaParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const formTime = useRef(0);

  const { positions, radii, angles, sizes, seeds, heats } = useMemo(() => {
    const radii = new Float32Array(COUNT);
    const angles = new Float32Array(COUNT);
    const sizes = new Float32Array(COUNT);
    const seeds = new Float32Array(COUNT);
    const heats = new Float32Array(COUNT);

    // The form is a wheel, not a sun: a dense annulus with a dark hollow
    // center (where the verse text lives) and a single bindu at the heart.
    const R_IN = 1.05;
    let i = 0;

    // the bindu — a small burning heart
    const BINDU = 300;
    for (; i < BINDU; i++) {
      radii[i] = Math.random() ** 2 * 0.14;
      angles[i] = Math.random() * Math.PI * 2;
      sizes[i] = 0.8 + Math.random() * 1.4;
      seeds[i] = Math.random();
      heats[i] = 1;
    }

    // structured rings — the rim of the wheel
    const RINGS = 18;
    for (let ring = 0; ring < RINGS && i < COUNT_RINGS; ring++) {
      const r = R_IN + (ring / (RINGS - 1)) ** 1.2 * (MAX_R - R_IN);
      const perRing = Math.floor(((COUNT_RINGS - BINDU) / RINGS) * (0.5 + r / MAX_R));
      for (let k = 0; k < perRing && i < COUNT_RINGS; k++, i++) {
        radii[i] = r * (1 + (Math.random() - 0.5) * 0.04);
        angles[i] = (k / perRing) * Math.PI * 2 + ring * 0.35;
        sizes[i] = 1.0 + Math.random() * 1.6;
        seeds[i] = Math.random();
        heats[i] = 1 - ((r - R_IN) / (MAX_R - R_IN)) * 0.9;
      }
    }
    // free dust — the storm around the wheel, none in the hollow
    for (; i < COUNT; i++) {
      const r = R_IN + Math.sqrt(Math.random()) * (MAX_R * 1.15 - R_IN);
      radii[i] = r;
      angles[i] = Math.random() * Math.PI * 2;
      sizes[i] = 0.6 + Math.random() * 1.0;
      seeds[i] = Math.random();
      heats[i] = Math.max(0, 1 - r / MAX_R) * 0.7;
    }

    // positions buffer is required by three but fully driven in the vertex shader
    const positions = new Float32Array(COUNT * 3);
    return { positions, radii, angles, sizes, seeds, heats };
  }, []);

  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
    }),
    []
  );

  useFrame((state, delta) => {
    const mat = materialRef.current;
    const pts = pointsRef.current;
    if (!mat || !pts) return;

    // the form has its own clock — it moves even when the world is frozen
    formTime.current += delta;

    const target = atmosphere.vishvarupa;
    const p = THREE.MathUtils.damp(mat.uniforms.uProgress.value, target, 3, delta);
    mat.uniforms.uProgress.value = p;
    mat.uniforms.uTime.value = formTime.current;
    mat.uniforms.uPixelRatio.value = Math.min(state.gl.getPixelRatio(), 2);

    pts.visible = p > 0.004;
  });

  return (
    <points ref={pointsRef} frustumCulled={false} visible={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aRadius" args={[radii, 1]} />
        <bufferAttribute attach="attributes-aAngle" args={[angles, 1]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
        <bufferAttribute attach="attributes-aHeat" args={[heats, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
