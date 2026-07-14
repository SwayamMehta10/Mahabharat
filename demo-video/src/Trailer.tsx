import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { BEAT, COLOR, beatLen } from "./config";
import { Atmosphere } from "./atmosphere/Atmosphere";
import { Smoke } from "./atmosphere/Smoke";
import { VyuhaField } from "./procedural/VyuhaField";
import { ParticleArmies } from "./procedural/ParticleArmies";
import { KalachakraWheel } from "./procedural/KalachakraWheel";
import { LineageThreads } from "./procedural/LineageThreads";
import { CinematicPainting } from "./painting/CinematicPainting";
import { FireWheel } from "./painting/FireWheel";
import { KineticText } from "./type/KineticText";
import { DevanagariBloom } from "./type/DevanagariBloom";
import { DayCounter } from "./type/DayCounter";
import { TitleCard } from "./type/TitleCard";
import { ProductReveal } from "./reveal/ProductReveal";
import { Soundtrack } from "./Soundtrack";
import { WIDTH, HEIGHT } from "./config";

const MONTAGE_DAYS = [1, 6, 13, 14, 17];

export const Trailer: React.FC = () => {
  const act1Front = <Atmosphere back={false} grain={0.045} vignette={0.85} grade />;

  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.void }}>
      {/* ─── ACT 1 · the world ─── */}

      {/* 1 · cold open */}
      <Sequence from={BEAT.coldOpen} durationInFrames={beatLen("coldOpen")} name="cold-open">
        <AbsoluteFill style={{ backgroundColor: COLOR.void }}>
          <Smoke width={WIDTH} height={HEIGHT} intensity={0.42} speed={0.7} />
          <Atmosphere back={false} embers={0.4} grain={0.045} vignette={0.92} />
          <DevanagariBloom text="धर्म" inFrame={12} outFrame={96} size={170} />
          <KineticText lines={["Every throne is bought in blood."]} inFrame={70} outFrame={148} size={50} y={0.72} italic color={COLOR.ash} />
        </AbsoluteFill>
      </Sequence>

      {/* 2 · the wheel of time */}
      <Sequence from={BEAT.wheelOfTime} durationInFrames={beatLen("wheelOfTime")} name="wheel-of-time">
        <AbsoluteFill>
          <KalachakraWheel durationInFrames={beatLen("wheelOfTime")} />
          <Atmosphere back={false} embers={0.5} grain={0.045} vignette={0.85} />
          <KineticText lines={["Eighteen books."]} inFrame={90} outFrame={176} size={58} y={0.84} />
        </AbsoluteFill>
      </Sequence>

      {/* 3 · two houses */}
      <Sequence from={BEAT.twoHouses} durationInFrames={beatLen("twoHouses")} name="two-houses">
        <AbsoluteFill>
          <LineageThreads durationInFrames={beatLen("twoHouses")} />
          {act1Front}
          <KineticText lines={["Five brothers. A hundred cousins.", "One crown."]} inFrame={30} outFrame={148} size={46} y={0.12} />
        </AbsoluteFill>
      </Sequence>

      {/* 4 · the insult */}
      <Sequence from={BEAT.insult} durationInFrames={beatLen("insult")} name="insult">
        <AbsoluteFill style={{ backgroundColor: COLOR.void }}>
          <CinematicPainting src="art/draupadi.webp" focal={[0.28, 0.42]} zoomFrom={1.08} zoomTo={1.2} durationInFrames={beatLen("insult")} grade="saturate(0.7) brightness(0.7) contrast(1.12)" />
          <Smoke width={WIDTH} height={HEIGHT} intensity={0.35} tint={[110, 30, 18]} speed={0.9} />
          <Atmosphere back={false} embers={0.4} grain={0.05} vignette={0.95} />
          <KineticText lines={["They wagered a queen —", "and lost her."]} inFrame={26} outFrame={148} size={50} y={0.8} italic />
        </AbsoluteFill>
      </Sequence>

      {/* 5 · war declared */}
      <Sequence from={BEAT.warDeclared} durationInFrames={beatLen("warDeclared")} name="war-declared">
        <AbsoluteFill>
          <ParticleArmies durationInFrames={beatLen("warDeclared")} />
          <Atmosphere back={false} grain={0.05} vignette={0.85} />
          <DevanagariBloom text="अष्टादश" inFrame={6} outFrame={64} size={130} y={0.4} />
          <KineticText lines={["EIGHTEEN DAYS OF WAR."]} inFrame={30} outFrame={88} size={40} y={0.62} />
        </AbsoluteFill>
      </Sequence>

      {/* 6 · war montage */}
      <Sequence from={BEAT.warMontage} durationInFrames={beatLen("warMontage")} name="war-montage">
        <AbsoluteFill>
          <VyuhaField days={MONTAGE_DAYS} holdFrames={22} morphFrames={14} durationInFrames={beatLen("warMontage")} />
          <Atmosphere back={false} embers={0.55} grain={0.05} vignette={0.85} />
          {MONTAGE_DAYS.map((d, i) => (
            <Sequence key={d} from={i * 36} durationInFrames={36} name={`day-${d}`}>
              <DayCounter day={d} inFrame={0} holdFrames={36} />
            </Sequence>
          ))}
        </AbsoluteFill>
      </Sequence>

      {/* 7 · the fire-wheel */}
      <Sequence from={BEAT.fireWheel} durationInFrames={beatLen("fireWheel")} name="fire-wheel">
        <AbsoluteFill>
          <FireWheel durationInFrames={beatLen("fireWheel")} trimBefore={300} />
          <Atmosphere back={false} grain={0.04} vignette={0.8} grade={false} />
          <KineticText lines={["I am time."]} inFrame={10} outFrame={60} size={52} y={0.85} italic color={COLOR.bone} />
        </AbsoluteFill>
      </Sequence>

      {/* ─── ACT 2 · the product reveal ─── */}
      <Sequence from={BEAT.reveal} durationInFrames={beatLen("reveal") + beatLen("features")} name="product-reveal">
        <AbsoluteFill>
          <ProductReveal />
          <Atmosphere back={false} grain={0.03} vignette={0.42} grade={false} />
        </AbsoluteFill>
      </Sequence>

      {/* ─── ACT 3 · title + CTA ─── */}
      <Sequence from={BEAT.title} durationInFrames={beatLen("title") + beatLen("cta")} name="title">
        <AbsoluteFill>
          <TitleCard />
          <Atmosphere back={false} embers={0.25} grain={0.04} vignette={0.8} grade={false} />
        </AbsoluteFill>
      </Sequence>

      <Soundtrack />
    </AbsoluteFill>
  );
};
