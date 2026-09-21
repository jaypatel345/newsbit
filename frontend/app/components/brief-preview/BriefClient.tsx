// app/brief/BriefClient.tsx
"use client";
import { useEffect, useState } from "react";
import NavigationBar from "@/app/components/layout/NavigationBar";
import BriefHeader from "@/app/components/brief-preview/BriefHeader";
import ExecutiveSummaryCard from "@/app/components/brief-preview/ExecutiveSummaryCard";
import StoryGridCard from "@/app/components/brief-preview/StoryGridCard";
import AskAICTA from "@/app/components/brief-preview/AskAICTA";
import { useTopStories } from "@/app/hooks/useTopStories";

// Escapes "</" so story text from third-party sources can't break out of
// the JSON-LD <script> tag it's embedded in.
function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default function BriefClient() {
  const { data, isLoading, error } = useTopStories(0); // No delay for brief page
  const [highlightedId, setHighlightedId] = useState<number | null>(null);

  const itemListSchema =
    data && data.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Today's Top Stories - Newsbit AI",
          description:
            "AI-summarized top news stories for today, curated by Newsbit.",
          itemListElement: data.map((story, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: story.url,
            item: {
              "@type": "NewsArticle",
              headline: story.title,
              description: story.summary,
              ...(story.image_url ? { image: story.image_url } : {}),
              ...(story.published_at
                ? { datePublished: story.published_at }
                : {}),
              author: {
                "@type": "Organization",
                name: story.source_name,
              },
              publisher: {
                "@type": "Organization",
                name: story.source_name,
              },
              url: story.url,
              mainEntityOfPage: story.url,
            },
          })),
        }
      : null;

  // Deep-link support: /brief#story-<id> (used when a specific article is
  // clicked elsewhere, e.g. the home page "Top Stories" list) scrolls to
  // and briefly highlights that story once the stories have loaded.
  useEffect(() => {
    if (isLoading || !data || data.length === 0) return;

    const match = window.location.hash.match(/^#story-(\d+)$/);
    if (!match) return;

    const targetId = Number(match[1]);
    const element = document.getElementById(`story-${targetId}`);
    if (!element) return;

    element.scrollIntoView({ behavior: "smooth", block: "start" });
    const frame = requestAnimationFrame(() => setHighlightedId(targetId));
    const timeout = setTimeout(() => setHighlightedId(null), 2500);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
    };
  }, [isLoading, data]);

  return (
    <div className="min-h-screen bg-white">
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListSchema) }}
        />
      )}
      <NavigationBar />
      <main className="pt-24 pb-12 sm:pt-28 sm:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header */}
          {/* <BriefHeader updatedTime="8:00 AM" storyCount={10} readTime="2 min" /> */}

          {/* Divider */}
          {/* <div className="mb-12 border-t border-gray-200"></div> */}

          {/* Executive Summary */}
          {/* <ExecutiveSummaryCard /> */}

          {/* Divider */}
          {/* <div className="mb-12 border-t border-gray-200"></div> */}

          {/* Top Stories Heading */}
          <div className="mb-6 sm:mb-8 text-center">
            <h1 className="text-[26px] sm:text-[28px] md:text-[30px] font-semibold text-gray-900 mb-3">
              Top Stories
            </h1>
            <p className="text-[14px] sm:text-[15px] md:text-[16px] text-gray-500">
              Today&apos;s most important stories, summarized by AI.
            </p>
          </div>

          {isLoading ? (
            <div className="mb-12 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-gray-200 overflow-hidden animate-pulse"
                >
                  <div className="flex gap-4 p-5">
                    <div className="flex-1 space-y-3">
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </div>
                    <div className="w-28 sm:w-32 h-24 bg-gray-200 rounded-xl shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Unable to load stories at this time.</p>
            </div>
          ) : (
            <div className="mb-12 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {data?.map((story, index) => (
                <div
                  key={story.id}
                  id={`story-${story.id}`}
                  className={`scroll-mt-24 sm:scroll-mt-28 rounded-2xl transition-shadow duration-700 ${
                    highlightedId === story.id
                      ? "ring-2 ring-offset-2 ring-gray-900/40"
                      : ""
                  }`}
                >
                  <StoryGridCard
                    id={story.id}
                    storyNumber={index + 1}
                    category={story.category}
                    headline={story.title}
                    publishedTime={story.published_at}
                    summary={story.summary}
                    source={story.source_name}
                    sourceWebsite={story.domain}
                    image={story.image_url}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Ask AI CTA */}
          {/* <AskAICTA /> */}
        </div>
      </main>
    </div>
  );
}
