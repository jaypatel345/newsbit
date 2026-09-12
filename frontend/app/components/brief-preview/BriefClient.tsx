// app/brief/BriefClient.tsx
"use client";
import { useEffect, useState } from "react";
import NavigationBar from "@/app/components/layout/NavigationBar";
import BriefHeader from "@/app/components/brief-preview/BriefHeader";
import ExecutiveSummaryCard from "@/app/components/brief-preview/ExecutiveSummaryCard";
import StoryCard from "@/app/components/brief-preview/StoryCard";
import AskAICTA from "@/app/components/brief-preview/AskAICTA";
import { useTopStories } from "@/app/hooks/useTopStories";

export default function BriefClient() {
  const { data, isLoading, error } = useTopStories(0); // No delay for brief page
  const [highlightedId, setHighlightedId] = useState<number | null>(null);

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
      <NavigationBar />
      <main className="pt-24 pb-12 sm:pt-28 sm:pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          {/* Header */}
          {/* <BriefHeader updatedTime="8:00 AM" storyCount={10} readTime="2 min" /> */}

          {/* Divider */}
          {/* <div className="mb-12 border-t border-gray-200"></div> */}

          {/* Executive Summary */}
          {/* <ExecutiveSummaryCard /> */}

          {/* Divider */}
          {/* <div className="mb-12 border-t border-gray-200"></div> */}

          {/* Top Stories Heading */}
          <h2
            className="text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8"
            style={{ color: "#1E1E1E" }}
          >
            Top Stories
          </h2>

          {/* Story Cards */}
          <div className="mb-12 rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-6">
            {isLoading ? (
              // Skeleton loading state
              Array.from({ length: 10 }).map((_, index) => (
                <div key={index}>
                  <div className="animate-pulse">
                    <div className="flex gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 bg-gray-300 rounded-full" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-gray-200 rounded" />
                      <div className="h-4 bg-gray-200 rounded" />
                      <div className="h-4 bg-gray-200 rounded w-5/6" />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="h-3 bg-gray-200 rounded w-1/4 mb-2" />
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded" />
                        <div className="h-3 bg-gray-200 rounded w-5/6" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-gray-200 rounded-full" />
                      <div className="h-4 bg-gray-200 rounded w-24" />
                    </div>
                  </div>
                  {index < 9 && <div className="border-t border-gray-200 my-6" />}
                </div>
              ))
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Unable to load stories at this time.</p>
              </div>
            ) : (
              data?.map((story, index) => (
                <div key={story.id}>
                  <div
                    id={`story-${story.id}`}
                    className={`scroll-mt-24 sm:scroll-mt-28 rounded-2xl transition-shadow duration-700 ${
                      highlightedId === story.id
                        ? "ring-2 ring-offset-2 ring-gray-900/40"
                        : ""
                    }`}
                  >
                    <StoryCard
                      id={story.id}
                      storyNumber={index + 1}
                      category={story.category}
                      headline={story.title}
                      publishedTime={story.published_at}
                      summary={story.summary}
                      whyItMatters={story.why_it_matters}
                      source={story.source_name}
                      sourceWebsite={story.domain}
                      image={story.image_url}
                    />
                  </div>
                  {index < data?.length - 1 && (
                    <div className="border-t border-gray-200"></div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Ask AI CTA */}
          {/* <AskAICTA /> */}
        </div>
      </main>
    </div>
  );
}
