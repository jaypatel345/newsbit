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
  const [showTimeline, setShowTimeline] = useState(false);

  useEffect(() => {
    if (isThinking) {
      setIsVisible(true);
      setTimelineCompleted(false);
      setShowTimeline(false);
      
      // Show timeline after 1.5 seconds
      const timer = setTimeout(() => {
        setShowTimeline(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isThinking]);

  const handleTimelineComplete = () => {
    setTimelineCompleted(true);
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <div className="mb-4">
      {/* Thinking text */}
      <div className="flex items-center gap-2">
        {isThinking ? (
          <Loader2 className="h-4 w-4 text-black animate-spin" />
        ) : (
          <Brain className="h-4 w-4 text-black" />
        )}
        <p className="text-sm font-medium text-gray-800">{isThinking ? "Thinking..." : "Thinking Process"}</p>
      </div>

      {/* Timeline shows after delay */}
      {showTimeline && (
        <div className="mt-0 ml-0.5 opacity-100 max-h-96">
          <ThinkingTimeline onComplete={handleTimelineComplete} />
        </div>
      )}
    </div>
  );
}