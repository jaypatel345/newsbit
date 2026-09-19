"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface GridWordmarkProps {
  text: string;
  /** Sizing classes (font-size, weight, tracking, etc) applied to the text itself. */
  textClassName?: string;
  /** Layout classes (margin, padding) applied to the wrapping container. */
  className?: string;
}

const GRID_SIZE = 40;
const gridBackground = {
  backgroundImage:
    "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
  backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
};

/**
 * Big background wordmark whose fill is a grid pattern clipped to the
 * letter shapes (bg-clip: text) - so the grid only ever shows inside the
 * text, never around it. A second, brighter copy is revealed inside a
 * radial spotlight that follows the cursor, same mechanic as the hero's
 * InfiniteGridBackground.
 */
export function GridWordmark({ text, textClassName, className }: GridWordmarkProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    setPos({ x: e.clientX - left, y: e.clientY - top });
  };

  const maskImage = pos
    ? `radial-gradient(300px circle at ${pos.x}px ${pos.y}px, black, transparent)`
    : undefined;

  return (
    <div
      className={cn("relative select-none", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPos(null)}
    >
      <p
        aria-hidden
        className={cn("text-gray-300 bg-clip-text text-transparent opacity-60", textClassName)}
        style={gridBackground}
      >
        {text}
      </p>
      <p
        aria-hidden
        className={cn(
          "absolute inset-0 text-gray-500 bg-clip-text text-transparent transition-opacity duration-200",
          textClassName
        )}
        style={{
          ...gridBackground,
          opacity: pos ? 1 : 0,
          maskImage,
          WebkitMaskImage: maskImage,
        }}
      >
        {text}
      </p>
    </div>
  );
}

export default GridWordmark;
