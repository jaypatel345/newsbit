"use client";

import { useRef, useState } from "react";
import { AlertCircle, Loader2, Pause, Play, Volume2 } from "lucide-react";

type Status = "idle" | "loading" | "playing" | "paused" | "error";

interface ListenButtonProps {
  /** Full URL of the MP3 to play (an article's or the daily brief's audio endpoint). */
  src: string;
  /** What this reads aloud, used in the accessible label - e.g. "summary" or "today's brief". */
  label?: string;
  className?: string;
  /** "text": icon + word pill (default, used inline next to a summary).
   *  "icon": bare circular icon button (used for a compact corner control). */
  variant?: "text" | "icon";
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

  const text = STATUS_LABEL[status];
  const iconSize = variant === "icon" ? 16 : 14;
  const icon =
    status === "loading" ? (
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
      ? "inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/90 border border-gray-200 shadow-sm text-gray-600 hover:text-gray-900 hover:shadow transition-all disabled:opacity-60 cursor-pointer"
      : "inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-60 cursor-pointer";

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "loading"}
        aria-label={`${text} to ${label}`}
        title={variant === "icon" ? `${text} to ${label}` : undefined}
        className={className ?? defaultClassName}
      >
        {icon}
        {variant === "text" && text}
      </button>
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
