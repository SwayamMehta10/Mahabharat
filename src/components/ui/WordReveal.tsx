"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface WordRevealProps {
  text: string;
  delay?: number;
  stagger?: number;
  className?: string;
  as?: "p" | "h1" | "h2" | "span";
}

/**
 * Dark-style staggered text: every word wrapped in its own masked span,
 * rising into view. (The original site does exactly this — its DOM is a
 * sea of per-word spans.)
 */
export default function WordReveal({
  text,
  delay = 0,
  stagger = 0.045,
  className = "",
  as: Tag = "p",
}: WordRevealProps) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const words = root.querySelectorAll(".word-mask > span");
    const tween = gsap.to(words, {
      y: 0,
      duration: 1.1,
      ease: "power3.out",
      stagger,
      delay,
    });
    return () => {
      tween.kill();
    };
  }, [delay, stagger, text]);

  return (
    // @ts-expect-error — polymorphic tag with a shared HTMLElement ref
    <Tag ref={rootRef} className={className} aria-label={text}>
      {text.split(" ").map((word, i) => (
        <span className="word-mask" key={`${word}-${i}`} aria-hidden>
          <span>{word}</span>
          {" "}
        </span>
      ))}
    </Tag>
  );
}
