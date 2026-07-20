import Link from "next/link";
import { Bookmark } from "lucide-react";

const topStories = [
  {
    id: 1,
    category: "AI",
    headline: "OpenAI Announces GPT-5 with Enhanced Reasoning Capabilities",
    summary:
      "The latest iteration of OpenAI's language model shows significant improvements in complex reasoning tasks and multi-step problem solving.",
    source: "TechCrunch",
    time: "15 min ago",
  },
  {
    id: 2,
    category: "Business",
    headline: "Global Markets Rally as Fed Signals Potential Rate Cuts",
    summary:
      "Stock markets worldwide surge following Federal Reserve indications that interest rate reductions may be on the horizon.",
    source: "Bloomberg",
    time: "32 min ago",
  },
  {
    id: 3,
    category: "World",
    headline: "Climate Summit Reaches Historic Agreement on Carbon Emissions",
    summary:
      "World leaders commit to ambitious new targets for reducing carbon emissions by 2030 in landmark international agreement.",
    source: "Reuters",
    time: "1 hour ago",
  },
  {
    id: 4,
    category: "Technology",
    headline: "Apple Unveils Revolutionary AR Glasses at Developer Conference",
    summary:
      "The tech giant introduces augmented reality glasses that promise to seamlessly blend digital content with the real world.",
    source: "The Verge",
    time: "2 hours ago",
  },
  {
    id: 5,
    category: "India",
    headline: "India's GDP Growth Exceeds Expectations at 7.2%",
    summary:
      "Strong performance in manufacturing and services sectors drives economic growth beyond analyst predictions.",
    source: "Economic Times",
    time: "3 hours ago",
  },
  {
    id: 6,
    category: "Science",
    headline: "Scientists Discover New Method for Carbon Capture Using Algae",
    summary:
      "Breakthrough research shows promise for scalable carbon dioxide removal using genetically modified algae strains.",
    source: "Nature",
    time: "4 hours ago",
  },
];

export default function TodaysTopStories() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-300 mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-4">
            Today's Top Stories
          </h2>
          <p className="text-lg text-gray-600">
            AI-selected stories worth your attention today.
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topStories.map((story) => (
            <div
              key={story.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer group"
            >
              {/* Top Row: Category and Bookmark */}
              <div className="flex items-start justify-between mb-4">
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                  {story.category}
                </span>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Bookmark size={18} />
                </button>
              </div>

              {/* Headline */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {story.headline}
              </h3>

              {/* Summary */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {story.summary}
              </p>

              {/* Metadata */}
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
                <span>{story.source}</span>
                <span>•</span>
                <span>{story.time}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Link
                  href="/chat"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors text-center"
                >
                  Ask AI
                </Link>
                <button className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                  Read Summary
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
