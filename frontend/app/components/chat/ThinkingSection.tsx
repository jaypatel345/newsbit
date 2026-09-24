"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Brain, ChevronUp, Loader2 } from "lucide-react";
import ThinkingTimeline from "./ThinkingTimeline";

type ThinkingSectionProps = {
  onComplete: () => void;
  isThinking: boolean;
};

export default function ThinkingSection({
  onComplete,
  isThinking,
}: ThinkingSectionProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [expanded, setExpanded] = useState(false);

  // Live timer so the user can see how long the reply is taking: the label
  // counts 1s, 2s, 3s... for as long as we're waiting on the model. The start
  // time lives in a ref rather than state so a fresh wait re-bases the clock
  // without a synchronous setState in the effect body. Elapsed is measured
  // against the clock instead of counting ticks, so it can't drift.
  const startedAtRef = useRef(0);

  useEffect(() => {
    if (!isThinking) return;

    startedAtRef.current = Date.now();

    const ticker = setInterval(() => {
      setElapsedSeconds(
        Math.floor((Date.now() - startedAtRef.current) / 1000),
      );
    }, 1000);

    return () => clearInterval(ticker);
  }, [isThinking]);

  // The timeline's onComplete only flushes a safety-net buffer on the page;
  // the real reply is rendered the moment it arrives, independently of this.
  // Keep the callback identity stable so the timeline's typing animation
  // isn't restarted by the once-a-second re-render from the timer above.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });
  const handleTimelineComplete = useCallback(() => {
    onCompleteRef.current();
  }, []);

  return (
    <div className="mb-4">
      {/* Thinking header — click to reveal or hide the timeline */}
      <button
        type="button"
        onClick={() => setExpanded((previous) => !previous)}
        aria-expanded={expanded}
        aria-label={expanded ? "Hide thinking timeline" : "Show thinking timeline"}
        className="group -ml-1 flex items-center gap-2 rounded-lg px-1 py-0.5 transition-colors hover:bg-gray-100 cursor-pointer"
      >
        {isThinking ? (
          <Loader2 className="h-4 w-4 text-black animate-spin" />
        ) : (
          <Brain className="h-4 w-4 text-black" />
        )}

        <p className="text-sm font-medium text-gray-800">
          {isThinking ? "Thinking" : "Thought"}
          {elapsedSeconds > 0 && ` ${elapsedSeconds}s`}
        </p>

        <ChevronUp
          className={`h-3.5 w-3.5 text-gray-500 transition-all duration-200 ${
            expanded
              ? "rotate-180 opacity-100"
              : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
          }`}
        />
      </button>

      {/* Timeline stays mounted so it keeps pace with the request, but it's
          tucked inside the thinking line until the user opens it. */}
      <div
        className={`ml-0.5 overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ThinkingTimeline onComplete={handleTimelineComplete} />
      </div>
    </div>
  );
}
