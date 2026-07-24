"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const popularQuestions = [
  "2-Minute Brief",
  "What happened today?",
  "World news",
  "What's trending?",
  "Top Headlines",
];

const examplePrompts = [
  "What happened today?",
  "Why are oil prices rising?",
  "Explain inflation.",
  "Catch me up in 2 minutes.",
  "What's happening in India?",
  "Tell me about AI this week.",
  "Why is this trending?",
  "Compare India and US tech news.",
];

export default function HeroSection() {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromptIndex((prev) => (prev + 1) % examplePrompts.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleChipClick = (question: string) => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    setSelectedPrompt(question);
    setInputValue(question);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const prompt = inputValue;
    setTimeout(() => {
      router.push(`/chat?prompt=${encodeURIComponent(prompt)}`);
    }, 300);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center pt-16 bg-white overflow-x-hidden">
      <div className="w-full max-w-4xl sm:max-w-5xl lg:max-w-6xl xl:max-w-225 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center animate-in fade-in duration-700">
        {/* Main Heading */}
        <h1
          className="font-(family-name:--font-geist) text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[63px] mb-8 sm:mb-10 lg:mb-12 tracking-tight leading-tight text-center"
          style={{ color: "#1E1E1E" }}
        >
          News{" "}
          <span className="inline-block font-light not-italic -skew-x-12 ">
            for
          </span>{" "}
          busy minds.
        </h1>

        {/* Supporting Text */}
        <p
          className="text-base sm:text-lg text-center max-w-2xl mb-3 leading-relaxed"
          style={{ color: "#5B4C3A" }}
        >
          Think deeper. Read smarter. Stay informed.
        </p>

        {/* AI Prompt Input */}
        <div className="w-full max-w-160 mb-6 sm:mb-8">
          <div
            className={`flex items-center gap-2 bg-white border rounded-2xl transition-all duration-300 ${
              selectedPrompt
                ? "border-gray-400 bg-gray-50 scale-[1.02]"
                : "border-gray-200"
            } ${isFocused ? "shadow-lg" : "shadow-2xs"}`}
            style={{
              backgroundColor: selectedPrompt ? "#F9FAFB" : "#FFFFFF",
            }}
          >
            <input
              type="text"
              placeholder={
                inputValue || isFocused
                  ? "Ask about today's news..."
                  : examplePrompts[currentPromptIndex]
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              className="flex-1 h-12 sm:h-14 px-4 sm:px-6 bg-transparent text-sm sm:text-base text-black focus:outline-none transition-all duration-300 placeholder:text-gray-400 "
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className={`mr-1 sm:mr-2 w-9 h-9 rounded-full transition-all duration-300 flex items-center justify-center ${
                inputValue.trim()
                  ? "bg-black text-white hover:bg-gray-800"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              }`}
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Popular Questions */}
        <div className="w-full max-w-200 mb-8 sm:mb-12">
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            {popularQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleChipClick(question)}
                className={`px-4 py-2.5 sm:px-5 sm:py-3 rounded-3xl text-xs sm:text-sm font-medium cursor-pointer border border-gray-200  bg-white transition-all duration-200 active:scale-95  hover:bg-gray-50/90 ${
                  selectedPrompt === question ? "scale-[1.03]" : "scale-100"
                }`}
                // style={{
                //   backgroundColor: "#FFFFFF",
                //   border: "1px solid #E5E7EB",
                //   color: "#1E1E1E",
                // }}
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Metadata */}
        {/* <div
          className="flex items-center gap-2 text-sm"
          style={{ color: "#5B4C3A" }}
        >
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: "#38BDF8" }}
          />
          <span>Updated 5 minutes ago</span>
          <span style={{ color: "#8A6A3F" }}>•</span>
          <span>100+ articles analyzed today</span>
        </div> */}
      </div>
    </main>
  );
}
