"use client";

import { useState } from "react";
import StoryCard from "@/app/components/brief-preview/StoryCard";
import { useCategories } from "@/app/hooks/useCategories";
import { Article } from "@/types/article";
import { useCategoryNews } from "@/app/hooks/useCategoryNews";
import { useEffect } from "react";

interface ExploreClientProps {
  initialCategories: string[];
  initialArticles: Article[];
  initialCategory: string;
}

export default function ExploreClient({
  initialCategories,
  initialArticles,
  initialCategory,
}: ExploreClientProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const { data: categories = [] } = useCategories(initialCategories);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  const {
    data: articles = [],
    isLoading,
    error,
  } = useCategoryNews(
    selectedCategory === "all" ? "top" : selectedCategory,
    selectedCategory === initialCategory ? initialArticles : undefined
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-12">
      {/* Category Navigation Row */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((topic: string) => (
            <button
              key={topic}
              onClick={() => setSelectedCategory(topic)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap cursor-pointer  ${
                selectedCategory === topic
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Category Header */}
      {/* <div className="mb-8">
          <div>
            <h1 className="text-[30px] font-semibold text-gray-900">
              {selectedCategory}
            </h1>

            <p className="text-[16px] text-gray-600">
              Latest news and updates in {selectedCategory.toLowerCase()}.
            </p>
          </div>
        </div> */}

      {/* Articles Grid */}
      <div className="mb-12 rounded-3xl border border-gray-200 p-6">
        {isLoading ? (
          <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center">
              <div className="h-10 w-10 mx-auto rounded-full border-4 border-gray-300 border-t-black animate-spin" />

              <p className="mt-4 text-gray-600 text-sm">Loading...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">Error loading articles</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              No articles found for this category
            </p>
          </div>
        ) : (
          articles.map((article: Article, index: number) => (
            <div key={article.id}>
              <StoryCard
                storyNumber={index + 1}
                category={article.category}
                headline={article.title}
                publishedTime={article.published_at}
                summary={article.summary}
                whyItMatters={article.why_it_matters}
                source={article.source_name}
                sourceWebsite={article.url || article.url}
                image={article.image_url}
              />
              {index < articles.length - 1 && (
                <div className="border-t border-gray-200"></div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
