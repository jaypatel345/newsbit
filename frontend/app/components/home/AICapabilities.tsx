"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const prompts = [
  "Explain this article",
  "Why does this matter?",
  "Give me the timeline.",
  "Compare both sides.",
  "Explain like I'm 15.",
  "Summarize in 5 bullets.",
  "How does this affect India?",
  "Predict possible outcomes.",
  "Show related news.",
  "What happened before this?",
  "Who benefits from this?",
  "What could happen next?",
  "Find opposing viewpoints.",
  "Give me historical context.",
  "Explain the technical terms.",
  "What should I read next?",
];

const promptRows = Array.from({ length: 4 }, (_, rowIndex) =>
  prompts.slice(rowIndex * 4, rowIndex * 4 + 4),
);

export default function AICapabilities() {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const sendPrompt = (prompt: string) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;

    router.push(`/chat?prompt=${encodeURIComponent(trimmedPrompt)}`);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendPrompt(inputValue);
    }
  };

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8 max-w-3xl mx-auto text-center">
          <h2 className="text-[26px] sm:text-[28px] md:text-[30px] font-semibold text-gray-900 mb-3 sm:mb-4">
            Ask Newsbit anything.
          </h2>
          <p className="text-[14px] sm:text-[15px] md:text-[16px] text-gray-600">
            Go beyond reading the news. Ask follow-up questions, compare
            perspectives, understand context, and explore stories through
            conversation.
          </p>
        </div>

        {/* Prompt Suggestions */}
        <div className="mb-6 sm:mb-8 space-y-2 sm:space-y-3 overflow-hidden">
          {promptRows.map((row, rowIndex) => (
            <div key={rowIndex} className="overflow-hidden">
              <div
                className={`flex w-max gap-3 ${
                  rowIndex % 2 === 0
                    ? "animate-prompt-slide-left"
                    : "animate-prompt-slide-right"
                }`}
              >
                {[...row, ...row].map((prompt, promptIndex) => (
                  <button
                    key={`${rowIndex}-${promptIndex}`}
                    type="button"
                    onClick={() => sendPrompt(prompt)}
                    className="w-40 sm:w-48 md:w-56 lg:w-64 shrink-0 rounded-[2rem] sm:rounded-[2.5rem] border border-gray-200 bg-white px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-center text-[11px] sm:text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  >
                    <span className="block truncate">{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-[14px] sm:text-[15px] md:text-[16px] text-gray-600 mb-3 sm:mb-4">
            Or ask your own question.
          </p>
          <div className="w-full max-w-160 mx-auto px-2 sm:px-0">
            <div
              className={`flex items-center gap-2 rounded-2xl border bg-white shadow-md ${
                isFocused ? "border-gray-300 shadow-lg" : "border-gray-200"
              }`}
            >
              <input
                type="text"
                placeholder="Ask about today's news..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                className="h-12 sm:h-14 flex-1 bg-transparent px-4 sm:px-6 text-sm sm:text-base text-black placeholder:text-gray-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => sendPrompt(inputValue)}
                disabled={!inputValue.trim()}
                className={`mr-2 flex h-9 w-9 items-center justify-center rounded-full ${
                  inputValue.trim()
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
