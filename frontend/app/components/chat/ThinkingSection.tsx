"use client";

import { useState, useEffect } from "react";
import { Brain, ChevronDown } from "lucide-react";
import ThinkingTimeline from "./ThinkingTimeline";

type ThinkingSectionProps = {
  onComplete: () => void;
  isThinking: boolean;
};

export default function ThinkingSection({
  onComplete,
  isThinking,
}: ThinkingSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isThinking) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isThinking]);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isThinking) return null;

  return (
    <div className="mb-4">
      {/* Brain icon with text */}
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:opacity-80 transition-opacity"
      >
        {isHovered ? (
          <ChevronDown 
            size={15} 
            className="text-gray-600"
          />
        ) : (
          <Brain 
            size={15} 
            className="text-gray-600"
          />
        )}
        <span 
          className={`text-sm text-gray-600 transition-opacity duration-500 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          Thought
        </span>
      </button>

      {/* Timeline always runs in background, only visible when expanded */}
      <div 
        className={`mt-2 ml-2 pl-4 border-l-2 border-gray-200 transition-all duration-300 ${
          isExpanded ? "opacity-100" : "opacity-0 pointer-events-none h-0 overflow-hidden"
        }`}
      >
        <ThinkingTimeline onComplete={onComplete} />
      </div>
    </div>
  );
}