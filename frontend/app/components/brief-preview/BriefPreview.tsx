"use client";
import { useState, useEffect, useRef } from "react";
import { useTodaySummary } from "@/app/hooks/useTodaySummary";
import ArticleSourceButton from "./ArticleSourceButton";
import SourcesButton from "./SourcesButton";
import { SummaryItem } from "@/types/todaySummary";

export default function BriefPreview() {
  const { data, isLoading, error } = useTodaySummary();
  const [showSourcesPopup, setShowSourcesPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowSourcesPopup(false);
      }
    };

    if (showSourcesPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSourcesPopup]);

  // Extract unique sources from summary items
  const sources = data?.summary
    ?.filter((item: string | SummaryItem): item is SummaryItem => typeof item === 'object' && !!item.source_name)
    .map((item: SummaryItem) => {
      // Extract homepage URL from article URL
      const getHomepageUrl = (url: string) => {
        try {
          const urlObj = new URL(url);
          return `${urlObj.protocol}//${urlObj.hostname}/`;
        } catch {
          return url;
        }
      };
      
      const homepageUrl = getHomepageUrl(item.article_url);
      let hostname = '';
      try {
        hostname = new URL(homepageUrl).hostname;
      } catch {
        hostname = homepageUrl;
      }
      
      return {
        url: homepageUrl,
        name: item.source_name,
        hostname: hostname,
      };
    })
    // Deduplicate sources by URL
    .filter((source, index, self) => 
      index === self.findIndex(s => s.url === source.url)
    ) || [];

  return (
    <section id="brief-preview" className="py-12 sm:py-16">
      {/* Header */}
      <div className="mb-8 sm:mb-10 text-center">
        <h2 className="text-[26px] sm:text-[28px] md:text-[30px] font-semibold text-gray-900 mb-3">
          Today&apos;s Brief
        </h2>
        <p className="text-[14px] sm:text-[15px] md:text-[16px] text-gray-600">
          Understand today&apos;s biggest stories.
        </p>
      </div>

      {/* Hero Card */}
      <div className="bg-white border border-gray-200/50 rounded-lg sm:rounded-xl p-4 sm:p-6">
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
          <ul className="text-gray-700 text-sm leading-relaxed mb-2 sm:mb-3 space-y-2 sm:space-y-2.5">
            {data?.summary?.slice(0, 5).map((item: string | SummaryItem, index: number) => (
              <li key={index} className={`flex items-start gap-3 ${index === 0 ? 'mt-6' : ''}`}>
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

        {/* Footer with sources */}
        <div className="flex justify-end pt-2 sm:pt-3 relative">
          <div className="relative">
            {sources.length > 0 && (
              <SourcesButton 
                sources={sources} 
                onClick={() => setShowSourcesPopup(!showSourcesPopup)}
                isOpen={showSourcesPopup}
              />
            )}
            
            {/* Sources Popup - positioned above the button */}
            {showSourcesPopup && (
              <div 
                ref={popupRef}
                className="absolute bottom-full left-[30%] mb-2 p-3 bg-white/70 backdrop-blur-lg rounded-xl border border-gray-200 z-10 min-w-[200px] animate-in fade-in slide-in-from-bottom-2 duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-gray-900">News Sources</h3>
                  <span className="text-[10px] text-gray-500">{sources.length} sources</span>
                </div>
                <div className="space-y-1">
                  {sources.map((source, index) => (
                    <a
                      key={index}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors group"
                    >
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${new URL(source.url).hostname}&sz=24`}
                          alt={source.name}
                          className="w-4 h-4"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                          {source.name}
                        </div>
                        <div className="text-[10px] text-gray-500 truncate">
                          {new URL(source.url).hostname}
                        </div>
                      </div>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="14" 
                        height="14" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="text-gray-400 group-hover:text-blue-600 transition-colors shrink-0"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
