"use client";
import { useState } from "react";
import { useTodaySummary } from "@/app/hooks/useTodaySummary";
import ArticleSourceButton from "./ArticleSourceButton";
import SourcesButton from "./SourcesButton";
import { SummaryItem } from "@/types/todaySummary";

export default function BriefPreview() {
  const { data, isLoading, error } = useTodaySummary();
  const [showSourcesPopup, setShowSourcesPopup] = useState(false);

  // Extract unique sources from summary items
  const sources = data?.summary
    ?.filter((item: string | SummaryItem): item is SummaryItem => typeof item === 'object' && item.source_name)
    .map((item: SummaryItem) => ({
      url: item.article_url,
      name: item.source_name,
    })) || [];

  return (
    <section id="brief-preview" className="py-8 sm:py-12">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center">
        <h2 className="text-[26px] sm:text-[28px] md:text-[30px] font-semibold text-gray-900 mb-3">
          Today&apos;s Brief
        </h2>
        <p className="text-[14px] sm:text-[15px] md:text-[16px] text-gray-600">
          Understand today&apos;s biggest stories.
        </p>
      </div>

      {/* Hero Card */}
      <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
        {/* Preview Text - Bullet Points */}
        {isLoading ? (
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-gray-200 mt-0.5 shrink-0 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-gray-500">Unable to load brief at this time.</div>
        ) : (
          <ul className="text-gray-700 text-sm leading-relaxed mb-4 sm:mb-6 space-y-2 sm:space-y-2.5">
            {data?.summary?.slice(0, 5).map((item: string | SummaryItem, index: number) => (
              <li key={index} className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-900 mt-0.5 shrink-0"
                >
                  <circle cx="12" cy="12" r="6" />
                </svg>
                <div className="flex-1">
                  <span>{typeof item === 'string' ? item : item.text}</span>
                  {typeof item === 'object' && item.article_url && item.source_name && (
                    <ArticleSourceButton articleUrl={item.article_url} sourceName={item.source_name} />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Footer with metadata and sources */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 pt-3 sm:pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="font-medium text-gray-700">10 stories</span>
          </div>
          {sources.length > 0 && (
            <SourcesButton sources={sources} showPopup={showSourcesPopup} onTogglePopup={() => setShowSourcesPopup(!showSourcesPopup)} />
          )}
        </div>

        {/* Sources Popup */}
        {showSourcesPopup && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="space-y-1">
              {sources.map((source, index) => (
                <a
                  key={index}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <ArticleSourceButton articleUrl={source.url} sourceName={source.name} showText={true} />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
