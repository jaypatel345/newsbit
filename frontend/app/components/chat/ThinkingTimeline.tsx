"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Gathering the pieces that matter",
  "Firing up the tools",
  "Connecting the dots",
  "Crafting the response",
  "Adding the final touch",
];

type ThinkingTimelineProps = {
  onComplete: () => void;
};

export default function ThinkingTimeline({
  onComplete,
}: ThinkingTimelineProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (currentStep >= STEPS.length) return;

    const text = STEPS[currentStep];
    let index = 0;

    const startTyping = () => {
      const typing = setInterval(() => {
        index++;

        setDisplayedText(text.slice(0, index));

        if (index >= text.length) {
          clearInterval(typing);

          setTimeout(() => {
            if (currentStep === STEPS.length - 1) {
              onComplete();

              return;
            }
            setCurrentStep((prev) => prev + 1);
            setDisplayedText("");
          }, 1500);
        }
      }, 5);
    };

    // Add delay for first step to simulate "thinking"
    if (currentStep === 0) {
      const delayTimer = setTimeout(startTyping, 1500);
      return () => clearTimeout(delayTimer);
    } else {
      startTyping();
    }
  }, [currentStep, onComplete]);

  return (
    <div className="py-2">
      {STEPS.slice(0, currentStep + 1).map((step, index) => {
        const completed = index < currentStep;

        const active = index === currentStep;

        return (
          <div key={step} className="transition-all duration-300 ease-in-out">
            {/* Vertical line connecting thinking to first bullet - only for first step */}
            {index === 0 && (
              <div className="ml-1 w-px h-4 bg-gray-300 mb-0.5 animate-pulse transition-all duration-300" />
            )}

            <div className="flex items-center gap-3 mt-0.5 min-h-[24px]">
              <div
                className={`h-2 w-2 rounded-full transition-all duration-300 flex-shrink-0 ${
                  active ? "bg-black animate-pulse" : "bg-gray-400"
                }`}
              />

              <p
                className={`text-sm leading-5 transition-all duration-300 ${
                  active ? "text-gray-900" : "text-gray-600"
                }`}
              >
                {completed ? step : displayedText}
              </p>
            </div>

            {index < currentStep && index < STEPS.length - 1 && (
              <div className="ml-1 w-px h-4 bg-gray-300 my-0.5 animate-pulse transition-all duration-300" />
            )}
          </div>
        );
      })}
    </div>
  );
}
