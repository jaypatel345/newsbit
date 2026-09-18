"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import StoryGridCard from "@/app/components/brief-preview/StoryGridCard";
import { useCategories } from "@/app/hooks/useCategories";
import { Article } from "@/types/article";
import { useCategoryNews } from "@/app/hooks/useCategoryNews";

// Categories to exclude from display
const EXCLUDED_CATEGORIES = ["India", "Nation", "Other"];

interface ExploreClientProps {
  initialCategories?: string[];
  initialArticles?: Article[];
  initialCategory?: string;
}

export default function ExploreClient({
  initialCategories,
  initialArticles,
  initialCategory,
}: ExploreClientProps = {}) {
  // Deep-link support: /explore?category=<name> (e.g. from "Topics You May
  // Like" on the home page) opens straight into that category.
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category") || undefined;

  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory || categoryFromUrl || ""
  );
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const hasScrolledToHash = useRef(false);

  const { data: categories = [] } = useCategories(initialCategories);

  // Filter out excluded categories
  const filteredCategories = categories.filter(
    (category: string) => !EXCLUDED_CATEGORIES.includes(category)
  );

  useEffect(() => {
    if (filteredCategories.length === 0) return;
    // Keep the current selection if it's still a valid category (covers the
    // initial deep-linked category); otherwise fall back to the first one.
    if (selectedCategory && filteredCategories.includes(selectedCategory)) {
      return;
    }
    setSelectedCategory(filteredCategories[0]);
  }, [filteredCategories, selectedCategory]);

  const {
    data: articles = [],
    isLoading,
    error,
  } = useCategoryNews(
    selectedCategory === "all" ? "top" : selectedCategory,
    initialCategory && selectedCategory === initialCategory ? initialArticles : undefined
  );

  // Deep-link support: /explore?category=<c>#article-<id> scrolls to and
  // briefly highlights that specific article once it has loaded.
  useEffect(() => {
    if (hasScrolledToHash.current) return;
    if (isLoading || articles.length === 0) return;

    const match = window.location.hash.match(/^#article-(\d+)$/);
    if (!match) return;

    const targetId = Number(match[1]);
    const element = document.getElementById(`article-${targetId}`);
    if (!element) return;

    hasScrolledToHash.current = true;
    element.scrollIntoView({ behavior: "smooth", block: "start" });
    const frame = requestAnimationFrame(() => setHighlightedId(targetId));
    const timeout = setTimeout(() => setHighlightedId(null), 2500);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
    };
  }, [isLoading, articles]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-12">
      {/* Category Navigation Row */}
      <div className="mb-8 -mx-4 sm:mx-0">
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-hide px-4 sm:px-0">
          {filteredCategories.map((topic: string) => (
            <button
              key={topic}
              onClick={() => setSelectedCategory(topic)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap cursor-pointer shrink-0 ${
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
      {isLoading ? (
        <div className="mb-12 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
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
          <p className="text-red-600">Error loading articles</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No articles found for this category
          </p>
        </div>
      ) : (
        <div className="mb-12 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {articles.map((article: Article, index: number) => (
            <div
              key={article.id}
              id={`article-${article.id}`}
              className={`scroll-mt-24 sm:scroll-mt-28 rounded-2xl transition-shadow duration-700 ${
                highlightedId === article.id
                  ? "ring-2 ring-offset-2 ring-gray-900/40"
                  : ""
              }`}
            >
              <StoryGridCard
                id={article.id}
                storyNumber={index + 1}
                category={article.category}
                headline={article.title}
                publishedTime={article.published_at}
                summary={article.summary}
                source={article.source_name}
                sourceWebsite={article.url || article.url}
                image={article.image_url}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
