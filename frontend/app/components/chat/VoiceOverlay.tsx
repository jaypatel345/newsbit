"use client";

import { Mic, MicOff, SkipForward, X } from "lucide-react";

import VoiceOrb, { type OrbState } from "@/app/components/chat/VoiceOrb";
import type { VoicePhase } from "@/app/hooks/useVoiceSession";

const PHASE_LABEL: Record<VoicePhase, string> = {
  idle: "Ready when you are",
  listening: "Listening…",
  transcribing: "Got it — one moment",
  thinking: "Looking into that…",
  speaking: "Speaking",
};

/** The orb has no "transcribing" look of its own — it's the beat between
 *  hearing you and answering, which reads the same as thinking. */
function orbStateFor(phase: VoicePhase): OrbState {
  if (phase === "listening") return "listening";
  if (phase === "speaking") return "speaking";
  // Idle borrows the thinking look: a slow breath, which reads as waiting
  // rather than as the dead component a frozen ball would suggest.
  return "thinking";
}

type VoiceOverlayProps = {
  phase: VoicePhase;
  notice: string | null;
  lastHeard: string | null;
  muted: boolean;
  levelRef: React.RefObject<number>;
  onClose: () => void;
  onToggleMute: () => void;
  onInterrupt: () => void;
};

/**
 * Voice mode's panel: it sits over the bottom of the chat page rather than
 * replacing it, so the transcript stays readable while the answer is spoken.
 */
export default function VoiceOverlay({
  phase,
  notice,
  lastHeard,
  muted,
  levelRef,
  onClose,
  onToggleMute,
  onInterrupt,
}: VoiceOverlayProps) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4"
      role="dialog"
      aria-modal="false"
      aria-label="Voice mode"
    >
      {/* The chat above stays legible but recedes behind the panel. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[26rem] bg-gradient-to-t from-canvas via-canvas/90 to-transparent"
      />

      <div className="pointer-events-auto relative w-full max-w-xs rounded-3xl border border-black/5 bg-white px-5 pb-4 pt-5 shadow-[0_12px_32px_-16px_rgba(0,0,0,0.18)]">
        <button
          onClick={onClose}
          aria-label="Close voice mode"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-center">
          <VoiceOrb state={orbStateFor(phase)} levelRef={levelRef} />

          <p
            className="mt-3 text-sm font-medium text-gray-900"
            aria-live="polite"
          >
            {muted && phase === "listening" ? "Muted" : PHASE_LABEL[phase]}
          </p>
          {notice && (
            <p className="mt-1 max-w-xs text-center text-xs leading-relaxed text-gray-500">
              {notice}
            </p>
          )}

          {lastHeard && phase !== "listening" && (
            <p className="mt-2 max-w-xs truncate text-center text-xs text-gray-400">
              “{lastHeard}”
            </p>
          )}

          <div className="mt-4 flex items-center gap-2">
            {/* Muting is about what the open mic picks up, so it has no
                meaning while the mic is shut. */}
            {phase !== "idle" && (
              <button
                onClick={onToggleMute}
                aria-pressed={muted}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition-colors hover:bg-gray-100"
                title={muted ? "Unmute microphone" : "Mute microphone"}
              >
                {muted ? <MicOff size={17} /> : <Mic size={17} />}
              </button>
            )}

            {/* Nothing to press while listening: stopping talking is what
                ends the turn, so a "done" button would only be a slower way
                of doing what the silence already does. Everywhere else this
                is the only way back to the mic. */}
            {phase !== "listening" && (
              <button
                onClick={onInterrupt}
                className="flex h-10 items-center gap-2 rounded-full bg-gray-900 px-5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
              >
                {phase === "idle" ? <Mic size={15} /> : <SkipForward size={15} />}
                {phase === "idle" ? "Ask something" : "Ask something else"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
