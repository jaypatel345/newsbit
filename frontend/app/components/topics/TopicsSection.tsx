"use client";
import { useCategories } from "@/app/hooks/useCategories";
import TopicCard from "./TopicCard";

export default function TopicsSection() {
  const { data: categories, isLoading, error } = useCategories();

  return (
    <section className="py-8 sm:py-12">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center">
        <h2 className="text-[26px] sm:text-[28px] md:text-[30px] font-semibold text-gray-900 mb-3 sm:mb-4">
          Topics You May Like
        </h2>
        <p className="text-[14px] sm:text-[15px] md:text-[16px] text-gray-600">
          Explore today's news by category.
        </p>
      </div>

      {/* Topics Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 animate-pulse">
              <div className="h-6 w-20 bg-gray-200 rounded mb-3" />
              <div className="h-4 w-full bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">Error loading categories</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {categories?.slice(0, 9).map((category: string) => (
            <TopicCard key={category} category={category} />
          ))}
        </div>
      )}
    </section>
  );
}
