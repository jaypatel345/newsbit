"use client";

import { useState } from "react";
import NavigationBar from "@/app/components/layout/NavigationBar";
import Footer from "@/app/components/layout/Footer";
import StoryCard from "@/app/components/brief-preview/StoryCard";
import { useCategories } from "@/app/hooks/useCategories";
import { Article } from "@/types/article";
import { useCategoryNews } from "@/app/hooks/useCategoryNews";
import { useEffect } from "react";

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);
  const {
    data: articles = [],
    isLoading,
    error,
  } = useCategoryNews(selectedCategory === "all" ? "top" : selectedCategory);

  return (
    <div className="min-h-screen bg-white text-black">
      <NavigationBar />

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
            <div className="text-center py-12">
              <p className="text-gray-600">Loading articles...</p>
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

      <Footer />
    </div>
  );
}
