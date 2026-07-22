import { ArrowRight, Sparkles } from "lucide-react";

interface StoryCardProps {
  storyNumber: number;
  category: string;
  headline: string;
  publishedTime: string;
  summary: string;
  whyItMatters: string;
  source: string;
}

export default function StoryCard({
  storyNumber,
  category,
  headline,
  publishedTime,
  summary,
  whyItMatters,
  source,
}: StoryCardProps) {
  return (
    <div className="rounded-2xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB" }}>
      {/* Top Row: Story Number and Category */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium" style={{ color: "#8A6A3F" }}>
            #{storyNumber}
          </span>
          <span className="inline-block px-3 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: "#F3F4F6", color: "#1E1E1E" }}>
            {category}
          </span>
        </div>
        <span className="text-xs" style={{ color: "#9CA3AF" }}>
          {publishedTime}
        </span>
      </div>

      {/* Headline */}
      <h3 className="text-xl font-semibold mb-3" style={{ color: "#1E1E1E" }}>
        {headline}
      </h3>

      {/* AI Summary */}
      <p className="text-sm mb-4 leading-relaxed" style={{ color: "#5B4C3A" }}>
        {summary}
      </p>

      {/* Why It Matters */}
      <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}>
        <p className="text-xs font-medium mb-1" style={{ color: "#8A6A3F" }}>
          Why it matters
        </p>
        <p className="text-xs leading-relaxed" style={{ color: "#5B4C3A" }}>
          {whyItMatters}
        </p>
      </div>

      {/* Source */}
      <div className="mb-4 text-xs" style={{ color: "#9CA3AF" }}>
        Source: {source}
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-80" style={{ backgroundColor: "#F3F4F6", color: "#1E1E1E" }}>
          Read Original
        </button>
        <button className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-80 flex items-center justify-center gap-2" style={{ backgroundColor: "#8A6A3F", color: "#FFFFFF" }}>
          <Sparkles size={16} />
          Explain with AI
        </button>
      </div>
    </div>
  );
}
