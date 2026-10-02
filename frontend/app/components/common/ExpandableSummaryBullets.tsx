"use client";
import { useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { BulletMarker, splitSummary } from "@/app/components/common/SummaryBullets";
import { EASE_OUT } from "@/app/components/motion/Reveal";

interface ExpandableSummaryBulletsProps {
  summary: string;
  className?: string;
  itemClassName?: string;
}

/**
 * SummaryBullets for fixed-size cards. Collapsed, it shows a single line of
 * the first point, with the bullet thread running on to a "See more" control.
 * Expanding lays every point out in full over the nearest
 * `[data-summary-bounds]` ancestor (which must be positioned), scrolling
 * inside it, while a placeholder holds the collapsed height, so the card and
 * the grid around it never change size. Without bounds it scrolls in place.
 */
export default function ExpandableSummaryBullets({
  summary,
  className = "",
  itemClassName = "",
}: ExpandableSummaryBulletsProps) {
  const points = splitSummary(summary);
  const [expanded, setExpanded] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const [lockedHeight, setLockedHeight] = useState<number | null>(null);
  const [clipped, setClipped] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // With a single point there's no second line to tease, but the point can
  // still be cut off by the clamp, so check the rendered text too.
  useLayoutEffect(() => {
    if (expanded || !panelRef.current) return;
    const spans = panelRef.current.querySelectorAll<HTMLElement>("[data-point]");
    setClipped([...spans].some((el) => el.scrollHeight > el.clientHeight + 1));
  }, [summary, expanded]);

  if (points.length === 0) return null;

  const hasMore = points.length > 1 || clipped;
  const visible = expanded ? points : points.slice(0, 1);

  const toggle = (e: MouseEvent) => {
    // The card itself opens the chat; these controls only expand in place.
    e.stopPropagation();
    if (expanded) {
      setExpanded(false);
      setOverlay(false);
      setLockedHeight(null);
    } else {
      setLockedHeight(wrapRef.current?.offsetHeight ?? null);
      setOverlay(!!wrapRef.current?.closest("[data-summary-bounds]"));
      setExpanded(true);
    }
  };

  const panelClass = !expanded
    ? ""
    : overlay
      ? "absolute inset-0 z-10 p-5 bg-[#F0F0EB] overflow-y-auto overscroll-contain cursor-auto"
      : "h-full overflow-y-auto overscroll-contain pr-1 cursor-auto";

  return (
    <div
      ref={wrapRef}
      style={lockedHeight ? { height: lockedHeight } : undefined}
      className={className}
    >
      <motion.div
        ref={panelRef}
        onClick={expanded ? (e) => e.stopPropagation() : undefined}
        // Remount when the overlay opens so it fades in over the card.
        key={expanded && overlay ? "overlay" : "inline"}
        initial={expanded && overlay ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: EASE_OUT }}
        style={expanded ? { scrollbarWidth: "thin" } : undefined}
        className={panelClass}
      >
        <ul className="space-y-1.5">
          {visible.map((point, index) => {
            const isLastShown = index === visible.length - 1;
            const isNew = expanded && index >= 1;
            return (
              <motion.li
                key={index}
                initial={isNew ? { opacity: 0, y: 6 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE_OUT, delay: isNew ? (index - 1) * 0.05 : 0 }}
                className="relative pl-5"
              >
                {/* The thread keeps running past the last point when there is a
                    See more / See less control waiting below it. */}
                <BulletMarker last={isLastShown && !hasMore} />
                <span
                  data-point
                  onClick={!expanded && hasMore && isLastShown ? toggle : undefined}
                  className={`${expanded ? "block" : "line-clamp-1"} ${itemClassName}`}
                >
                  {point}
                </span>
              </motion.li>
            );
          })}

          {hasMore && (
            <li className="relative pl-5">
              <span
                aria-hidden="true"
                className="absolute left-[3px] top-1/2 -translate-y-1/2 h-[7px] w-[7px] rounded-full border border-black bg-white"
              />
              <button
                type="button"
                onClick={toggle}
                aria-expanded={expanded}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#8A6A3F] hover:text-[#5B4C3A] transition-colors cursor-pointer"
              >
                {expanded ? "See less" : "See more"}
                {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </li>
          )}
        </ul>
      </motion.div>
    </div>
  );
}
