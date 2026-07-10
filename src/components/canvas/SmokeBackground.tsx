"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { smokeVertex, smokeFragment } from "./shaders/smoke";
import { atmosphere } from "@/lib/atmosphere";

export default function SmokeBackground() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const size = useThree((s) => s.size);
  const mouse = useRef(new THREE.Vector2(0, 0));
  const target = useRef(new THREE.Vector2(0, 0));
  // the smoke keeps its own clock so the Gita moment can stop it
  const smokeTime = useRef(0);
  const timeScale = useRef(1);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uIntensity: { value: 0 },
      uWar: { value: 0 },
    }),
    []
  );

  useFrame((state, delta) => {
    const mat = materialRef.current;
    if (!mat) return;
    // ease toward the requested flow of time, then accumulate
    timeScale.current = THREE.MathUtils.damp(
      timeScale.current,
      atmosphere.timeScale,
      1.5,
      delta
    );
    smokeTime.current += delta * timeScale.current;
    mat.uniforms.uTime.value = smokeTime.current;
    mat.uniforms.uResolution.value.set(size.width, size.height);

    // smooth the pointer so the smoke feels like it has mass
    target.current.set(state.pointer.x, state.pointer.y);
    mouse.current.lerp(target.current, 1 - Math.pow(0.001, delta));
    mat.uniforms.uMouse.value.copy(mouse.current);

    // slow fade-in from pure black on first load
    mat.uniforms.uIntensity.value = THREE.MathUtils.damp(
      mat.uniforms.uIntensity.value,
      1,
      0.6,
      delta
    );

    // ease toward the war mood the DOM last requested
    mat.uniforms.uWar.value = THREE.MathUtils.damp(
      mat.uniforms.uWar.value,
      atmosphere.war,
      1.2,
      delta
    );
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={smokeVertex}
        fragmentShader={smokeFragment}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
