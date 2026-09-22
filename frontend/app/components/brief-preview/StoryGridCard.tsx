"use client";
import { useRouter } from "next/navigation";
import ArticleImage from "@/app/components/common/ArticleImage";
import ListenButton from "@/app/components/common/ListenButton";
import { getArticleAudioUrl } from "@/app/services/audio.service";
import { formatArticleTime } from "@/app/utils/formatTime";

interface StoryGridCardProps {
  id: number;
  storyNumber: number;
  category: string;
  headline: string;
  publishedTime: string;
  summary: string;
  source: string;
  sourceWebsite: string;
  image?: string;
}

/**
 * Compact secondary-story tile used in the Top Stories grid (everything
 * after the featured lead story). Whole card opens Ask AI for the article;
 * the source link and Listen button stop propagation to stay independently
 * clickable.
 */
export default function StoryGridCard({
  id,
  storyNumber,
  category,
  headline,
  publishedTime,
  summary,
  source,
  sourceWebsite,
  image,
}: StoryGridCardProps) {
  const router = useRouter();
  const getSourceLogoUrl = (website: string) => {
    return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(website)}&sz=64`;
  };

  return (
    <div
      onClick={() => router.push(`/chat?articleId=${id}`)}
      className="h-full flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden cursor-pointer"
    >
      {/* Top: details on the left, image on the right */}
      <div className="flex-1 flex items-start gap-4 p-5">
        {/* Left: details */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium" style={{ color: "#8A6A3F" }}>
              #{storyNumber}
            </span>
            <span
              className="inline-block w-fit px-2.5 py-1 rounded-lg text-xs font-medium"
              style={{ backgroundColor: "#F3F4F6", color: "#1E1E1E" }}
            >
              {category}
            </span>
          </div>

          <h3
            className="text-base font-semibold mb-2 leading-snug line-clamp-2"
            style={{ color: "#1E1E1E" }}
          >
            {headline}
          </h3>

          <p
            className="text-sm leading-relaxed line-clamp-2"
            style={{ color: "#5B4C3A" }}
          >
            {summary}
          </p>
        </div>

        {/* Right: image */}
        <div className="w-28 sm:w-32 aspect-square shrink-0 rounded-xl overflow-hidden bg-gray-100">
          <ArticleImage
            src={image}
            alt={headline}
            domain={sourceWebsite}
            className="w-full h-full object-cover bg-gray-100"
          />
        </div>
      </div>

      {/* Bottom row */}
      <div className="mt-auto flex items-center justify-between gap-2 px-5 pb-5">
        <div className="flex items-center gap-1.5 min-w-0 text-xs">
          <a
            href={sourceWebsite}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 font-medium text-gray-900 hover:underline decoration-gray-300 underline-offset-2 transition-colors min-w-0"
          >
            <img
              src={getSourceLogoUrl(sourceWebsite)}
              alt=""
              className="h-4 w-4 rounded-full object-cover shrink-0"
            />
            <span className="truncate">{source}</span>
          </a>
          <span style={{ color: "#9CA3AF" }}>&middot;</span>
          <span
            className="shrink-0"
            style={{ color: "#9CA3AF" }}
            suppressHydrationWarning
          >
            {formatArticleTime(publishedTime)}
          </span>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <ListenButton src={getArticleAudioUrl(id)} label="summary" variant="icon" />
        </div>
      </div>
    </div>
  );
}
