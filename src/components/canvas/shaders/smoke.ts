/**
 * The void-smoke shader. Domain-warped fbm (iq's q/r technique) rendered on a
 * fullscreen quad — the same "living darkness" idiom as dark.netflix.io, tinted
 * toward midnight indigo with the faintest breath of gold near the cursor.
 */

export const smokeVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const smokeFragment = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;      // smoothed, in NDC (-1..1)
  uniform float uIntensity; // 0..1 master fade
  uniform float uWar;       // 0..1 — indigo night ... ember and ash

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  const mat2 ROT = mat2(0.80, 0.60, -0.60, 0.80);

  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 5; i++) {
      v += amp * noise(p);
      p = ROT * p * 2.03;
      amp *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0) * 2.2;

    float t = uTime * 0.045;

    // gentle pull toward the cursor
    vec2 m = uMouse * 0.35;
    p += m * 0.25;

    // double domain warp
    vec2 q = vec2(
      fbm(p + vec2(0.0, 0.0) + t * 0.7),
      fbm(p + vec2(5.2, 1.3) - t * 0.4)
    );
    vec2 r = vec2(
      fbm(p + 1.6 * q + vec2(1.7, 9.2) + t),
      fbm(p + 1.6 * q + vec2(8.3, 2.8) - t * 0.6)
    );
    float f = fbm(p + 1.8 * r);

    // sculpt: mostly void, wisps only in the upper register
    float wisp = smoothstep(0.42, 0.78, f);
    float fine = smoothstep(0.55, 0.95, fbm(p * 3.0 + r * 2.0 + t * 1.4)) * 0.35;

    vec3 void_c   = vec3(0.020, 0.024, 0.039); // #05060a
    vec3 indigo_c = vec3(0.075, 0.102, 0.200); // #131a33
    vec3 dusk_c   = vec3(0.137, 0.173, 0.306); // #232c4e

    // as the war deepens, the night bruises: wisps toward ash and ember
    vec3 ash_c    = vec3(0.145, 0.125, 0.110);
    vec3 ember_c  = vec3(0.290, 0.115, 0.055);
    indigo_c = mix(indigo_c, ash_c, uWar * 0.85);
    dusk_c   = mix(dusk_c, ember_c, uWar * 0.75);

    vec3 col = void_c;
    col = mix(col, indigo_c, wisp * (0.55 + 0.45 * length(q)));
    col = mix(col, dusk_c, fine * wisp);

    // a breath of gold that follows the cursor, barely there
    float mDist = length((uv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0) - uMouse * vec2(uResolution.x / uResolution.y, 1.0));
    float glow = exp(-mDist * 2.4) * 0.10;
    col += vec3(0.788, 0.643, 0.216) * glow * wisp;

    col *= uIntensity;

    gl_FragColor = vec4(col, 1.0);
  }
`;
