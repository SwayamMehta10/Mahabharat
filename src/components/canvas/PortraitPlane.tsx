"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { atmosphere } from "@/lib/atmosphere";

/**
 * The living painting. Character pages ask for a portrait through the
 * atmosphere channel; this plane (in the persistent canvas, behind the DOM
 * gradients and text) renders it with:
 *   - cover-fit + focal point, like CSS object-fit: cover / object-position
 *   - a slow fbm displacement so the paint surface breathes
 *   - mouse parallax with mass
 *   - the cinematic grade (desaturate, warm, darken, indigo wash) in GLSL
 * Crossfades happen here too: fade out, swap texture, fade in.
 */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  uniform sampler2D uMap;
  uniform float uTime;
  uniform float uReveal;      // 0..1 crossfade
  uniform vec2 uMouse;        // smoothed, NDC
  uniform float uPlaneAspect;
  uniform float uTexAspect;
  uniform vec2 uFocal;        // 0..1, like object-position
  uniform float uFadeX;       // where the left dissolve finishes (0..1)
  uniform float uExposure;    // presentation multiplier over the base grade

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1, 0)), f.x),
      mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x),
      f.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; i++) {
      v += a * noise(p);
      p *= 2.1;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // cover-fit: sample a sub-rect of the texture, anchored at the focal point
    vec2 s = uTexAspect > uPlaneAspect
      ? vec2(uPlaneAspect / uTexAspect, 1.0)
      : vec2(1.0, uTexAspect / uPlaneAspect);
    // gentle Ken Burns: breathe around the focal point
    s *= 1.0 - 0.025 * (0.5 + 0.5 * sin(uTime * 0.11));

    vec2 uv = uFocal * (1.0 - s) + vUv * s;

    // parallax with the cursor - the painting leans away, slightly
    uv += uMouse * vec2(-0.008, -0.006) * s;

    // the paint breathes: sub-pixel fbm displacement, slow
    float d = fbm(vUv * 3.0 + uTime * 0.05);
    uv += (d - 0.5) * 0.006;

    vec3 c = texture2D(uMap, clamp(uv, 0.001, 0.999)).rgb;

    // the grade, same intent as the CSS treatment, computed per-pixel
    float g = dot(c, vec3(0.299, 0.587, 0.114));
    c = mix(vec3(g), c, 0.85);            // desaturate, gently
    c *= vec3(1.05, 0.99, 0.90);          // lean warm
    c *= 0.90 * uExposure;                // into the dusk, not the dark
    vec3 indigo = vec3(0.075, 0.102, 0.200);
    c = mix(c, c * indigo * 4.2, 0.10);   // indigo wash in the shadows

    // full-bleed dissolve: the painting never shows an edge; it fades
    // into the void under the text column instead of stopping at one
    float veil = smoothstep(0.02, uFadeX, vUv.x);
    gl_FragColor = vec4(c, uReveal * veil);
  }
`;

const textureCache = new Map<string, THREE.Texture>();
const loader = new THREE.TextureLoader();

/** Warm a texture immediately before a crossfade. Callers restrict this to
 *  the active and next spoiler-visible tableau. */
export function preloadPortrait(url: string): void {
  loadTexture(url, () => {});
}

function loadTexture(url: string, onLoad: (t: THREE.Texture) => void): void {
  const cached = textureCache.get(url);
  if (cached) {
    onLoad(cached);
    return;
  }
  loader.load(url, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    textureCache.set(url, t);
    onLoad(t);
  });
}

export default function PortraitPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mouse = useRef(new THREE.Vector2(0, 0));
  const shownUrl = useRef<string | null>(null);
  const swapping = useRef(false);

  const uniforms = useMemo(
    () => ({
      uMap: { value: null as THREE.Texture | null },
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uPlaneAspect: { value: 1 },
      uTexAspect: { value: 1 },
      uFocal: { value: new THREE.Vector2(0.5, 0.3) },
      uFadeX: { value: 0.45 },
      uExposure: { value: 1 },
    }),
    []
  );

  const { viewport, size } = useThree();

  useFrame((state, delta) => {
    const mat = materialRef.current;
    const mesh = meshRef.current;
    if (!mat || !mesh) return;

    mat.uniforms.uTime.value += delta;

    // smooth pointer
    mouse.current.lerp(state.pointer, 1 - Math.pow(0.002, delta));
    mat.uniforms.uMouse.value.copy(mouse.current);

    const want = atmosphere.portrait;
    const wantUrl = want?.url ?? null;

    // crossfade logic: fade toward 0 when the wanted texture differs,
    // swap at the bottom, then fade back up. `strength` caps the reveal so
    // a page can hold the painting at atmosphere level rather than subject
    // level; both it and exposure follow the channel per-frame so
    // presentation changes apply even when the URL stays the same.
    const showing = shownUrl.current;
    const target = wantUrl === showing && wantUrl !== null ? (want?.strength ?? 1) : 0;
    const r = THREE.MathUtils.damp(mat.uniforms.uReveal.value, target, 3.2, delta);
    mat.uniforms.uReveal.value = r;
    if (wantUrl === showing && want) {
      mat.uniforms.uExposure.value = want.exposure ?? 1;
    }

    if (wantUrl !== showing && r < 0.02 && !swapping.current) {
      if (wantUrl) {
        swapping.current = true;
        loadTexture(wantUrl, (t) => {
          mat.uniforms.uMap.value = t;
          const img = t.image as { width: number; height: number };
          mat.uniforms.uTexAspect.value = img.width / img.height;
          if (want) {
            mat.uniforms.uFocal.value.set(want.focalX, 1 - want.focalY);
            mat.uniforms.uExposure.value = want.exposure ?? 1;
          }
          shownUrl.current = wantUrl;
          swapping.current = false;
        });
      } else {
        shownUrl.current = null;
        mat.uniforms.uMap.value = null;
      }
    }

    // full-bleed: the plane spans the whole viewport and the shader
    // dissolves its left side into the void, so the painting reads as
    // atmosphere rather than a column with an edge
    const w = viewport.width;
    const h = viewport.height;
    mesh.scale.set(w, h, 1);
    mesh.position.set(0, 0, 0);
    // on small screens the text runs full width, so fade less territory;
    // legibility over the text column is the DOM scrim's job, not the
    // shader's, so the dissolve stays short and the painting stays present
    mat.uniforms.uFadeX.value = size.width < 640 ? 0.3 : 0.34;
    // world units scale linearly with pixels, so world w/h IS the pixel aspect
    mat.uniforms.uPlaneAspect.value = w / h;

    mesh.visible = r > 0.005 && mat.uniforms.uMap.value !== null;
  });

  return (
    <mesh ref={meshRef} visible={false}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
