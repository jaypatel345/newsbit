"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useAnimationFrame,
} from "framer-motion";
import { cn } from "@/lib/utils";

/** Side of one grid cell, in px. */
export const GRID_CELL = 64;

/**
 * Horizontal offset of the grid lines inside a box of the given width when
 * the grid is static: the pattern is shifted so a line runs down the exact
 * centre, which keeps the grid symmetric.
 */
export function gridOffsetX(width: number) {
  return (width / 2) % GRID_CELL;
}

function GridPattern({ offsetX, offsetY }: { offsetX: any; offsetY: any }) {
  return (
    <svg className="w-full h-full">
      <defs>
        <motion.pattern
          id="infinite-grid-pattern"
          width={GRID_CELL}
          height={GRID_CELL}
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <path
            d={`M ${GRID_CELL} 0 L 0 0 0 ${GRID_CELL}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted-foreground"
          />
        </motion.pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#infinite-grid-pattern)" />
    </svg>
  );
}

export interface InfiniteGridBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  /** Scroll the grid continuously. When off, the grid is centred instead. */
  animate?: boolean;
  /** Reveal a stronger copy of the grid in a spotlight around the cursor. */
  spotlight?: boolean;
}

/**
 * Animated grid backdrop: the grid scrolls infinitely, and a second, more
 * visible copy is revealed inside a radial spotlight that follows the
 * cursor. Wrap real content in it - it's the shared mouse-tracking
 * ancestor, so the spotlight still responds while hovering interactive
 * children (event bubbling handles it).
 */
export function InfiniteGridBackground({
  className,
  children,
  animate = true,
  spotlight = true,
}: InfiniteGridBackgroundProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const offsetX = useMotionValue(0);
  const offsetY = useMotionValue(0);
  const rootRef = React.useRef<HTMLDivElement>(null);

  // A static grid is centred horizontally; a scrolling one just drifts.
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (animate || !root) return;
    const centre = () => offsetX.set(gridOffsetX(root.clientWidth));
    centre();
    const observer = new ResizeObserver(centre);
    observer.observe(root);
    return () => observer.disconnect();
  }, [animate, offsetX]);

  const speedX = 0.5;
  const speedY = 0.5;

  useAnimationFrame(() => {
    if (!animate) return;
    offsetX.set((offsetX.get() + speedX) % GRID_CELL);
    offsetY.set((offsetY.get() + speedY) % GRID_CELL);
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const maskImage = useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

  return (
    <div
      onMouseMove={spotlight ? handleMouseMove : undefined}
      ref={rootRef}
      className={cn("relative", className)}
    >
      <div className="absolute inset-0 z-0 opacity-[0.15]">
        <GridPattern offsetX={offsetX} offsetY={offsetY} />
      </div>
      {spotlight && (
        <motion.div
          className="absolute inset-0 z-0 opacity-40"
          style={{ maskImage, WebkitMaskImage: maskImage }}
        >
          <GridPattern offsetX={offsetX} offsetY={offsetY} />
        </motion.div>
      )}

      {children}
    </div>
  );
}

export default InfiniteGridBackground;
