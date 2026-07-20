"use client";
import { useState } from "react";
import Link from "next/link";
import { Sparkles, Send, ArrowRight } from "lucide-react";

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
];

export default function AICapabilities() {
  const [inputValue, setInputValue] = useState("");

  return (
    <section className="py-28 bg-white">
      <div className="max-w-300 mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-medium text-blue-600 mb-4">
            AI Capabilities
          </span>
          <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-6">
            Ask Newsbit anything.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Go beyond reading the news. Ask follow-up questions, compare
            perspectives, understand context, and explore stories through
            conversation.
          </p>
        </div>

        {/* Prompt Suggestions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
          {prompts.map((prompt, index) => (
            <Link
              key={index}
              href={`/chat?prompt=${encodeURIComponent(prompt)}`}
              className="group flex items-center gap-3 px-5 py-4 bg-white border border-gray-200 rounded-full hover:-translate-y-0.5 hover:shadow-md hover:border-blue-300 transition-all duration-300 cursor-pointer"
            >
              <Sparkles size={16} className="text-blue-600 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 truncate">
                {prompt}
              </span>
              <ArrowRight
                size={16}
                className="text-gray-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all duration-300 flex-shrink-0"
              />
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-gray-600 mb-6">Or ask your own question.</p>
          <div className="max-w-xl mx-auto">
            <div className="relative shadow-md">
              <input
                type="text"
                placeholder="Ask about today's news..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full h-16 px-6 pr-14 bg-white border border-gray-200 rounded-2xl text-base focus:outline-none focus:shadow-lg transition-all duration-300 placeholder:text-gray-400"
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
        </div>
      </div>
    </section>
  );
}
