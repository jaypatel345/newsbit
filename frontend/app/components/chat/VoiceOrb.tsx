"use client";

import { useEffect, useRef } from "react";

export type OrbState = "listening" | "thinking" | "speaking";

/** Warm browns from the site palette. Canvas can't read CSS custom
 *  properties, so the orb's own ramp lives here. */
const ORB_HIGHLIGHT = "#F0E2C6";
const ORB_MID = "#A9834E";
const ORB_EDGE = "#6F5734";
const ACCENT_RGB = "138, 106, 63"; // #8A6A3F, as rgb parts for alpha use
/** Deeper than the ball's own edge, so the cast shadow reads as shade
 *  rather than as more ball. */
const SHADOW_RGB = "74, 56, 32";

// Tight around the ball. Width holds the halo rings, which at full volume
// reach about 76px from the centre; the extra height below is room for the
// cast shadow, which would otherwise be clipped off at the canvas edge.
const CANVAS_WIDTH = 170;
const CANVAS_HEIGHT = 190;
const ORB_CENTER = CANVAS_WIDTH / 2;
const ORB_BASE_RADIUS = 36;
/** How far the shadow sits below the ball. */
const SHADOW_OFFSET_Y = 10;

type VoiceOrbProps = {
  state: OrbState;
  /** Live mic loudness, 0..1. Read every frame, so it's a ref by design —
   *  publishing it as state would re-render the page sixty times a second. */
  levelRef: React.RefObject<number>;
};

/**
 * The ball.
 *
 * While listening its size and halo are driven by the user's actual voice.
 * While thinking or speaking there's no amplitude to read — the audio is
 * played through an `<audio>` element we don't tap — so the motion is
 * synthesized: a slow breath for thinking, and a busier layered wobble for
 * speaking that reads as speech rhythm without pretending to be the real
 * envelope.
 */
export default function VoiceOrb({ state, levelRef }: VoiceOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef(state);
  // Eased so a state change doesn't snap the orb to a new size.
  const displayedLevelRef = useRef(0);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = CANVAS_WIDTH * ratio;
    canvas.height = CANVAS_HEIGHT * ratio;
    context.scale(ratio, ratio);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let frame = 0;
    const startedAt = performance.now();

    const draw = (now: number) => {
      const seconds = (now - startedAt) / 1000;

      let target: number;
      if (stateRef.current === "listening") {
        target = Math.min(1, Math.max(0, levelRef.current ?? 0));
      } else if (stateRef.current === "thinking") {
        target = 0.22 + 0.12 * Math.sin(seconds * 1.6);
      } else {
        // Speaking: overlapping rates give an uneven, speech-like envelope.
        target =
          0.42 +
          0.24 * Math.sin(seconds * 6.1) +
          0.14 * Math.sin(seconds * 11.3) +
          0.08 * Math.sin(seconds * 19.7);
      }
      if (reduceMotion) target = 0.2;

      displayedLevelRef.current +=
        (Math.min(1, Math.max(0, target)) - displayedLevelRef.current) * 0.2;
      const level = displayedLevelRef.current;

      context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const radius = ORB_BASE_RADIUS * (1 + level * 0.16);

      // Halo rings: they ride further out than the ball, so loudness reads
      // even when the ball itself is near its cap.
      for (const [index, spread] of [0.55, 1.15].entries()) {
        const haloRadius = radius * (1.18 + spread * level * 0.55);
        context.beginPath();
        context.arc(ORB_CENTER, ORB_CENTER, haloRadius, 0, Math.PI * 2);
        context.strokeStyle = `rgba(${ACCENT_RGB}, ${
          (0.3 - index * 0.14) * (0.35 + level)
        })`;
        context.lineWidth = 1.25;
        context.stroke();
      }

      // The ball: highlight offset up-left so it reads as lit, not flat.
      const gradient = context.createRadialGradient(
        ORB_CENTER - radius * 0.32,
        ORB_CENTER - radius * 0.38,
        radius * 0.12,
        ORB_CENTER,
        ORB_CENTER,
        radius,
      );
      gradient.addColorStop(0, ORB_HIGHLIGHT);
      gradient.addColorStop(0.52, ORB_MID);
      gradient.addColorStop(1, ORB_EDGE);

      // Cast downward rather than glowing evenly: an offset shadow gives
      // the ball a light source and a surface to sit above. It deepens with
      // volume, so a loud moment lifts the ball off the panel.
      context.save();
      // A tighter blur reads as a cast shadow; a wide one just reads as haze.
      context.shadowColor = `rgba(${SHADOW_RGB}, ${0.38 + level * 0.22})`;
      context.shadowOffsetY = SHADOW_OFFSET_Y;
      context.shadowBlur = 16 + level * 14;
      context.beginPath();
      context.arc(ORB_CENTER, ORB_CENTER, radius, 0, Math.PI * 2);
      context.fillStyle = gradient;
      context.fill();
      context.restore();

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [levelRef]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={
        state === "listening"
          ? "Listening"
          : state === "thinking"
            ? "Thinking"
            : "Speaking"
      }
      style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
      className="max-w-full"
    />
  );
}
