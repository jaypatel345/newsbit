// app/brief/BriefClient.tsx
"use client";
import NavigationBar from "@/app/components/layout/NavigationBar";
import BriefHeader from "@/app/components/brief-preview/BriefHeader";
import ExecutiveSummaryCard from "@/app/components/brief-preview/ExecutiveSummaryCard";
import StoryCard from "@/app/components/brief-preview/StoryCard";
import AskAICTA from "@/app/components/brief-preview/AskAICTA";
import { useTopStories } from "@/app/hooks/useTopStories";

export default function BriefClient() {
  const { data, isLoading, error } = useTopStories();
  if (isLoading) {
    return <div>loading...</div>;
  }
  if (error) {
    return <div>Something went wrong.</div>;
  }
  return (
    <div className="min-h-screen bg-white">
      <NavigationBar />
      <main className="pt-24 pb-12 sm:pt-28 sm:pb-16">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          {/* Header */}
          <BriefHeader updatedTime="8:00 AM" storyCount={10} readTime="2 min" />

          {/* Divider */}
          <div className="mb-12 border-t border-gray-200"></div>

          {/* Executive Summary */}
          <ExecutiveSummaryCard />

          {/* Divider */}
          <div className="mb-12 border-t border-gray-200"></div>

          {/* Top Stories Heading */}
          <h2
            className="text-3xl font-semibold mb-8"
            style={{ color: "#1E1E1E" }}
          >
            Top Stories
          </h2>

          {/* Story Cards */}
          <div className="mb-12 rounded-3xl border border-gray-200 p-6">
            {data?.map((story, index) => (
              <div key={story.id}>
                <StoryCard
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
                {index < data?.length - 1 && (
                  <div className="border-t border-gray-200"></div>
                )}
              </div>
            ))}
          </div>

          {/* Ask AI CTA */}
          <AskAICTA />
        </div>
      </main>
    </div>
  );
}
