"use client";

import { useId } from "react";

interface EllipseButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

/**
 * Dark's signature hover: a slightly imperfect, hand-drawn ellipse that
 * strokes itself around the label. The path is deliberately wobbly;
 * a perfect <ellipse> reads as sterile.
 */
export default function EllipseButton({
  children,
  onClick,
  className = "",
  ariaLabel,
}: EllipseButtonProps) {
  const id = useId();

  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`group relative inline-block cursor-pointer bg-transparent px-8 py-3 ${className}`}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 200 60"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          id={id}
          d="M 100 4
             C 156 2, 196 14, 197 30
             C 198 47, 152 57, 98 56
             C 44 55, 4 46, 3 31
             C 2 15, 46 5, 100 4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          className="text-bone/80 [stroke-dasharray:620] [stroke-dashoffset:620] transition-[stroke-dashoffset] duration-700 ease-out group-hover:[stroke-dashoffset:0] group-focus-visible:[stroke-dashoffset:0]"
        />
      </svg>
      <span className="relative z-10">{children}</span>
    </button>
  );
}
