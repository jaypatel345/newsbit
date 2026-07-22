import { ArrowRight, Sparkles } from "lucide-react";

interface AskAICTAProps {
  suggestions?: string[];
}

export default function AskAICTA({
  suggestions = [
    "Explain today&apos;s market rally",
    "Summarize AI news",
    "What happened in India today?",
    "Why is this important?",
    "Give me a 30-second summary",
  ],
}: AskAICTAProps) {
  return (
    <div className="rounded-2xl p-8 shadow-sm text-center" style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}>
      {/* Icon */}
      <div className="mb-4 flex justify-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#8A6A3F" }}>
          <Sparkles size={24} style={{ color: "#FFFFFF" }} />
        </div>
      </div>

      {/* Heading */}
      <h2 className="text-2xl font-semibold mb-3" style={{ color: "#1E1E1E" }}>
        Want to understand today&apos;s news even better?
      </h2>

      {/* Description */}
      <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "#5B4C3A" }}>
        Ask our AI any question about today&apos;s stories. Get instant explanations, connections between events, and deeper insights.
      </p>

      {/* CTA Button */}
      <button className="px-8 py-3 rounded-xl font-medium transition-all duration-200 hover:opacity-80 flex items-center gap-2 mx-auto mb-6" style={{ backgroundColor: "#8A6A3F", color: "#FFFFFF" }}>
        Ask AI
        <ArrowRight size={18} />
      </button>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", color: "#1E1E1E" }}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
