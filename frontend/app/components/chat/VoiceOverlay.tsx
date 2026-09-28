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

const PHASE_HINT: Record<VoicePhase, string> = {
  idle: "The mic is off. Tap below when you want to ask something.",
  listening: "Just talk. I'll answer out loud when you stop.",
  transcribing: "Turning what you said into a question.",
  thinking: "Reading the story and pulling the details together.",
  // The mic is closed while the answer plays, so cutting in is a button
  // press rather than simply talking over it.
  speaking: "Cut in any time with “Ask something else”.",
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

      {/* No shadow on the panel itself — the ball casts the only one, which
          is what makes it read as the object in front rather than a picture
          printed on a raised card. */}
      <div className="pointer-events-auto relative w-full max-w-md rounded-[2rem] border border-[#D9CBB0] bg-[#FDFCF8]/95 p-5 backdrop-blur-sm">
        <button
          onClick={onClose}
          aria-label="Close voice mode"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-200/70 hover:text-stone-900"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-center">
          <VoiceOrb state={orbStateFor(phase)} levelRef={levelRef} />

          {/* The canvas now ends just past the halo, so the label needs a
              gap of its own rather than the negative pull that used to
              close the empty space under the waveform. */}
          <p
            className="mt-2 text-sm font-medium text-stone-900"
            aria-live="polite"
          >
            {muted && phase === "listening" ? "Muted" : PHASE_LABEL[phase]}
          </p>
          <p className="mt-1 max-w-xs text-center text-xs leading-relaxed text-stone-500">
            {notice ?? PHASE_HINT[phase]}
          </p>

          {lastHeard && phase !== "listening" && (
            <p className="mt-3 max-w-xs truncate text-center text-xs italic text-stone-400">
              “{lastHeard}”
            </p>
          )}

          <div className="mt-5 flex items-center gap-2">
            {/* Muting is about what the open mic picks up, so it has no
                meaning while the mic is shut. */}
            {phase !== "idle" && (
              <button
                onClick={onToggleMute}
                aria-pressed={muted}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D9CBB0] bg-white text-stone-700 transition-colors hover:bg-stone-100"
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
                className="flex h-11 items-center gap-2 rounded-full bg-[#8A6A3F] px-5 text-sm font-medium text-[#F5E9D2] transition-colors hover:bg-[#755935]"
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
