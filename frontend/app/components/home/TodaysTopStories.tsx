import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTopStories } from "@/app/services/news.service";
import { formatDistanceToNow } from "date-fns";

const topStories = await getTopStories();

function getSourceLogoUrl(sourceWebsite: string) {
  return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(sourceWebsite)}&sz=64`;
}
export function getRelativeTime(dateString: string) {
  return formatDistanceToNow(new Date(dateString), {
    addSuffix: true,
  });
}

export default function TodaysTopStories() {
  return (
    <section className="py-24">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-[30px] font-semibold text-gray-900 mb-4">
          Top Stories
        </h2>
        <p className="text-[16px] text-gray-600">
          AI-selected stories worth your attention today.
        </p>
      </div>

      {/* Stories Grid - 2 columns with 3 items each */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Left Column */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6">
          {topStories.slice(0, 3).map((story, index) => (
            <div
              key={story.id}
              className={`${index !== 2 ? "pb-6 border-b border-gray-100 mb-6" : ""}`}
            >
              <div className="flex gap-4">
                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Source */}
                  <p className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-900 ">
                    <img
                      src={getSourceLogoUrl(story.domain)}
                      alt=""
                      className="h-5 w-5 rounded-full object-cover"
                    />

                    {story.source_name}
                  </p>

                  {/* Headline */}
                  <Link href="/brief" className="block">
                    <h3 className="text-[16px] font-medium text-gray-900 mb-2 line-clamp-2 hover:underline decoration-gray-300 underline-offset-2 transition-colors">
                      {story.title}
                    </h3>
                  </Link>

                  {/* Time and Author */}
                  <div className="flex items-center gap-2 text-[12px] text-gray-500">
                    <span className="shrink-0">
                      {getRelativeTime(story.published_at)}
                    </span>

                    {story.author && (
                      <span className="max-w-40 truncate" title={story.author}>
                        • {story.author}
                      </span>
                    )}
                  </div>
                </div>

                {/* Image */}
                <div className="flex w-32 shrink-0">
                  <img
                    src={story.image_url}
                    alt={story.summary}
                    className="w-32 h-24 object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="bg-white border border-gray-200 rounded-[2.5rem] p-6">
          {topStories.slice(3, 6).map((story, index) => (
            <div
              key={story.id}
              className={`${index !== 2 ? "pb-6 border-b border-gray-100 mb-6" : ""}`}
            >
              <div className="flex gap-4">
                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Source */}
                  <p className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-900">
                    <img
                      src={getSourceLogoUrl(story.domain)}
                      alt=""
                      className="h-5 w-5 rounded-full object-cover"
                    />
                    {story.source_name}
                  </p>

                  {/* Headline */}
                  <Link href="/brief" className="block">
                    <h3 className="text-[16px] font-medium text-gray-900 mb-2 line-clamp-2 hover:underline decoration-gray-300 underline-offset-2 transition-colors">
                      {story.title}
                    </h3>
                  </Link>

                  {/* Time and Author */}
                  <div className="flex items-center gap-2 text-[12px] text-gray-500">
                    <span>{getRelativeTime(story.published_at)}</span>
                    {story.author && <span>• {story.author}</span>}
                  </div>
                </div>

                {/* Image */}
                <div className="flex w-32 shrink-0">
                  <img
                    src={story.image_url}
                    alt={story.url}
                    className="w-32 h-24 object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View All Button */}
      <div className="text-center">
        <Link
          href="/brief"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          View All Top Stories
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
