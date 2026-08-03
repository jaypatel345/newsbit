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
          }, 900);
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
    <div className="py-4">
      {STEPS.slice(0, currentStep + 1).map((step, index) => {
        const completed = index < currentStep;

        const active = index === currentStep;

        return (
          <div key={step} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`h-2 w-2 rounded-full mt-2 ${
                  active ? "bg-black animate-pulse" : "bg-gray-400"
                }`}
              />

              {index < currentStep && (
                <div className="w-px h-6 bg-gray-300 my-1 animate-pulse" />
              )}
            </div>

            <p
              className={`text-sm leading-6 ${
                active ? "text-gray-900" : "text-gray-600"
              }`}
            >
              {completed ? step : displayedText}
            </p>
          </div>
        );
      })}
    </div>
  );
}
