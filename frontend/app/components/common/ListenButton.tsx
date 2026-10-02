"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle, Loader2, Pause, Play, Sparkles, Volume2 } from "lucide-react";

type Status = "idle" | "loading" | "playing" | "paused" | "error";

interface ListenButtonProps {
  /** Full URL of the MP3 to play (an article's or the daily brief's audio endpoint). */
  src: string;
  /** What this reads aloud, used in the accessible label - e.g. "summary" or "today's brief". */
  label?: string;
  className?: string;
  /** "text": icon + word pill (default, used inline next to a summary).
   *  "icon": bare circular icon button (used for a compact corner control).
   *  "ai": pill that labels the narration as an AI voice, with live sound
   *  bars while it plays (used on the daily brief). */
  variant?: "text" | "icon" | "ai";
}

/** Labels for the "ai" pill, which says what it is rather than just "Listen". */
const AI_STATUS_LABEL: Record<Status, string> = {
  idle: "Listen with AI voice",
  loading: "Preparing AI voice",
  playing: "AI is speaking",
  paused: "Resume AI voice",
  error: "Try again",
};

/** Each bar gets its own speed, offset and rise-and-fall pattern, so together
 *  they never settle into a steady rhythm - that unevenness is what reads as
 *  a voice talking rather than music playing. */
const VOICE_BARS = [
  { duration: 1.4, delay: 0, heights: [0.3, 0.9, 0.45, 1, 0.35, 0.3] },
  { duration: 1.8, delay: 0.5, heights: [0.5, 0.3, 1, 0.6, 0.85, 0.5] },
  { duration: 1.3, delay: 0.9, heights: [0.35, 1, 0.5, 0.75, 0.3, 0.35] },
  { duration: 2.0, delay: 0.25, heights: [0.6, 0.4, 0.8, 0.3, 1, 0.6] },
  { duration: 1.55, delay: 0.7, heights: [0.3, 0.7, 0.35, 0.95, 0.5, 0.3] },
];

/** Hairline lift so the pill sits on the card instead of looking cut into it.
 *  Lives in the motion values, not a class, since the glow owns box-shadow. */
const RESTING_SHADOW = "0 1px 2px rgba(0, 0, 0, 0.04)";

const loop = (duration: number, delay = 0) => ({
  duration,
  delay,
  repeat: Infinity,
  ease: "easeInOut" as const,
});

/** Live, speech-like waveform. Animated with framer-motion rather than CSS
 *  keyframes so it ships with the component. */
function SpeakingIndicator() {
  return (
    <span className="flex h-3 items-center gap-[2px]" aria-hidden="true">
      {VOICE_BARS.map(({ duration, delay, heights }, index) => (
        <motion.span
          key={index}
          className="h-full w-[2px] rounded-full bg-current"
          initial={{ scaleY: heights[0] }}
          animate={{ scaleY: heights }}
          transition={loop(duration, delay)}
        />
      ))}
    </span>
  );
}

const STATUS_LABEL: Record<Status, string> = {
  idle: "Listen",
  loading: "Loading",
  playing: "Listening",
  paused: "Resume",
  error: "Try again",
};

/**
 * "Listen" control for AI-narrated text. Fetches (and lets the backend
 * cache) the audio on first click; a second click pauses, a third resumes
 * from where it left off rather than restarting.
 */
