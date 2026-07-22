"use client";
import { useState } from "react";
import { Send } from "lucide-react";

const quickPrompts = [
  "What happened today?",
  "Explain AI news",
  "India today",
  "World news",
  "Business updates",
];

export default function FinalCTA() {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleChipClick = (prompt: string) => {
    setInputValue(prompt);
  };

  return (
    <section className="py-28 bg-white">
      <div className="max-w-225 mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in duration-700">
          <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-6">
            Stop scrolling.
            <br />
            Start understanding.
          </h2>
          <p className="text-lg text-gray-600">
            Ask anything about today's news and get instant summaries,
            explanations, context, and trusted sources.
          </p>
        </div>

        {/* AI Prompt Input */}
        <div className="mb-8">
          <div
            className={`relative transition-all duration-300 ${
              isFocused ? "shadow-lg" : "shadow-md"
            }`}
          >
            <input
              type="text"
              placeholder="Ask about today's news..."
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

        {/* Quick Prompt Suggestions */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {quickPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handleChipClick(prompt)}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:-translate-y-0.5 transition-all duration-200"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Bottom Text */}
        <p className="text-center text-sm text-gray-500">
          Join thousands of readers who understand the news instead of just
          scrolling through it.
        </p>
      </div>
    </section>
  );
}
