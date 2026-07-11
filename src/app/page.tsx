"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import WordReveal from "@/components/ui/WordReveal";
import EllipseButton from "@/components/ui/EllipseButton";
import { useEpicStore } from "@/lib/store";
import { playConch } from "@/lib/audio";

export default function EntryGate() {
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);
  const { soundOn, setSoundOn, setEntered } = useEpicStore();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-fade]",
        { opacity: 0 },
        { opacity: 1, duration: 2, ease: "power2.out", stagger: 0.35, delay: 0.6 }
      );
    }, pageRef);
    return () => ctx.revert();
  }, []);

  const enter = () => {
    if (soundOn) playConch();
    setEntered(true);
    gsap.to(pageRef.current, {
      opacity: 0,
      duration: 1.6,
      ease: "power2.inOut",
      onComplete: () => router.push("/saga"),
    });
  };

  return (
    <div
      ref={pageRef}
      className="flex min-h-dvh flex-col items-center justify-between px-6 py-10 text-center"
    >
      {/* brand - the epic's own name in its own script */}
      <header data-fade className="anim-hidden">
        <p className="font-deva text-lg text-bone/70" style={{ letterSpacing: "0.6em" }}>
          म हा भा र त
        </p>
      </header>

      <main className="flex flex-col items-center gap-10">
        <h1
          className="font-display text-[clamp(1.7rem,7vw,4.5rem)] font-light text-bone"
          style={{ letterSpacing: "var(--tracking-epic)", textIndent: "var(--tracking-epic)" }}
        >
          <WordReveal as="span" text="MAHABHARAT" stagger={0.12} delay={1.2} />
        </h1>

        <WordReveal
          text="Eighteen books. Eighteen armies. Eighteen days of war."
          className="font-display max-w-md text-xl italic text-ash sm:text-2xl"
          delay={2.0}
        />

        <div data-fade className="anim-hidden mt-4 flex flex-col items-center gap-8">
          <p className="font-deva text-sm text-gold/80">
            यदा यदा हि धर्मस्य ग्लानिर्भवति भारत
          </p>
          <EllipseButton onClick={enter} ariaLabel="Enter the experience">
            <span className="ui-label !text-bone">Enter</span>
          </EllipseButton>
        </div>
      </main>

      <footer data-fade className="anim-hidden flex w-full items-center justify-between">
        <p className="ui-label">The Official Guide</p>
        <button
          onClick={() => setSoundOn(!soundOn)}
          className="ui-label -m-3 cursor-pointer p-3 transition-colors hover:text-bone"
          aria-pressed={soundOn}
        >
          Sound {soundOn ? "On" : "Off"}
        </button>
      </footer>
    </div>
  );
}
