import "./index.css";
import { AbsoluteFill, Composition } from "remotion";
import { FPS, WIDTH, HEIGHT, DURATION, COLOR } from "./config";
import { VyuhaField } from "./procedural/VyuhaField";
import { Atmosphere } from "./atmosphere/Atmosphere";
import { CinematicPainting } from "./painting/CinematicPainting";
import { Trailer } from "./Trailer";

const TestAtmos: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLOR.void }}>
    <VyuhaField days={[13]} durationInFrames={180} />
    <Atmosphere smoke={0.28} embers={0.7} rays={0.5} grain={0.05} vignette={0.85} />
  </AbsoluteFill>
);

const TestPaint: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLOR.void }}>
    <CinematicPainting src="art/draupadi.webp" focal={[0.5, 0.32]} durationInFrames={150} />
    <Atmosphere smoke={0.18} embers={0.5} rays={0.3} grain={0.05} vignette={0.9} />
  </AbsoluteFill>
);

// Test harness compositions for verifying components in isolation. The real
// trailer is registered as "Trailer" once assembled.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TestVyuha"
        component={VyuhaField as React.FC}
        durationInFrames={180}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ days: [13], durationInFrames: 180 } as never}
      />
      <Composition
        id="TestVyuhaMorph"
        component={VyuhaField as React.FC}
        durationInFrames={300}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ days: [1, 6, 13, 14, 17], durationInFrames: 300 } as never}
      />
      <Composition
        id="TestAtmos"
        component={TestAtmos}
        durationInFrames={180}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="TestPaint"
        component={TestPaint}
        durationInFrames={150}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="Trailer"
        component={Trailer}
        durationInFrames={DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};