export default function ListenButton({
  src,
  label = "summary",
  className,
  variant = "text",
}: ListenButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const prefetchedSrc = useRef<string | null>(null);
  const reduceMotion = useReducedMotion();
  const speakingGlow = variant === "ai" && status === "playing" && !reduceMotion;

  // On a cold cache, generating audio costs a real ~8-15s Google TTS call,
  // all of which the user would otherwise wait through after clicking. Kick
  // that off as soon as they show intent to listen (hover / focus / touch)
  // instead of waiting for the click, so by the time they actually press
  // play the backend has usually already generated and cached it.
  const prefetch = () => {
    if (prefetchedSrc.current === src) return;
    prefetchedSrc.current = src;
    fetch(src).catch(() => {
      // A failed prefetch just means the real click falls back to the
      // normal (slower) path - nothing to handle here.
      prefetchedSrc.current = null;
    });
  };

  const handleClick = () => {
    const audio = audioRef.current;
    if (!audio || status === "loading") return;

    if (status === "playing") {
      audio.pause();
      return;
    }

    if (status === "idle" || status === "error") {
      audio.src = src;
    }

    setStatus("loading");
    audio.play().catch(() => setStatus("error"));
  };

  const text = (variant === "ai" ? AI_STATUS_LABEL : STATUS_LABEL)[status];
  const iconSize = variant === "icon" ? 16 : 14;
  const icon =
    variant === "ai" && status === "playing" ? (
      <SpeakingIndicator />
    ) : variant === "ai" && status === "idle" ? (
      <Sparkles size={13} strokeWidth={2} />
    ) : status === "loading" ? (
      <Loader2 size={iconSize} className="animate-spin" />
    ) : status === "playing" ? (
      <Pause size={iconSize} />
    ) : status === "paused" ? (
      <Play size={iconSize} />
    ) : status === "error" ? (
      <AlertCircle size={iconSize} />
    ) : (
      <Volume2 size={iconSize} />
    );

  const defaultClassName =
    variant === "icon"
      ? "inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#F0F0EB] border border-gray-200 text-gray-600 hover:text-gray-900 transition-all disabled:opacity-60 cursor-pointer"
      : variant === "ai"
      ? `group inline-flex items-center gap-1.5 h-7 px-3 rounded-full border text-xs font-medium leading-none whitespace-nowrap transition-colors cursor-pointer disabled:cursor-wait ${
          status === "playing"
            ? "bg-gray-900 border-gray-900 text-white"
            : "bg-white/70 border-gray-200 text-gray-700 hover:text-gray-900 hover:border-gray-300 hover:bg-white"
        }`
      : "inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-60 cursor-pointer";

  return (
    <>
      <motion.button
        type="button"
        // A soft ring pulsing out of the pill while the AI voice speaks.
        initial={false}
        animate={
          speakingGlow
            ? {
                boxShadow: [
                  `0 0 0 0px rgba(17, 24, 39, 0.28), ${RESTING_SHADOW}`,
                  `0 0 0 5px rgba(17, 24, 39, 0), ${RESTING_SHADOW}`,
                  `0 0 0 0px rgba(17, 24, 39, 0), ${RESTING_SHADOW}`,
                ],
              }
            : { boxShadow: `0 0 0 0px rgba(17, 24, 39, 0), ${RESTING_SHADOW}` }
        }
        transition={speakingGlow ? { duration: 1.8, repeat: Infinity, ease: "easeOut" } : { duration: 0.2 }}
        onClick={handleClick}
        onMouseEnter={prefetch}
        onFocus={prefetch}
        onTouchStart={prefetch}
        disabled={status === "loading"}
        aria-label={variant === "ai" ? `${text}: ${label}` : `${text} to ${label}`}
        title={
          variant === "icon"
            ? `${text} to ${label}`
            : variant === "ai"
            ? "Read aloud by an AI-generated voice"
            : undefined
        }
        className={className ?? defaultClassName}
      >
        {variant === "ai" && status !== "playing" ? (
          <span className="flex h-3.5 w-3.5 items-center justify-center">{icon}</span>
        ) : (
          icon
        )}
        {variant !== "icon" && text}
      </motion.button>
      <audio
        ref={audioRef}
        preload="none"
        className="hidden"
        onPlaying={() => setStatus("playing")}
        onPause={() =>
          setStatus((current) =>
            current === "playing" || current === "loading" ? "paused" : current
          )
        }
        onEnded={() => setStatus("idle")}
        onError={() => setStatus("error")}
      />
    </>
  );
}
