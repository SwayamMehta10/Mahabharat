import { causalThreads, charactersById, epicEvents } from "@/lib/kb";
import CausalThreads from "@/components/threads/CausalThreads";

export const metadata = { title: "The Web of Vows | MAHABHARAT", description: "The vows, curses, boons, secrets and debts that move the epic." };

export default function ThreadsPage() {
  const names = Object.fromEntries([...charactersById].map(([id, character]) => [id, character.name]));
  const eventTitles = Object.fromEntries(epicEvents.map((event) => [event.id, event.title]));
  return <main className="mx-auto min-h-dvh w-full max-w-6xl px-6 pb-28 pt-28"><p className="font-deva text-gold/70">प्रतिज्ञाजाल</p><h1 className="font-display mt-3 text-5xl font-light tracking-[0.14em] text-bone">THE WEB OF VOWS</h1><p className="font-display mt-6 max-w-2xl text-xl italic text-ash">The epic moves through promises, debts, secrets and consequences long before armies move.</p><p className="font-display mb-16 mt-5 max-w-2xl text-lg leading-relaxed text-ash/80">Each entry is one such promise, its kind named above the title: a vow, curse, boon, secret or debt. The names are the people it binds. The shared event is the scene where the promise comes due, told from every side.</p><CausalThreads threads={causalThreads} names={names} events={eventTitles} /></main>;
}
