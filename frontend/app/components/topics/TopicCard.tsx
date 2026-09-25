"use client";
import Link from "next/link";
import { useCategoryNews } from "@/app/hooks/useCategoryNews";
import ArticleImage from "@/app/components/common/ArticleImage";
import { formatArticleTime } from "@/app/utils/formatTime";

interface TopicCardProps {
  category: string;
}

export default function TopicCard({ category }: TopicCardProps) {
  const { data: articles, isLoading, error } = useCategoryNews(category);

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-6">
      {/* Header: Name with Arrow */}
      <Link
        href={`/explore?category=${encodeURIComponent(category)}`}
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
            href={`/explore?category=${encodeURIComponent(category)}#article-${article.id}`}
            className="flex gap-3 py-3 border-b border-gray-100 last:border-b-0 group"
          >
            {/* Left Image */}
            <div className="w-20 h-20 rounded-xl shrink-0 bg-stone-100 overflow-hidden">
              <ArticleImage
                src={article.image_url}
                alt={article.title}
                domain={article.source_url ?? article.domain}
                className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              />
            </div>

            {/* Right Content */}
            <div className="flex-1 min-w-0">
              {/* Source */}
              <div className="flex items-center gap-1.5 mb-1">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${article.source_url}&sz=64`}
                  alt={article.source_name}
                  className="w-4 h-4 rounded-sm ring-1 ring-black/5"
                />
                <span className="text-xs font-semibold text-gray-700 truncate">
                  {article.source_name}
                </span>
              </div>

              {/* Title */}
              <h4 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-gray-600 transition-colors">
                {article.title}
              </h4>

              {/* Published Time */}
              <p className="mt-2 text-xs text-gray-400">
                {formatArticleTime(article.published_at)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
