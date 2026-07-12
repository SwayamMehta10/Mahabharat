import { strategicDays } from "@/lib/kb";
import SanjayaEye from "@/components/war/SanjayaEye";

export const metadata = { title: "Sanjaya's Eye | MAHABHARAT", description: "The days of Kurukshetra seen as moving formations, drawn as Sanjaya narrates them." };

export default function StrategyPage() {
  return <main className="mx-auto min-h-dvh w-full max-w-6xl px-6 pb-28 pt-28"><p className="font-deva text-gold/70">सञ्जयदृष्टि</p><h1 className="font-display mt-3 text-5xl font-light tracking-[0.14em] text-bone">SANJAYA&apos;S EYE</h1><p className="font-display mt-6 max-w-2xl text-xl italic text-ash">The field as formation and fracture. The chronicle remains where the cost is told in names.</p><p className="ui-label !normal-case mb-12 mt-4 max-w-2xl !text-ash/70">Sanjaya was granted sight of the whole field to narrate the war to the blind king. Each day below is his view: the battle array that morning took, drawn as two hosts of moving points.</p><SanjayaEye days={strategicDays} /></main>;
}
