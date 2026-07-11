"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import gsap from "gsap";

/**
 * Easter egg: type "karna" anywhere (outside an input) and the river gives
 * up its secret. The reader has known since Adi Parva §67 - the brothers
 * never did.
 */
export default function KarnaSecret() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let buffer = "";
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable) return;
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key.length !== 1) return;
      buffer = (buffer + e.key.toLowerCase()).slice(-5);
      if (buffer === "karna") {
        buffer = "";
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    gsap.fromTo(
      "[data-secret]",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1.2, stagger: 0.25, ease: "power3.out" }
    );
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-void/95 px-6 text-center backdrop-blur-sm"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="A secret of the river"
    >
      <p data-secret className="font-deva text-4xl text-gold-bright/90">कर्ण</p>
      <p data-secret className="font-display max-w-md text-2xl italic leading-relaxed text-bone/90">
        Before the five, there was a sixth. Kunti&rsquo;s firstborn, son of the
        Sun, set adrift on the river before dawn.
      </p>
      <p data-secret className="font-display max-w-md text-lg italic text-ash">
        The eldest Pandava fought his brothers all his life. Only the river
        knew.
      </p>
      <Link
        data-secret
        href="/who/karna"
        className="ui-label underline decoration-gold/50 decoration-dotted underline-offset-4 transition-colors hover:text-gold-bright"
        onClick={(e) => e.stopPropagation()}
      >
        Know him →
      </Link>
      <p data-secret className="ui-label !text-ash/40">Adi Parva §67 · click anywhere to let it go</p>
    </div>
  );
}
