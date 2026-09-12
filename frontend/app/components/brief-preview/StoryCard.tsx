"use client";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import ArticleImage from "@/app/components/common/ArticleImage";

interface StoryCardProps {
  id: number;
  storyNumber: number;
  category: string;
  headline: string;
  publishedTime: string;
  summary: string;
  whyItMatters: string;
  source: string;
  sourceWebsite: string;
  image?: string;
}

export default function StoryCard({
  id,
  storyNumber,
  category,
  headline,
  publishedTime,
  summary,
  whyItMatters,
  source,
  sourceWebsite,
  image,
}: StoryCardProps) {
  const router =useRouter();
  const sendArticleId = () => {
    router.push(`/chat?articleId=${id}`)
  }
  const getSourceLogoUrl = (website: string) => {
    return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(website)}&sz=64`;
  };
  return (
    <div className="py-6">
      {/* Top Row: Image and Content */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {/* Left Image */}
        <div className="w-full sm:w-70 md:w-[320px] sm:shrink-0">
          <ArticleImage
            src={image}
            alt={headline}
            domain={sourceWebsite}
            className="w-full h-48 sm:h-40 md:h-45 object-cover rounded-xl bg-gray-100"
          />
        </div>

        {/* Right Content */}
        <div className="flex-1 min-w-0">
          {/* Story Number and Category */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-medium" style={{ color: "#8A6A3F" }}>
              #{storyNumber}
            </span>
            <span
              className="inline-block px-3 py-1 rounded-lg text-xs font-medium"
              style={{ backgroundColor: "#F3F4F6", color: "#1E1E1E" }}
            >
              {category}
            </span>
          </div>

          {/* Headline */}
          <h3
            className="text-lg sm:text-xl font-semibold mb-2 break-words"
            style={{ color: "#1E1E1E" }}
          >
            {headline}
          </h3>

          {/* AI Summary */}
          <p className="text-sm leading-relaxed break-words" style={{ color: "#5B4C3A" }}>
            {summary}
          </p>
        </div>
      </div>

      {/* Middle Row: Why It Matters */}
      <div
        className="mb-4 p-3 rounded-xl"
        style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}
      >
        <p className="text-xs font-medium mb-1" style={{ color: "#8A6A3F" }}>
          Why it matters
        </p>
        <p className="text-xs leading-relaxed break-words" style={{ color: "#5B4C3A" }}>
          {whyItMatters}
        </p>
      </div>

      {/* Bottom Row: Source and Ask AI Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Source with Link */}
        <a
          href={sourceWebsite}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:underline decoration-gray-300 underline-offset-2 transition-colors min-w-0"
        >
          <img
            src={getSourceLogoUrl(sourceWebsite)}
            alt=""
            className="h-5 w-5 rounded-full object-cover shrink-0"
          />
          <span className="truncate">{source}</span>
        </a>

        {/* Right: Ask AI Button */}

        <button onClick={sendArticleId} className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-80 bg-gray-900 text-white flex items-center gap-2 cursor-pointer shrink-0">
          Ask AI
          <ArrowRight size={16} />
        </button>

      </div>
    </div>
  );
}
