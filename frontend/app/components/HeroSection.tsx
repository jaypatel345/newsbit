"use client";
import { useState, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";

const popularQuestions = [
  "What happened today?",
  "AI news",
  "India",
  "World",
  "Explain inflation",
  "Crypto",
];

const examplePrompts = [
  "What happened today?",
  "Why is oil increasing?",
  "Explain today's AI news.",
  "What affects the Indian market today?",
];

export default function HeroSection() {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromptIndex((prev) => (prev + 1) % examplePrompts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleChipClick = (question: string) => {
    setInputValue(question);
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center pt-16">
      <div className="w-full max-w-225 px-6 sm:px-8 flex flex-col items-center justify-center animate-in fade-in duration-700">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full mb-8 border border-gray-100">
          <Sparkles size={16} className="text-blue-600" />
          <span className="text-sm font-medium text-gray-700">
            AI-powered News Assistant
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl font-semibold text-gray-900 mb-4 tracking-tight">
          Newsbit
        </h1>

        {/* Large Headline */}
        <h2 className="text-2xl sm:text-3xl font-medium text-gray-900 mb-4">
          Understand today's news with AI.
        </h2>

        {/* Supporting Text */}
        <p className="text-lg text-gray-600 text-center max-w-2xl mb-12 leading-relaxed">
          Summaries, explanations, context, and answers from today's biggest
          stories in seconds.
        </p>

        {/* AI Prompt Input */}
        <div className="w-full max-w-200 mb-8">
          <div
            className={`relative transition-all duration-300 ${
              isFocused ? "shadow-lg" : "shadow-md"
            }`}
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
              className="w-full h-16 px-6 pr-14 bg-white border border-gray-200 rounded-2xl text-base focus:outline-none transition-all duration-300 placeholder:text-gray-400"
            />
            <button
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all duration-300 ${
                inputValue.trim()
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              }`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>

        {/* Popular Questions */}
        <div className="w-full max-w-200 mb-12">
          <h3 className="text-sm font-medium text-gray-500 mb-4 text-center">
            Popular Questions
          </h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {popularQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleChipClick(question)}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:-translate-y-0.5 transition-all duration-200"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Updated 5 minutes ago</span>
          <span className="text-gray-300">•</span>
          <span>12,400 articles analyzed today</span>
        </div>
      </div>
    </main>
  );
}
