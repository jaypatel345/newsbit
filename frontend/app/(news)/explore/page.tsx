"use client";

import { useState } from "react";
import { topicsData } from "@/app/data/topicsData";
import Link from "next/link";
import NavigationBar from "@/app/components/layout/NavigationBar";
import Footer from "@/app/components/layout/Footer";
import { useCategory } from "@/app/hooks/useCategory";
import StoryCard from "@/app/components/brief-preview/StoryCard";

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const {
    data: categoryData,
    isLoading,
    error,
  } = useCategory(selectedCategory === "all" ? "" : selectedCategory);

  const selectedTopic =
    selectedCategory === "all"
      ? null
      : topicsData.find((t) => t.id === selectedCategory);

  return (
    <div className="min-h-screen bg-white text-black">
      <NavigationBar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        {/* Category Navigation Row */}
        <div className="mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap cursor-pointer ${
                selectedCategory === "all"
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All
            </button>
            {topicsData.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setSelectedCategory(topic.id)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap cursor-pointer ${
                  selectedCategory === topic.id
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {topic.name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Category Header */}
        <div className="mb-8">
          {selectedCategory === "all" ? (
            <div>
              <h1 className="text-[30px] font-semibold text-gray-900 mb-2">
                Explore All Topics
              </h1>
              <p className="text-[16px] text-gray-600">
                Browse news from all categories
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{selectedTopic?.icon}</span>
              <div>
                <h1 className="text-[30px] font-semibold text-gray-900">
                  {selectedTopic?.name}
                </h1>
                <p className="text-[16px] text-gray-600">
                  Latest news and updates in {selectedTopic?.name.toLowerCase()}
                  .
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Articles Grid */}
        <div className="mb-12 rounded-3xl border border-gray-200 p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading articles...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Error loading articles</p>
            </div>
          ) : categoryData?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                No articles found for this category
              </p>
            </div>
          ) : (
            categoryData?.map((article: any, index: number) => (
              <div key={article.id}>
                <StoryCard
                  storyNumber={index + 1}
                  category={article.category}
                  headline={article.title}
                  publishedTime={article.published_at}
                  summary={article.summary}
                  whyItMatters={article.why_it_matters}
                  source={article.source_name}
                  sourceWebsite={article.source_url || article.url}
                  image={article.image_url}
                />
                {index < categoryData?.length - 1 && (
                  <div className="border-t border-gray-200"></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
