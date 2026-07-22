import Link from "next/link";
import { TopicArticle as TopicArticleType } from "../../data/topicsData";

interface TopicArticleProps {
  article: TopicArticleType;
}

function getSourceLogoUrl(sourceWebsite: string) {
  return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(sourceWebsite)}&sz=64`;
}

export default function TopicArticle({ article }: TopicArticleProps) {
  return (
    <Link
      href={`/article/${article.id}`}
      className="group flex items-start gap-3 py-3 px-2 -mx-2 rounded-lg focus:outline-none"
    >
      <div className="min-w-0 flex-1">
        <h4 className="text-[16px] font-medium text-gray-900 mb-1 line-clamp-2 hover:underline decoration-gray-300 underline-offset-2 transition-colors">
          {article.headline}
        </h4>
        <div className="flex min-w-0 items-center gap-2 text-[13px] text-gray-500">
          <span className="flex min-w-0 items-center gap-1.5 font-medium text-gray-700">
            <img
              src={getSourceLogoUrl(article.sourceWebsite)}
              alt=""
              className="h-4 w-4 shrink-0 rounded-full object-cover"
            />
            <span className="truncate">{article.source}</span>
          </span>
          <span className="shrink-0">•</span>
          <span className="shrink-0">{article.time}</span>
        </div>
        {article.author && (
          <p className="text-[13px] text-gray-400 mt-1">{article.author}</p>
        )}
      </div>
      <span
        aria-hidden="true"
        className="h-16 w-16 shrink-0 rounded-md bg-cover bg-center"
        style={{ backgroundImage: `url(${article.image})` }}
      />
    </Link>
  );
}
