import Link from "next/link";
import { Topic as TopicType } from "../../data/topicsData";
import TopicArticle from "./TopicArticle";

interface TopicCardProps {
  topic: TopicType;
}

export default function TopicCard({ topic }: TopicCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
      {/* Header: Name with Arrow */}
      <Link
        href={`/explore/${topic.id}`}
        className="flex items-center gap-2 mb-4 sm:mb-5 pb-3 border-b border-gray-200 group"
      >
        <h3 className="text-[17px] sm:text-[18px] md:text-[19px] font-semibold text-gray-900">
          {topic.name}
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
        {topic.articles.map((article) => (
          <TopicArticle key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
