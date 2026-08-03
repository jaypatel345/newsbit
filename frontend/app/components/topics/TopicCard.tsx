"use client";
import Link from "next/link";
import { useCategoryNews } from "@/app/hooks/useCategoryNews";

interface TopicCardProps {
  category: string;
}

export default function TopicCard({ category }: TopicCardProps) {
  const { data: articles, isLoading, error } = useCategoryNews(category);
  console.log(articles);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
      {/* Header: Name with Arrow */}
      <Link
        href={`/explore?category=${category}`}
        className="flex items-center gap-2 mb-4 sm:mb-5 pb-3 border-b border-gray-200 group"
      >
        <h3 className="text-[17px] sm:text-[18px] md:text-[19px] font-semibold text-gray-900 capitalize">
          {category}
        </h3>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-gray-400 group-hover:text-gray-600 transition-colors"
        >
          <path d="M7.59 18.59L9 20l8-8-8-8-1.41 1.41L14.17 12" />
        </svg>
      </Link>

      {/* Articles List */}
      <div className="space-y-0.5 sm:space-y-1">
        {articles?.slice(0, 3).map((article: any) => (
          <Link
            key={article.id}
            href={`/explore?category=${category}`}
            className="flex gap-3 py-3 border-b border-gray-100 last:border-b-0 group"
          >
            {/* Left Image */}
            {article.image_url && (
              <img
                src={article.image_url}
                alt={article.title}
                className="w-20 h-20 rounded-xl object-cover shrink-0"
                onError={(e) => {
                  // Use a placeholder image when the original fails to load
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"%3E%3Crect fill="%23f3f4f6" width="80" height="80"/%3E%3Ctext fill="%239ca3af" font-family="Arial, sans-serif" font-size="10" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                }}
              />
            )}

            {/* Right Content */}
            <div className="flex-1 min-w-0">
              {/* Source */}
              <div className="flex items-center gap-2 mb-1">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${article.source_url}&sz=64`}
                  alt={article.source_name}
                  className="w-4 h-4 rounded-sm"
                />
                <span className="text-xs text-gray-500 truncate">
                  {article.source_name}
                </span>
              </div>

              {/* Title */}
              <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {article.title}
              </h4>

              {/* Published Date */}
              <p className="mt-2 text-xs text-gray-500">
                {new Date(article.published_at).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
