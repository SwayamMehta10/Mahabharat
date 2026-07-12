import { strategicDays } from "@/lib/kb";
import SanjayaEye from "@/components/war/SanjayaEye";

export const metadata = { title: "Sanjaya's Eye | MAHABHARAT", description: "Five decisive days of Kurukshetra seen as moving formations." };

export default function StrategyPage() {
  return <main className="mx-auto min-h-dvh w-full max-w-6xl px-6 pb-28 pt-28"><p className="font-deva text-gold/70">सञ्जयदृष्टि</p><h1 className="font-display mt-3 text-5xl font-light tracking-[0.14em] text-bone">SANJAYA&apos;S EYE</h1><p className="font-display mb-12 mt-6 max-w-2xl text-xl italic text-ash">The field as formation and fracture. The chronicle remains where the cost is told in names.</p><SanjayaEye days={strategicDays} /></main>;
}
