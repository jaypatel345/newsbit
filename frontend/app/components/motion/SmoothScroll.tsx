"use client";

import { useSyncExternalStore } from "react";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Site-wide eased scrolling (Lenis, MIT). It drives the window, so a page
 * scrolls smoothly only if the document is what scrolls - page wrappers
 * should use overflow-x-clip rather than overflow-x-hidden, which would turn
 * the wrapper into its own scroll container.
 *
 * - allowNestedScroll: inner scroll areas (chat messages, the sidebar, long
 *   summaries) keep scrolling natively instead of having the wheel hijacked.
 * - anchors: in-page "#id" links glide to their target too.
 * - Off for anyone who prefers reduced motion; the browser's own scrolling
 *   is left untouched for them.
 */
export default function SmoothScroll() {
  // Off during SSR (no window), then follows the user's setting live.
  const enabled = useSyncExternalStore(
    subscribe,
    () => !window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );

  if (!enabled) return null;

  return (
    <ReactLenis
      root
      options={{ lerp: 0.1, anchors: true, allowNestedScroll: true }}
    />
  );
}
