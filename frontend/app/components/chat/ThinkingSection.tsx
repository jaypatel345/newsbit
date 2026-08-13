"use client";

import { useState, useEffect } from "react";
import { Brain, Loader2 } from "lucide-react";
import ThinkingTimeline from "./ThinkingTimeline";

type ThinkingSectionProps = {
  onComplete: () => void;
  isThinking: boolean;
};

export default function ThinkingSection({
  onComplete,
  isThinking,
}: ThinkingSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timelineCompleted, setTimelineCompleted] = useState(false);

  useEffect(() => {
    if (isThinking) {
      setIsVisible(true);
      setTimelineCompleted(false);
    }
  }, [isThinking]);

  const handleTimelineComplete = () => {
    setTimelineCompleted(true);
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <div className="mb-4">
      {/* Modern loading indicator */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="relative">
          {isThinking ? (
            <Loader2 className="h-5 w-5 text-black animate-spin" />
          ) : (
            <Brain className="h-5 w-5 text-black" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">{isThinking ? "Thinking..." : "Thinking Process"}</p>
        </div>
      </div>

      {/* Timeline always visible */}
      <div className="mt-3 ml-2 pl-4 border-l-2 border-gray-200 opacity-100 max-h-96">
        <ThinkingTimeline onComplete={handleTimelineComplete} />
      </div>
    </div>
  );
}