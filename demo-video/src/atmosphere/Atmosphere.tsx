import React from "react";
import { AbsoluteFill } from "remotion";
import { WIDTH, HEIGHT } from "../config";
import { Smoke } from "./Smoke";
import { Embers } from "./Embers";
import { Grain, Grade, LightRays, Vignette } from "./Effects";

/**
 * The unifying atmosphere stack laid over (most) shots. Toggle layers per beat;
 * the grade + grain + vignette tie every source — particles, paintings, real
 * footage — into one film.
 */
export const Atmosphere: React.FC<{
  smoke?: number;
  embers?: number;
  emberFall?: boolean;
  rays?: number;
  grade?: boolean;
  grain?: number;
  vignette?: number;
  front?: boolean; // render only the front (grain/vignette/grade) layers
  back?: boolean; // render only the back (smoke/rays) layers
}> = ({
  smoke = 0,
  embers = 0,
  emberFall = false,
  rays = 0,
  grade = true,
  grain = 0.05,
  vignette = 0.9,
  front = true,
  back = true,
}) => {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {back && smoke > 0 ? <Smoke width={WIDTH} height={HEIGHT} intensity={smoke} /> : null}
      {back && rays > 0 ? <LightRays width={WIDTH} height={HEIGHT} intensity={rays} /> : null}
      {embers > 0 ? (
        <Embers width={WIDTH} height={HEIGHT} count={Math.round(90 * embers)} fall={emberFall} intensity={embers} />
      ) : null}
      {front && grade ? <Grade /> : null}
      {front && vignette > 0 ? <Vignette strength={vignette} /> : null}
      {front && grain > 0 ? <Grain width={WIDTH} height={HEIGHT} intensity={grain} /> : null}
    </AbsoluteFill>
  );
};
