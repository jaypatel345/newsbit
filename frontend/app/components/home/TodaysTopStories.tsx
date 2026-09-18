"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTopStories } from "@/app/hooks/useTopStories";
import { formatArticleTime } from "@/app/utils/formatTime";
import ArticleImage from "@/app/components/common/ArticleImage";

function getSourceLogoUrl(sourceWebsite: string) {
  return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(sourceWebsite)}&sz=64`;
}

export default function TodaysTopStories() {
  const { data: topStories, isLoading, error } = useTopStories(0); // No delay for optimal performance

  return (
    <section className="py-24 sm:py-32 md:py-40">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center">
        <h2 className="text-[26px] sm:text-[28px] md:text-[30px] font-semibold text-gray-900 mb-3 sm:mb-4">
          Top Stories
        </h2>
        <p className="text-[14px] sm:text-[15px] md:text-[16px] text-gray-600">
          AI-selected stories worth your attention today.
        </p>
      </div>

      {/* Stories Grid - 2 columns with 3 items each */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {[1, 2].map((col) => (
            <div key={col} className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-6">
              {[1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`${index !== 3 ? "pb-4 sm:pb-6 border-b border-gray-100 mb-4 sm:mb-6" : ""}`}
                >
                  <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 w-full">
                    {/* Image Skeleton */}
                    <div className="w-full lg:w-32 lg:shrink-0 mb-3 lg:mb-0">
                      <div className="w-full h-40 lg:w-32 lg:h-24 bg-gray-200 rounded-lg animate-pulse" />
                    </div>

                    {/* Content Skeleton */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                      <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : error || !topStories ? (
        <div className="text-center">
          <div className="text-gray-500">Unable to load top stories at this time.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Left Column */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-6">
            {topStories.slice(0, 3).map((story, index) => (
              <Link
                key={story.id}
                href={`/brief#story-${story.id}`}
                className={`group block ${index !== 2 ? "pb-4 sm:pb-6 border-b border-gray-100 mb-4 sm:mb-6" : ""}`}
              >
                <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 w-full">
                  {/* Image */}
                  <div className="w-full lg:w-32 lg:shrink-0 mb-3 lg:mb-0 overflow-hidden rounded-xl">
                    <ArticleImage
                      src={story.image_url}
                      alt={story.title}
                      domain={story.domain}
                      className="w-full h-40 lg:w-32 lg:h-24 object-cover bg-gray-100 transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Source */}
                    <p className="mb-1.5 flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-700">
                      <img
                        src={getSourceLogoUrl(story.domain)}
                        alt=""
                        className="h-4 w-4 sm:h-5 sm:w-5 rounded-full object-cover ring-1 ring-black/5"
                      />

                      {story.source_name}
                    </p>

                    {/* Headline */}
                    <h3 className="text-[14px] sm:text-[15px] md:text-[16px] font-semibold text-gray-900 mb-2 leading-snug line-clamp-2 group-hover:text-gray-600 transition-colors">
                      {story.title}
                    </h3>

                    {/* Time and Author */}
                    <div className="flex items-center gap-2 text-[11px] sm:text-[12px] text-gray-400">
                      <span className="shrink-0">
                        {formatArticleTime(story.published_at)}
                      </span>

                      {story.author && (
                        <span className="max-w-32 sm:max-w-40 truncate" title={story.author}>
                          · {story.author}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Right Column */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-6">
            {topStories.slice(3, 6).map((story, index) => (
              <Link
                key={story.id}
                href={`/brief#story-${story.id}`}
                className={`group block ${index !== 2 ? "pb-4 sm:pb-6 border-b border-gray-100 mb-4 sm:mb-6" : ""}`}
              >
                <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 w-full">
                  {/* Image */}
                  <div className="w-full lg:w-32 lg:shrink-0 mb-3 lg:mb-0 overflow-hidden rounded-xl">
                    <ArticleImage
                      src={story.image_url}
                      alt={story.title}
                      domain={story.domain}
                      className="w-full h-40 lg:w-32 lg:h-24 object-cover bg-gray-100 transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Source */}
                    <p className="mb-1.5 flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-700">
                      <img
                        src={getSourceLogoUrl(story.domain)}
                        alt=""
                        className="h-4 w-4 sm:h-5 sm:w-5 rounded-full object-cover ring-1 ring-black/5"
                      />
                      {story.source_name}
                    </p>

                    {/* Headline */}
                    <h3 className="text-[14px] sm:text-[15px] md:text-[16px] font-semibold text-gray-900 mb-2 leading-snug line-clamp-2 group-hover:text-gray-600 transition-colors">
                      {story.title}
                    </h3>

                    {/* Time and Author */}
                    <div className="flex items-center gap-2 text-[11px] sm:text-[12px] text-gray-400">
                      <span>{formatArticleTime(story.published_at)}</span>
                      {story.author && <span>· {story.author}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* View All Button */}
      <div className="text-center">
        <Link
          href="/brief"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          View All Top Stories
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
