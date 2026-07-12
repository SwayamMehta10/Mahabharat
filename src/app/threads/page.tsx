import { causalThreads, charactersById } from "@/lib/kb";
import CausalThreads from "@/components/threads/CausalThreads";

export const metadata = { title: "The Web of Vows | MAHABHARAT", description: "The vows, curses, boons, secrets and debts that move the epic." };

export default function ThreadsPage() {
  const names = Object.fromEntries([...charactersById].map(([id, character]) => [id, character.name]));
  return <main className="mx-auto min-h-dvh w-full max-w-6xl px-6 pb-28 pt-28"><p className="font-deva text-gold/70">प्रतिज्ञाजाल</p><h1 className="font-display mt-3 text-5xl font-light tracking-[0.14em] text-bone">THE WEB OF VOWS</h1><p className="font-display mb-16 mt-6 max-w-2xl text-xl italic text-ash">The epic moves through promises, debts, secrets and consequences long before armies move.</p><CausalThreads threads={causalThreads} names={names} /></main>;
}
