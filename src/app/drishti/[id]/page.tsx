import { notFound } from "next/navigation";
import { causalThreads, charactersById, epicEvents, getArt } from "@/lib/kb";
import DrishtiExperience from "@/components/drishti/DrishtiExperience";

export function generateStaticParams() {
  return epicEvents.map((event) => ({ id: event.id }));
}

export default async function DrishtiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = epicEvents.find((item) => item.id === id);
  if (!event) notFound();
  const people = event.perspectives.map((perspective) => {
    const character = charactersById.get(perspective.characterId)!;
    const art = getArt(character.id);
    const [focalX = 0.5, focalY = 0.3] = art?.position.split(" ").map((value) => (parseFloat(value) || 50) / 100) ?? [];
    return { id: character.id, name: character.name, deva: character.deva, image: art ? { url: art.file, focalX, focalY } : undefined };
  });
  return <DrishtiExperience event={event} people={people} threads={causalThreads} />;
}
